import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

let userIdCounter = Date.now(); // Use timestamp to ensure uniqueness across test runs

async function createAuthContext(role: "admin" | "user" = "user"): Promise<TrpcContext> {
  const userId = userIdCounter++;
  const openId = `test-user-${userId}`;
  
  // Create user in database first to satisfy foreign key constraint
  await db.upsertUser({
    openId: openId,
    name: `Test Author ${userId}`,
    email: `author${userId}@example.com`,
    loginMethod: "manus",
    role: role,
    lastSignedIn: new Date(),
  });

  // Retrieve the actual user from database to get the correct ID
  const dbUser = await db.getUserByOpenId(openId);
  if (!dbUser) {
    throw new Error("Failed to create user in database");
  }

  const user: AuthenticatedUser = {
    id: dbUser.id,
    openId: dbUser.openId,
    email: dbUser.email,
    name: dbUser.name,
    loginMethod: dbUser.loginMethod,
    role: dbUser.role,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
    lastSignedIn: dbUser.lastSignedIn,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Author Profile Management", () => {
  it("should create and retrieve author profile", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create profile
    const createResult = await caller.author.createProfile({
      penName: "Test Author",
      bio: "A test author biography",
      website: "https://testauthor.com",
    });

    expect(createResult).toEqual({ success: true });

    // Retrieve profile
    const profile = await caller.author.getProfile();
    expect(profile).toBeDefined();
    if (profile) {
      expect(profile.penName).toBe("Test Author");
      expect(profile.bio).toBe("A test author biography");
      expect(profile.website).toBe("https://testauthor.com");
    }
  });

  it("should update author profile", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create initial profile
    await caller.author.createProfile({
      penName: "Original Name",
      bio: "Original bio",
    });

    // Update profile
    const updateResult = await caller.author.updateProfile({
      penName: "Updated Name",
      bio: "Updated bio",
      website: "https://updated.com",
    });

    expect(updateResult).toEqual({ success: true });

    // Verify update
    const profile = await caller.author.getProfile();
    expect(profile?.penName).toBe("Updated Name");
    expect(profile?.bio).toBe("Updated bio");
    expect(profile?.website).toBe("https://updated.com");
  });
});

describe("Book Management", () => {
  it("should create and retrieve books", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create author profile first
    await caller.author.createProfile({
      penName: "Book Author",
      bio: "Writes books",
    });

    // Create first book
    await caller.book.create({
      title: "First Book",
      subtitle: "A great story",
      genre: "Fiction",
      targetWordCount: 50000,
    });

    // Create second book
    await caller.book.create({
      title: "Second Book",
      genre: "Non-Fiction",
    });

    // Get all books
    const books = await caller.book.getMyBooks();

    expect(books).toBeDefined();
    expect(books.length).toBe(2);
    expect(books.some((b) => b.title === "First Book")).toBe(true);
    expect(books.some((b) => b.title === "Second Book")).toBe(true);
  });

  it("should update and delete books", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create author profile
    await caller.author.createProfile({
      penName: "Test Author",
      bio: "Tests books",
    });

    // Create book
    await caller.book.create({
      title: "Test Book",
      genre: "Fiction",
    });

    // Get the book
    let books = await caller.book.getMyBooks();
    const bookId = books[0]?.id;

    if (!bookId) {
      throw new Error("Book not created");
    }

    // Update book
    await caller.book.update({
      bookId,
      title: "Updated Title",
      description: "A new description",
      status: "drafting",
    });

    // Verify update
    const updatedBook = await caller.book.getById({ bookId });
    expect(updatedBook.title).toBe("Updated Title");
    expect(updatedBook.description).toBe("A new description");
    expect(updatedBook.status).toBe("drafting");

    // Delete book
    await caller.book.delete({ bookId });

    // Verify deletion
    books = await caller.book.getMyBooks();
    expect(books.some((b) => b.id === bookId)).toBe(false);
  });

  it("should require author profile before creating book", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Try to create book without author profile
    try {
      await caller.book.create({
        title: "Book Without Profile",
        genre: "Fiction",
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error.message).toContain("Author profile required");
    }
  });
});

describe("Chapter Management", () => {
  it("should create and retrieve chapters", async () => {
    const ctx = await createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Setup: Create author and book
    await caller.author.createProfile({
      penName: "Chapter Author",
      bio: "Writes chapters",
    });

    await caller.book.create({
      title: "Book with Chapters",
      genre: "Fiction",
    });

    const books = await caller.book.getMyBooks();
    const bookId = books[0]?.id;

    if (!bookId) {
      throw new Error("Book not created");
    }

    // Create chapters
    await caller.chapter.create({
      bookId,
      chapterNumber: 1,
      title: "Chapter One",
      content: "Once upon a time...",
    });

    await caller.chapter.create({
      bookId,
      chapterNumber: 2,
      title: "Chapter Two",
      content: "The story continues...",
    });

    // Verify chapters
    const chapters = await caller.chapter.getByBookId({ bookId });
    expect(chapters.length).toBe(2);
    expect(chapters[0]?.title).toBe("Chapter One");
    expect(chapters[1]?.title).toBe("Chapter Two");
  });
});
