import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
import { InsertUser, users, authors, InsertAuthor, books, chapters, characters, bookDesigns, marketingCampaigns, emailSequences, salesFunnels, amazonPerformance, amazonListings, storyBlueprints, InsertStoryBlueprint } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Author profile functions
export async function getAuthorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(authors).where(eq(authors.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAuthorProfile(authorData: InsertAuthor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(authors).values(authorData);
  return result;
}

export async function updateAuthorProfile(authorId: number, authorData: Partial<InsertAuthor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(authors).set(authorData).where(eq(authors.id, authorId));
}

export async function getAllAuthors() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(authors);
}

// Story Blueprint functions
export async function createStoryBlueprint(blueprintData: InsertStoryBlueprint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(storyBlueprints).values(blueprintData);
  const insertId = Number(result[0].insertId);
  
  // Return the created blueprint
  return await getStoryBlueprintById(insertId);
}

export async function getStoryBlueprintByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(storyBlueprints).where(eq(storyBlueprints.bookId, bookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoryBlueprintById(blueprintId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(storyBlueprints).where(eq(storyBlueprints.id, blueprintId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStoryBlueprint(blueprintId: number, blueprintData: Partial<InsertStoryBlueprint>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(storyBlueprints).set(blueprintData).where(eq(storyBlueprints.id, blueprintId));
}

export async function listUserBlueprints(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(storyBlueprints).where(eq(storyBlueprints.userId, userId));
}

// Book functions
export async function getBooksByAuthorId(authorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(books).where(eq(books.authorId, authorId));
}

export async function getBookById(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(books).where(eq(books.id, bookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookByTitleAndAuthor(title: string, authorId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(books)
    .where(and(eq(books.title, title), eq(books.authorId, authorId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBook(bookData: typeof books.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Use raw SQL to bypass Drizzle ORM bug with default values
  // Build dynamic SQL based on provided fields
  const fields: string[] = [];
  const values: any[] = [];
  
  if (bookData.authorId !== undefined) {
    fields.push('authorId');
    values.push(bookData.authorId);
  }
  if (bookData.title !== undefined) {
    fields.push('title');
    values.push(bookData.title);
  }
  if (bookData.subtitle !== undefined) {
    fields.push('subtitle');
    values.push(bookData.subtitle);
  }
  if (bookData.description !== undefined) {
    fields.push('description');
    values.push(bookData.description);
  }
  if (bookData.content !== undefined) {
    fields.push('content');
    values.push(bookData.content);
  }
  if (bookData.genre !== undefined) {
    fields.push('genre');
    values.push(bookData.genre);
  }
  if (bookData.status !== undefined) {
    fields.push('status');
    values.push(bookData.status);
  }
  if (bookData.wordCount !== undefined) {
    fields.push('wordCount');
    values.push(bookData.wordCount);
  }
  if (bookData.targetWordCount !== undefined) {
    fields.push('targetWordCount');
    values.push(bookData.targetWordCount);
  }

  // Build raw SQL query using mysql2 directly to bypass Drizzle ORM bug
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  
  try {
    const placeholders = values.map(() => '?').join(', ');
    const fieldNames = fields.join(', ');
    const query = `INSERT INTO books (${fieldNames}) VALUES (${placeholders})`;
    
    const [result] = await connection.execute(query, values);
    const insertId = (result as any).insertId;
    
    await connection.end();
    
    // Fetch and return the created book
    const createdBook = await getBookById(insertId);
    if (!createdBook) {
      throw new Error(`Failed to fetch created book with ID ${insertId}`);
    }
    return createdBook;
  } catch (error) {
    await connection.end();
    throw error;
  }
}

export async function updateBook(bookId: number, bookData: Partial<typeof books.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(books).set(bookData).where(eq(books.id, bookId));
}

export async function deleteBook(bookId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(books).where(eq(books.id, bookId));
}

// Chapter functions
export async function getChaptersByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(chapters).where(eq(chapters.bookId, bookId));
}

export async function createChapter(chapterData: typeof chapters.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chapters).values(chapterData);
  return result;
}

export async function updateChapter(chapterId: number, chapterData: Partial<typeof chapters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(chapters).set(chapterData).where(eq(chapters.id, chapterId));
}

// Character functions
export async function getCharactersByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(characters).where(eq(characters.bookId, bookId));
}

export async function createCharacter(characterData: typeof characters.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(characters).values(characterData);
  return result;
}

export async function updateCharacter(characterId: number, characterData: Partial<typeof characters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(characters).set(characterData).where(eq(characters.id, characterId));
}

// Marketing campaign functions
export async function getCampaignsByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.bookId, bookId));
}

export async function createCampaign(campaignData: typeof marketingCampaigns.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(marketingCampaigns).values(campaignData);
  return result;
}

export async function updateCampaign(campaignId: number, campaignData: Partial<typeof marketingCampaigns.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(marketingCampaigns).set(campaignData).where(eq(marketingCampaigns.id, campaignId));
}

// Amazon performance functions
export async function getAmazonPerformanceByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(amazonPerformance).where(eq(amazonPerformance.bookId, bookId));
}

export async function createAmazonPerformance(performanceData: typeof amazonPerformance.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(amazonPerformance).values(performanceData);
  return result;
}

// Amazon listing functions
export async function getAmazonListingByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(amazonListings).where(eq(amazonListings.bookId, bookId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAmazonListing(listingData: typeof amazonListings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(amazonListings).values(listingData);
  return result;
}

export async function updateAmazonListing(listingId: number, listingData: Partial<typeof amazonListings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(amazonListings).set(listingData).where(eq(amazonListings.id, listingId));
}
