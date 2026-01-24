import { int, mysqlEnum, mysqlTable, text, mediumtext, timestamp, varchar, decimal, boolean, json, unique } from "drizzle-orm/mysql-core";

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
  bio: text("bio"), // Author biography (2000 char max for Amazon Author Central)
  website: varchar("website", { length: 500 }),
  linkedInUrl: varchar("linkedInUrl", { length: 500 }), // LinkedIn profile URL (optional)
  avatarUrl: varchar("avatarUrl", { length: 500 }), // Profile photo URL (min 300x300px)
  booksAuthored: text("booksAuthored"), // Previous books authored (comma-separated or JSON)
  accomplishments: text("accomplishments"), // Professional accomplishments and awards
  education: text("education"), // Educational background
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
}, (table) => ({
  uniqueTitlePerAuthor: unique().on(table.title, table.authorId),
}));

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

/**
 * Story blueprints for "Start Your Writing Process" feature
 * Stores structured story planning data from agentic AI conversation
 */
export const storyBlueprints = mysqlTable("storyBlueprints", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").references(() => books.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Project Foundation
  projectType: mysqlEnum("projectType", ["novel", "novella", "short_story", "memoir", "non_fiction", "childrens_book"]).notNull(),
  workingTitle: varchar("workingTitle", { length: 500 }),
  targetLength: varchar("targetLength", { length: 100 }), // e.g., "80,000-100,000 words", "50 pages"
  targetPages: int("targetPages"), // User-selected page count (150, 200, 250, 300)
  primaryGenre: varchar("primaryGenre", { length: 100 }),
  secondaryGenre: varchar("secondaryGenre", { length: 100 }),
  
  // Story Elements
  corePremise: text("corePremise"), // One-sentence story summary
  timePeriod: varchar("timePeriod", { length: 255 }),
  location: varchar("location", { length: 255 }),
  pointOfView: varchar("pointOfView", { length: 50 }), // first-person, third-person, etc.
  
  // Character Development (stored as JSON)
  protagonistData: json("protagonistData").$type<{
    name: string;
    traits: string[];
    goal: string;
    obstacle: string;
  }>(),
  supportingCharacters: json("supportingCharacters").$type<Array<{
    name: string;
    role: string;
    relationship: string;
  }>>(),
  
  // Plot Structure (stored as JSON)
  plotStructure: json("plotStructure").$type<{
    incitingIncident: string;
    centralConflict: string;
    stakes: string;
    intendedEndingTone: string;
  }>(),
  
  // Setting Data (stored as JSON)
  settingData: json("settingData").$type<{
    timePeriod: string;
    locations: string[];
    worldBuildingNotes?: string;
  }>(),
  
  // Audience & Market (stored as JSON)
  audienceData: json("audienceData").$type<{
    targetReader: string;
    comparableTitles: string[];
    uniqueAngle: string;
    contentWarnings?: string[];
  }>(),
  
  // Thematic Elements (stored as JSON)
  thematicElements: json("thematicElements").$type<{
    centralTheme: string;
    recurringSymbols?: string[];
    emotionalJourney: string;
  }>(),
  
  // AI Conversation History (stored as JSON)
  conversationHistory: json("conversationHistory").$type<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>(),
  
  // Conversation State
  currentSection: text("currentSection"), // Current conversation section
  completedSections: json("completedSections").$type<string[]>(), // Array of completed section names
  
  // V2 Conversation Mode
  conversationMode: mysqlEnum("conversationMode", ["initial_questions", "blueprint_generation", "refinement"]).default("initial_questions"),
  essentialData: json("essentialData").$type<{
    projectType?: string;
    briefDescription?: string;
    targetAudience?: string;
    workingTitle?: string;
  }>(),
  
  // Blueprint Generation
  blueprintGenerated: boolean("blueprintGenerated").default(false),
  blueprintContent: mediumtext("blueprintContent"), // Full generated blueprint in markdown
  finalCheckpointData: text("finalCheckpointData"), // JSON: Final checkpoint preferences (tone, style, elements, etc.)
  
  // Manuscript Writing Progress
  manuscriptStarted: boolean("manuscriptStarted").default(false),
  manuscriptCompleted: boolean("manuscriptCompleted").default(false),
  
  // Versioning
  version: int("version").default(1),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StoryBlueprint = typeof storyBlueprints.$inferSelect;
export type InsertStoryBlueprint = typeof storyBlueprints.$inferInsert;

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
 * Chapter outlines generated from blueprints
 */
export const chapterOutlines = mysqlTable("chapterOutlines", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull().references(() => storyBlueprints.id, { onDelete: "cascade" }),
  outline: json("outline").notNull(), // Stores the chapter-by-chapter outline as JSON
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChapterOutline = typeof chapterOutlines.$inferSelect;
export type InsertChapterOutline = typeof chapterOutlines.$inferInsert;

/**
 * Book structure selections (optional sections)
 */
export const bookStructures = mysqlTable("bookStructures", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull().references(() => storyBlueprints.id, { onDelete: "cascade" }),
  hasPrologue: boolean("hasPrologue").default(false).notNull(),
  hasCopyright: boolean("hasCopyright").default(true).notNull(), // Default true - required for publishing
  hasDedication: boolean("hasDedication").default(false).notNull(),
  hasAcknowledgements: boolean("hasAcknowledgements").default(false).notNull(),
  hasEpilogue: boolean("hasEpilogue").default(false).notNull(),
  hasAuthorBio: boolean("hasAuthorBio").default(true).notNull(), // Default true - most books have this
  hasAlsoBy: boolean("hasAlsoBy").default(false).notNull(),
  hasNewsletter: boolean("hasNewsletter").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookStructure = typeof bookStructures.$inferSelect;
export type InsertBookStructure = typeof bookStructures.$inferInsert;

/**
 * Manuscripts - stores generated chapter content
 */
export const manuscripts = mysqlTable("manuscripts", {
  id: int("id").autoincrement().primaryKey(),
  blueprintId: int("blueprintId").notNull().references(() => storyBlueprints.id, { onDelete: "cascade" }),
  sectionType: mysqlEnum("sectionType", ["prologue", "copyright", "chapter", "epilogue", "dedication", "acknowledgements", "authorBio", "alsoBy", "newsletter"]).notNull(),
  sectionNumber: int("sectionNumber"), // Chapter number (null for non-chapter sections)
  sectionTitle: varchar("sectionTitle", { length: 500 }),
  content: mediumtext("content"), // Generated chapter/section content
  status: mysqlEnum("status", ["pending", "generating", "draft", "approved"]).default("pending").notNull(),
  wordCount: int("wordCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manuscript = typeof manuscripts.$inferSelect;
export type InsertManuscript = typeof manuscripts.$inferInsert;

/**
 * Chapter edits - stores AI chat history for editing chapters
 */
export const chapterEdits = mysqlTable("chapterEdits", {
  id: int("id").autoincrement().primaryKey(),
  manuscriptId: int("manuscriptId").notNull().references(() => manuscripts.id, { onDelete: "cascade" }),
  userMessage: text("userMessage").notNull(),
  aiResponse: mediumtext("aiResponse").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type ChapterEdit = typeof chapterEdits.$inferSelect;
export type InsertChapterEdit = typeof chapterEdits.$inferInsert;

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


/**
 * AI Recommendation Feedback - Track user feedback on AI accuracy
 */
export const aiRecommendationFeedback = mysqlTable("ai_recommendation_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: int("bookId").references(() => books.id, { onDelete: "cascade" }),
  recommendationType: varchar("recommendationType", { length: 50 }).notNull(), // "category", "title", "description", "keyword", "cover"
  recommendationData: json("recommendationData"), // Store the actual recommendation
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }), // 0.00 to 1.00
  userRating: int("userRating"), // 1-5 stars
  userFeedback: text("userFeedback"), // Optional text feedback
  wasUsed: boolean("wasUsed").default(false), // Did user actually use this recommendation?
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIRecommendationFeedback = typeof aiRecommendationFeedback.$inferSelect;
export type InsertAIRecommendationFeedback = typeof aiRecommendationFeedback.$inferInsert;

/**
 * Book Success Metrics - Track actual performance data
 */
export const bookSuccessMetrics = mysqlTable("book_success_metrics", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  // Amazon Performance
  amazonBSR: int("amazonBSR"), // Best Sellers Rank
  kindleBSR: int("kindleBSR"), // Kindle Store Rank
  categoryRanks: json("categoryRanks").$type<Array<{ category: string; rank: number }>>(),
  reviewCount: int("reviewCount").default(0),
  averageRating: decimal("averageRating", { precision: 2, scale: 1 }), // 0.0 to 5.0
  estimatedSales: int("estimatedSales"), // Estimated daily sales
  // Pricing
  currentPrice: decimal("currentPrice", { precision: 5, scale: 2 }),
  // Categories & Keywords used
  publishedCategories: json("publishedCategories").$type<string[]>(),
  publishedKeywords: json("publishedKeywords").$type<string[]>(),
  // Metadata snapshot
  publishedTitle: varchar("publishedTitle", { length: 500 }),
  publishedGenre: varchar("publishedGenre", { length: 100 }),
  publishedCoverStyle: varchar("publishedCoverStyle", { length: 50 }),
  // Tracking
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookSuccessMetrics = typeof bookSuccessMetrics.$inferSelect;
export type InsertBookSuccessMetrics = typeof bookSuccessMetrics.$inferInsert;

/**
 * Success Patterns - Aggregated insights from successful books
 */
export const successPatterns = mysqlTable("success_patterns", {
  id: int("id").autoincrement().primaryKey(),
  patternType: varchar("patternType", { length: 50 }).notNull(), // "category", "keyword", "cover_style", "title_format", "pricing"
  patternValue: varchar("patternValue", { length: 500 }).notNull(), // The specific pattern (e.g., "Books > Self-Help > Emotions")
  genre: varchar("genre", { length: 100 }), // Genre this pattern applies to
  successCount: int("successCount").default(0), // Number of successful books using this pattern
  averageBSR: int("averageBSR"), // Average BSR of books using this pattern
  averageRating: decimal("averageRating", { precision: 2, scale: 1 }),
  averageSales: int("averageSales"), // Average estimated daily sales
  confidenceLevel: decimal("confidenceLevel", { precision: 3, scale: 2 }), // Statistical confidence (0.00 to 1.00)
  sampleSize: int("sampleSize").default(0), // Number of data points
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SuccessPattern = typeof successPatterns.$inferSelect;
export type InsertSuccessPattern = typeof successPatterns.$inferInsert;
