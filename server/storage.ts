import { db } from "./db";
import {
  companies,
  listings,
  savedListings,
  conversations,
  messages,
  reviews,
  type Company,
  type InsertCompany,
  type Listing,
  type InsertListing,
  type Conversation,
  type Message,
  type Review,
} from "@shared/schema";
import { eq, desc, and, or, ilike, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Companies / Auth
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  createCompany(data: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined>;

  // Listings
  getListings(filter?: { category?: string; search?: string; limit?: number; offset?: number; minPrice?: number; maxPrice?: number; condition?: string; location?: string }): Promise<(Listing & { companyName: string; companyRating: number; companyReviewCount: number })[]>;
  getListingById(id: string): Promise<(Listing & { companyName: string; companyRating: number; companyReviewCount: number }) | undefined>;
  getListingsByCompany(companyId: string): Promise<Listing[]>;
  createListing(data: InsertListing): Promise<Listing>;
  updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined>;
  deleteListing(id: string, companyId: string): Promise<boolean>;
  incrementListingViews(id: string): Promise<void>;

  // Saved listings
  getSavedListings(companyId: string): Promise<string[]>;
  toggleSavedListing(companyId: string, listingId: string): Promise<boolean>;

  // Conversations
  getConversations(companyId: string): Promise<any[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  findOrCreateConversation(companyAId: string, companyBId: string, listingId?: string): Promise<Conversation>;

  // Messages
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(data: { conversationId: string; senderId: string; text: string; type: string; locationLabel?: string; fileName?: string; fileSize?: string }): Promise<Message>;
  markMessagesRead(conversationId: string, readerId: string): Promise<void>;
  getUnreadCount(companyId: string): Promise<number>;

  // Reviews
  getReviews(revieweeId: string): Promise<(Review & { reviewerName: string })[]>;
  createReview(data: { reviewerId: string; revieweeId: string; rating: number; comment?: string }): Promise<Review>;
}

export class DbStorage implements IStorage {
  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0];
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.email, email)).limit(1);
    return result[0];
  }

  async createCompany(data: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(data).returning();
    return result[0];
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company | undefined> {
    const { id: _id, createdAt: _ca, ...updateData } = data as any;
    const result = await db.update(companies).set(updateData).where(eq(companies.id, id)).returning();
    return result[0];
  }

  async getListings(filter?: { category?: string; search?: string; limit?: number; offset?: number; minPrice?: number; maxPrice?: number; condition?: string; location?: string }) {
    let query = db
      .select({
        listing: listings,
        companyName: companies.name,
        companyRating: companies.rating,
        companyReviewCount: companies.reviewCount,
      })
      .from(listings)
      .leftJoin(companies, eq(listings.companyId, companies.id))
      .where(
        and(
          eq(listings.isAvailable, true),
          filter?.category ? eq(listings.category, filter.category) : undefined,
          filter?.condition ? eq(listings.condition, filter.condition) : undefined,
          filter?.minPrice ? gte(listings.price, filter.minPrice) : undefined,
          filter?.maxPrice ? lte(listings.price, filter.maxPrice) : undefined,
          filter?.location ? ilike(listings.location, `%${filter.location}%`) : undefined,
          filter?.search
            ? or(
                ilike(listings.title, `%${filter.search}%`),
                ilike(listings.description, `%${filter.search}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(listings.createdAt));

    if (filter?.limit) {
      // @ts-ignore
      query = query.limit(filter.limit);
    }
    if (filter?.offset) {
      // @ts-ignore
      query = query.offset(filter.offset);
    }

    const rows = await query;

    return rows.map((r) => ({
      ...r.listing,
      companyName: r.companyName ?? "",
      companyRating: r.companyRating ?? 0,
      companyReviewCount: r.companyReviewCount ?? 0,
    }));
  }

  async getListingById(id: string) {
    const rows = await db
      .select({
        listing: listings,
        companyName: companies.name,
        companyRating: companies.rating,
        companyReviewCount: companies.reviewCount,
      })
      .from(listings)
      .leftJoin(companies, eq(listings.companyId, companies.id))
      .where(eq(listings.id, id))
      .limit(1);

    if (!rows[0]) return undefined;
    const r = rows[0];
    return {
      ...r.listing,
      companyName: r.companyName ?? "",
      companyRating: r.companyRating ?? 0,
      companyReviewCount: r.companyReviewCount ?? 0,
    };
  }

  async getListingsByCompany(companyId: string): Promise<Listing[]> {
    return db.select().from(listings).where(eq(listings.companyId, companyId)).orderBy(desc(listings.createdAt));
  }

  async createListing(data: InsertListing): Promise<Listing> {
    const result = await db.insert(listings).values(data).returning();
    return result[0];
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<Listing | undefined> {
    const { id: _id, createdAt: _ca, companyId: _cid, ...updateData } = data as any;
    const result = await db.update(listings).set(updateData).where(eq(listings.id, id)).returning();
    return result[0];
  }

  async deleteListing(id: string, companyId: string): Promise<boolean> {
    const result = await db.delete(listings).where(and(eq(listings.id, id), eq(listings.companyId, companyId))).returning();
    return result.length > 0;
  }

  async incrementListingViews(id: string): Promise<void> {
    await db.update(listings).set({ viewCount: sql`${listings.viewCount} + 1` }).where(eq(listings.id, id));
  }

  async getSavedListings(companyId: string): Promise<string[]> {
    const rows = await db.select({ listingId: savedListings.listingId }).from(savedListings).where(eq(savedListings.companyId, companyId));
    return rows.map((r) => r.listingId);
  }

  async toggleSavedListing(companyId: string, listingId: string): Promise<boolean> {
    const existing = await db.select().from(savedListings).where(and(eq(savedListings.companyId, companyId), eq(savedListings.listingId, listingId))).limit(1);
    if (existing.length > 0) {
      await db.delete(savedListings).where(and(eq(savedListings.companyId, companyId), eq(savedListings.listingId, listingId)));
      return false;
    } else {
      await db.insert(savedListings).values({ companyId, listingId });
      return true;
    }
  }

  async getConversations(companyId: string): Promise<any[]> {
    const rows = await db
      .select({
        conv: conversations,
        companyA: { id: companies.id, name: companies.name },
      })
      .from(conversations)
      .leftJoin(companies, or(
        and(eq(conversations.companyAId, companyId), eq(companies.id, conversations.companyBId)),
        and(eq(conversations.companyBId, companyId), eq(companies.id, conversations.companyAId)),
      ))
      .where(or(eq(conversations.companyAId, companyId), eq(conversations.companyBId, companyId)))
      .orderBy(desc(conversations.lastMessageTime));

    const result = await Promise.all(
      rows.map(async (r) => {
        const unreadCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(messages)
          .where(and(
            eq(messages.conversationId, r.conv.id),
            eq(messages.isRead, false),
            sql`${messages.senderId} != ${companyId}`,
          ));

        const listing = r.conv.listingId
          ? await db.select({ title: listings.title }).from(listings).where(eq(listings.id, r.conv.listingId)).limit(1)
          : [];

        return {
          ...r.conv,
          otherCompanyId: r.companyA?.id ?? "",
          otherCompanyName: r.companyA?.name ?? "Nepoznata firma",
          listingTitle: listing[0]?.title,
          unread: Number(unreadCount[0]?.count ?? 0),
        };
      }),
    );

    return result;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    return result[0];
  }

  async findOrCreateConversation(companyAId: string, companyBId: string, listingId?: string): Promise<Conversation> {
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          listingId ? eq(conversations.listingId, listingId) : sql`true`,
          or(
            and(eq(conversations.companyAId, companyAId), eq(conversations.companyBId, companyBId)),
            and(eq(conversations.companyAId, companyBId), eq(conversations.companyBId, companyAId)),
          ),
        ),
      )
      .limit(1);

    if (existing[0]) return existing[0];

    const result = await db.insert(conversations).values({
      companyAId,
      companyBId,
      listingId: listingId ?? null,
      lastMessage: "",
    }).returning();

    return result[0];
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    text: string;
    type: string;
    locationLabel?: string;
    fileName?: string;
    fileSize?: string;
  }): Promise<Message> {
    const result = await db.insert(messages).values(data).returning();
    const msg = result[0];

    await db.update(conversations).set({
      lastMessage: data.text || data.fileName || data.locationLabel || "",
      lastMessageTime: new Date(),
    }).where(eq(conversations.id, data.conversationId));

    return msg;
  }

  async markMessagesRead(conversationId: string, readerId: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false),
        sql`${messages.senderId} != ${readerId}`,
      ),
    );
  }

  async getUnreadCount(companyId: string): Promise<number> {
    const convs = await db.select({ id: conversations.id }).from(conversations).where(
      or(eq(conversations.companyAId, companyId), eq(conversations.companyBId, companyId)),
    );

    if (convs.length === 0) return 0;

    const convIds = convs.map((c) => c.id);
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          sql`${messages.conversationId} = ANY(${sql`ARRAY[${sql.join(convIds.map(id => sql`${id}`), sql`, `)}]`})`,
          eq(messages.isRead, false),
          sql`${messages.senderId} != ${companyId}`,
        ),
      );

    return Number(result[0]?.count ?? 0);
  }

  async getReviews(revieweeId: string): Promise<(Review & { reviewerName: string })[]> {
    const rows = await db
      .select({
        review: reviews,
        reviewerName: companies.name,
      })
      .from(reviews)
      .leftJoin(companies, eq(reviews.reviewerId, companies.id))
      .where(eq(reviews.revieweeId, revieweeId))
      .orderBy(desc(reviews.createdAt));

    return rows.map((r) => ({ ...r.review, reviewerName: r.reviewerName ?? "Anonimno" }));
  }

  async createReview(data: { reviewerId: string; revieweeId: string; rating: number; comment?: string }): Promise<Review> {
    const result = await db.insert(reviews).values(data).returning();

    const avgResult = await db
      .select({ avg: sql<number>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
      .from(reviews)
      .where(eq(reviews.revieweeId, data.revieweeId));

    if (avgResult[0]) {
      await db.update(companies).set({
        rating: Math.round((avgResult[0].avg ?? 0) * 10) / 10,
        reviewCount: Number(avgResult[0].count),
      }).where(eq(companies.id, data.revieweeId));
    }

    return result[0];
  }
}

export const storage = new DbStorage();
