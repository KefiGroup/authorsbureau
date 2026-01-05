import { eq } from "drizzle-orm";
import { bookDesigns, type InsertBookDesign, type BookDesign } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new book cover design
 */
export async function createBookCover(data: {
  bookId: number;
  coverUrl: string;
  coverPrompt: string;
  designStyle: string;
}): Promise<BookDesign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const coverData: InsertBookDesign = {
    bookId: data.bookId,
    coverUrl: data.coverUrl,
    coverPrompt: data.coverPrompt,
    designStyle: data.designStyle,
  };

  const [result] = await db.insert(bookDesigns).values(coverData);
  
  // Fetch the created cover
  const [cover] = await db
    .select()
    .from(bookDesigns)
    .where(eq(bookDesigns.id, result.insertId));

  return cover;
}

/**
 * Get all covers for a book
 */
export async function getBookCovers(bookId: number): Promise<BookDesign[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const covers = await db
    .select()
    .from(bookDesigns)
    .where(eq(bookDesigns.bookId, bookId))
    .orderBy(bookDesigns.createdAt);

  return covers;
}

/**
 * Get a specific cover by ID
 */
export async function getBookCoverById(coverId: number): Promise<BookDesign | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [cover] = await db
    .select()
    .from(bookDesigns)
    .where(eq(bookDesigns.id, coverId));

  return cover || null;
}

/**
 * Delete a book cover
 */
export async function deleteBookCover(coverId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(bookDesigns).where(eq(bookDesigns.id, coverId));
}

/**
 * Update book's active cover URL
 */
export async function updateBookCoverUrl(bookId: number, coverUrl: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { books } = await import("../drizzle/schema");
  await db
    .update(books)
    .set({ coverUrl, updatedAt: new Date() })
    .where(eq(books.id, bookId));
}
