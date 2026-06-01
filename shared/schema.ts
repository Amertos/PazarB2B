import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  pib: text("pib").notNull().unique(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  industry: text("industry").notNull(),
  logo: text("logo"),
  rating: doublePrecision("rating").default(0).notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  joinedDate: text("joined_date").notNull(),
  expoPushToken: text("expo_push_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  priceType: text("price_type").notNull(),
  price: doublePrecision("price"),
  priceUnit: text("price_unit"),
  location: text("location").notNull(),
  images: text("images").array().default([]).notNull(),
  companyId: varchar("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  quantity: text("quantity"),
  condition: text("condition"),
  transport: text("transport"),
  isAvailable: boolean("is_available").default(true).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedListings = pgTable("saved_listings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  companyId: varchar("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  companyAId: varchar("company_a_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  companyBId: varchar("company_b_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, {
    onDelete: "set null",
  }),
  lastMessage: text("last_message").default("").notNull(),
  lastMessageTime: timestamp("last_message_time").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  text: text("text").default("").notNull(),
  type: text("type").default("text").notNull(),
  locationLabel: text("location_label"),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  reviewerId: varchar("reviewer_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  revieweeId: varchar("reviewee_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type SavedListing = typeof savedListings.$inferSelect;

export type User = Company;
export type InsertUser = InsertCompany;
