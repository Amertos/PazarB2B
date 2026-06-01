import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.resolve(process.cwd(), 'assets/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function saveBase64Images(base64Array: string[]): string[] {
  const urls: string[] = [];
  for (const item of base64Array) {
    if (item.startsWith('data:image/')) {
      const matches = item.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `${crypto.randomUUID()}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(filepath, buffer);
        urls.push(`/assets/uploads/${filename}`);
        continue;
      }
    }
    urls.push(item);
  }
  return urls;
}

const JWT_SECRET = process.env.JWT_SECRET || "pazar_b2b_secret_key_2026";

interface AuthRequest extends Request {
  companyId?: string;
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Niste prijavljeni" });
  }
  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string };
    req.companyId = decoded.companyId;
    next();
  } catch {
    return res.status(401).json({ message: "Nevažeći token" });
  }
}

function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string };
      req.companyId = decoded.companyId;
    } catch {}
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ─── AUTH ────────────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        pib: z.string().min(9),
        contactPerson: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().min(6),
        address: z.string().min(2),
        industry: z.string().min(2),
      });

      const data = schema.parse(req.body);

      const existing = await storage.getCompanyByEmail(data.email);
      if (existing) {
        return res.status(409).json({ message: "E-mail je već registrovan" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const company = await storage.createCompany({
        ...data,
        password: hashedPassword,
        joinedDate: new Date().toISOString().split("T")[0],
        logo: undefined,
      });

      const token = jwt.sign({ companyId: company.id }, JWT_SECRET, { expiresIn: "30d" });
      const { password: _, ...companyData } = company;
      res.status(201).json({ token, company: companyData });
    } catch (e: any) {
      if (e?.name === "ZodError") {
        return res.status(400).json({ message: "Podaci nisu ispravni", errors: e.errors });
      }
      res.status(500).json({ message: e.message || "Greška pri registraciji" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Unesite e-mail i lozinku" });
      }

      const company = await storage.getCompanyByEmail(email.toLowerCase().trim());
      if (!company) {
        return res.status(401).json({ message: "Pogrešan e-mail ili lozinka" });
      }

      const match = await bcrypt.compare(password, company.password);
      if (!match) {
        return res.status(401).json({ message: "Pogrešan e-mail ili lozinka" });
      }

      const token = jwt.sign({ companyId: company.id }, JWT_SECRET, { expiresIn: "30d" });
      const { password: _, ...companyData } = company;
      res.json({ token, company: companyData });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Greška pri prijavi" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const company = await storage.getCompany(req.companyId!);
      if (!company) return res.status(404).json({ message: "Korisnik nije pronađen" });
      const { password: _, ...companyData } = company;
      res.json(companyData);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/auth/profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { password: _p, id: _id, logo, ...data } = req.body;
      let finalLogo = logo;
      if (logo && logo.startsWith("data:image/")) {
        const saved = saveBase64Images([logo]);
        if (saved.length > 0) finalLogo = saved[0];
      }
      
      const updated = await storage.updateCompany(req.companyId!, { ...data, logo: finalLogo });
      if (!updated) return res.status(404).json({ message: "Korisnik nije pronađen" });
      const { password: _, ...companyData } = updated;
      res.json(companyData);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ─── LISTINGS ───────────────────────────────────────────────────────────────

  app.get("/api/listings", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const { category, search, limit, offset } = req.query as any;
      const results = await storage.getListings({ 
        category, 
        search,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      });
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/listings/mine", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const myListings = await storage.getListingsByCompany(req.companyId!);
      res.json(myListings);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/listings/saved", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const savedIds = await storage.getSavedListings(req.companyId!);
      res.json(savedIds);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/listings/:id", optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const listing = await storage.getListingById(id);
      if (!listing) return res.status(404).json({ message: "Oglas nije pronađen" });
      await storage.incrementListingViews(id);
      res.json(listing);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/listings", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const schema = z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        category: z.string().min(1),
        subcategory: z.string().optional(),
        priceType: z.enum(["sale", "free"]),
        price: z.number().optional(),
        priceUnit: z.string().optional(),
        location: z.string().min(2),
        images: z.array(z.string()).default([]),
        quantity: z.string().optional(),
        condition: z.string().optional(),
        transport: z.string().optional(),
      });

      const data = schema.parse(req.body);
      const processedImages = data.images.length > 0 ? saveBase64Images(data.images) : [];
      
      const listing = await storage.createListing({
        ...data,
        images: processedImages,
        companyId: req.companyId!,
        isAvailable: true,
      });
      res.status(201).json(listing);
    } catch (e: any) {
      if (e?.name === "ZodError") {
        return res.status(400).json({ message: "Podaci nisu ispravni", errors: e.errors });
      }
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/listings/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const listing = await storage.getListingById(id);
      if (!listing) return res.status(404).json({ message: "Oglas nije pronađen" });
      if (listing.companyId !== req.companyId) return res.status(403).json({ message: "Nedozvoljena akcija" });

      const updated = await storage.updateListing(id, req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/listings/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteListing(id, req.companyId!);
      if (!deleted) return res.status(404).json({ message: "Oglas nije pronađen ili nemate dozvolu" });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/listings/:id/save", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const saved = await storage.toggleSavedListing(req.companyId!, id);
      res.json({ saved });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ─── CONVERSATIONS & MESSAGES ────────────────────────────────────────────────

  app.get("/api/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const convs = await storage.getConversations(req.companyId!);
      res.json(convs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/conversations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { companyBId, listingId } = req.body;
      if (!companyBId) return res.status(400).json({ message: "companyBId je obavezan" });

      const conv = await storage.findOrCreateConversation(req.companyId!, companyBId, listingId);
      res.json(conv);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/conversations/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const conv = await storage.getConversation(id);
      if (!conv) return res.status(404).json({ message: "Razgovor nije pronađen" });
      if (conv.companyAId !== req.companyId && conv.companyBId !== req.companyId) {
        return res.status(403).json({ message: "Nedozvoljena akcija" });
      }

      await storage.markMessagesRead(id, req.companyId!);
      const msgs = await storage.getMessages(id);
      res.json(msgs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/conversations/:id/messages", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      const conv = await storage.getConversation(id);
      if (!conv) return res.status(404).json({ message: "Razgovor nije pronađen" });
      if (conv.companyAId !== req.companyId && conv.companyBId !== req.companyId) {
        return res.status(403).json({ message: "Nedozvoljena akcija" });
      }

      const { text, type, locationLabel, fileName, fileSize } = req.body;
      const msg = await storage.createMessage({
        conversationId: id,
        senderId: req.companyId!,
        text: text ?? "",
        type: type ?? "text",
        locationLabel,
        fileName,
        fileSize,
      });
      res.status(201).json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/unread-count", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const count = await storage.getUnreadCount(req.companyId!);
      res.json({ count });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ─── REVIEWS ─────────────────────────────────────────────────────────────────

  app.get("/api/companies/:id/reviews", async (req, res) => {
    try {
      const id = req.params.id as string;
      const revs = await storage.getReviews(id);
      res.json(revs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const id = req.params.id as string;
      const company = await storage.getCompany(id);
      if (!company) return res.status(404).json({ message: "Firma nije pronađena" });
      const { password: _, ...companyData } = company;
      res.json(companyData);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/companies/:id/reviews", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const id = req.params.id as string;
      if (id === req.companyId) {
        return res.status(400).json({ message: "Ne možete oceniti sami sebe" });
      }
      const { rating, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Ocena mora biti između 1 i 5" });
      }
      const review = await storage.createReview({
        reviewerId: req.companyId!,
        revieweeId: id,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
