import { int, mysqlEnum, mysqlTable, text, mediumtext, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Author profiles extending user accounts
 */
export const authors = mysqlTable("authors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  penName: varchar("penName", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 500 }),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Author = typeof authors.$inferSelect;
export type InsertAuthor = typeof authors.$inferInsert;

/**
 * Books table for storing book information and content
 */
export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull().references(() => authors.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  description: text("description"),
  content: mediumtext("content"), // Main manuscript content (supports up to 16MB)
  genre: varchar("genre", { length: 100 }),
  status: mysqlEnum("status", ["idea", "outlining", "drafting", "editing", "designed", "marketing", "published"]).default("idea").notNull(),
  coverUrl: varchar("coverUrl", { length: 500 }),
  wordCount: int("wordCount").default(0),
  targetWordCount: int("targetWordCount"),
  currentChapter: int("currentChapter").default(0),
  totalChapters: int("totalChapters"),
  // 2-Day Program tracking
  programDay: int("programDay").default(0), // 0 = not started, 1 = day 1, 2 = day 2, 3 = completed
  programStep: int("programStep").default(0),
  // Publishing materials
  copyrightPage: text("copyrightPage"), // Generated copyright page content
  backCoverCopy: text("backCoverCopy"), // Back cover description
  authorBio: text("authorBio"), // Author biography for back cover
  backCoverStyle: varchar("backCoverStyle", { length: 50 }), // professional, narrative, or problem-solution
  isbn: varchar("isbn", { length: 20 }),
  publisherName: varchar("publisherName", { length: 255 }),
  publisherWebsite: varchar("publisherWebsite", { length: 500 }),
  copyrightYear: int("copyrightYear"),
  // Ready to Publish workflow progress (saved automatically)
  workflowStep: varchar("workflowStep", { length: 50 }), // upload, analyzing, review, cover, amazon, export
  aiAnalysis: text("aiAnalysis"), // JSON: AI analysis results (titles, subtitles, description, etc.)
  selectedTitle: varchar("selectedTitle", { length: 500 }), // User's chosen title
  selectedSubtitle: varchar("selectedSubtitle", { length: 500 }), // User's chosen subtitle
  generatedCovers: text("generatedCovers"), // JSON: Array of generated cover URLs
  selectedCoverUrl: varchar("selectedCoverUrl", { length: 500 }), // User's chosen cover
  amazonCategories: text("amazonCategories"), // JSON: Selected Amazon categories
  amazonKeywords: text("amazonKeywords"), // JSON: Generated keywords
  suggestedPrice: varchar("suggestedPrice", { length: 20 }), // AI-suggested pricing
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

/**
 * Book chapters for structured content management
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content"),
  wordCount: int("wordCount").default(0),
  status: mysqlEnum("status", ["planned", "drafting", "completed", "edited"]).default("planned").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * Characters for fiction books
 */
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }), // protagonist, antagonist, supporting, etc.
  description: text("description"),
  traits: json("traits").$type<string[]>(), // personality traits
  backstory: text("backstory"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

/**
 * Book designs and covers
 */
export const bookDesigns = mysqlTable("bookDesigns", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  coverUrl: varchar("coverUrl", { length: 500 }),
  coverPrompt: text("coverPrompt"),
  designStyle: varchar("designStyle", { length: 100 }),
  // Export formats
  epubUrl: varchar("epubUrl", { length: 500 }),
  mobiUrl: varchar("mobiUrl", { length: 500 }),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookDesign = typeof bookDesigns.$inferSelect;
export type InsertBookDesign = typeof bookDesigns.$inferInsert;

/**
 * Marketing campaigns for books
 */
export const marketingCampaigns = mysqlTable("marketingCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["launch", "ongoing", "promotion", "funnel"]).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  // Landing page
  landingPageUrl: varchar("landingPageUrl", { length: 500 }),
  leadMagnetUrl: varchar("leadMagnetUrl", { length: 500 }),
  // Analytics
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

/**
 * Email sequences for marketing automation
 */
export const emailSequences = mysqlTable("emailSequences", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => marketingCampaigns.id, { onDelete: "cascade" }),
  sequenceNumber: int("sequenceNumber").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  content: text("content").notNull(),
  delayDays: int("delayDays").default(0),
  sentCount: int("sentCount").default(0),
  openRate: decimal("openRate", { precision: 5, scale: 2 }),
  clickRate: decimal("clickRate", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = typeof emailSequences.$inferInsert;

/**
 * Sales funnels for monetization
 */
export const salesFunnels = mysqlTable("salesFunnels", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull().references(() => marketingCampaigns.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  funnelType: mysqlEnum("funnelType", ["lead_magnet", "book_sale", "upsell", "course", "coaching"]).notNull(),
  config: json("config").$type<Record<string, unknown>>(), // Funnel configuration
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesFunnel = typeof salesFunnels.$inferSelect;
export type InsertSalesFunnel = typeof salesFunnels.$inferInsert;

/**
 * Amazon performance tracking
 */
export const amazonPerformance = mysqlTable("amazonPerformance", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  marketplace: mysqlEnum("marketplace", ["com", "uk", "sg"]).notNull(), // Amazon.com, .uk, .sg
  asin: varchar("asin", { length: 20 }),
  snapshotDate: timestamp("snapshotDate").notNull(),
  // Rankings
  salesRank: int("salesRank"),
  categoryRank: int("categoryRank"),
  category: varchar("category", { length: 255 }),
  // Reviews
  reviewsCount: int("reviewsCount").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }),
  // Sales estimates
  estimatedSales: int("estimatedSales"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AmazonPerformance = typeof amazonPerformance.$inferSelect;
export type InsertAmazonPerformance = typeof amazonPerformance.$inferInsert;

/**
 * Amazon listing optimization data
 */
export const amazonListings = mysqlTable("amazonListings", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  marketplace: mysqlEnum("marketplace", ["com", "uk", "sg"]).notNull(),
  asin: varchar("asin", { length: 20 }),
  // Optimization data
  keywords: json("keywords").$type<string[]>(),
  categories: json("categories").$type<string[]>(),
  optimizedTitle: varchar("optimizedTitle", { length: 500 }),
  optimizedDescription: text("optimizedDescription"),
  seoScore: int("seoScore"), // 0-100
  // Launch strategy
  launchDate: timestamp("launchDate"),
  launchChecklist: json("launchChecklist").$type<Record<string, boolean>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AmazonListing = typeof amazonListings.$inferSelect;
export type InsertAmazonListing = typeof amazonListings.$inferInsert;

/**
 * Publishing drafts for wizard state persistence
 * Allows users to save progress and resume from any step
 */
export const publishingDrafts = mysqlTable("publishingDrafts", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull().references(() => authors.id, { onDelete: "cascade" }),
  
  // Wizard progress
  currentStep: varchar("currentStep", { length: 50 }).notNull(), // "upload", "analyzing", "review", "cover", "amazon", "export"
  completionPercentage: int("completionPercentage").default(0), // 0-100
  
  // Step 1: Upload
  manuscript: text("manuscript"),
  wordCount: int("wordCount").default(0),
  
  // Step 2: AI Analysis
  aiAnalysis: json("aiAnalysis").$type<{
    suggestedTitles: string[];
    suggestedSubtitles: string[];
    detectedGenre: string;
    themes: string[];
    targetAudience: string;
    bookDescription: string;
    keyBenefits: string[];
    tone: string;
  }>(),
  
  // Step 3: Metadata
  selectedTitle: varchar("selectedTitle", { length: 500 }),
  selectedSubtitle: varchar("selectedSubtitle", { length: 500 }),
  description: text("description"),
  
  // Step 4: Categories
  categories: json("categories").$type<string[]>(),
  keywords: json("keywords").$type<string[]>(),
  
  // Step 5: Cover
  coverUrl: varchar("coverUrl", { length: 500 }),
  generatedCovers: json("generatedCovers").$type<Array<{ url: string; style: string }>>(),
  
  // Step 6: ISBN
  isbnChoice: varchar("isbnChoice", { length: 100 }), // "amazon-free", "purchase-own", "have-isbn"
  isbnNumber: varchar("isbnNumber", { length: 20 }),
  
  // Metadata
  lastSavedStep: varchar("lastSavedStep", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PublishingDraft = typeof publishingDrafts.$inferSelect;
export type InsertPublishingDraft = typeof publishingDrafts.$inferInsert;
