import { COOKIE_NAME } from "@shared/const";
import { generateBookOutline, generateSuckcessProfile, generateChapterDraft } from "./ai-generation";
import { generateDOCX, generatePDF } from "./manuscript-export";
import { researchAmazonCategories, analyzeCategoryCompetition, recommendCategoryCombination } from "./amazon-category-research";
import { generateOptimizedTitle, generateOptimizedDescription, generateOptimizedKeywords, generateCompleteListing } from "./kdp-listing-optimizer";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Author profile management
  author: router({
    // Get current user's author profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const author = await db.getAuthorByUserId(ctx.user.id);
      return author;
    }),

    // Create author profile
    createProfile: protectedProcedure
      .input(z.object({
        penName: z.string().optional(),
        bio: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if profile already exists
        const existing = await db.getAuthorByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Author profile already exists",
          });
        }

        await db.createAuthorProfile({
          userId: ctx.user.id,
          penName: input.penName,
          bio: input.bio,
          website: input.website || null,
        });

        return { success: true };
      }),

    // Update author profile
    updateProfile: protectedProcedure
      .input(z.object({
        penName: z.string().optional(),
        bio: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        avatarUrl: z.string().url().optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Author profile not found",
          });
        }

        await db.updateAuthorProfile(author.id, {
          penName: input.penName,
          bio: input.bio,
          website: input.website || null,
          avatarUrl: input.avatarUrl || null,
        });

        return { success: true };
      }),

    // Get all authors (admin only)
    getAllAuthors: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return await db.getAllAuthors();
    }),
  }),

  // Book management
  book: router({
    // Get all books for current author
    getMyBooks: protectedProcedure.query(async ({ ctx }) => {
      const author = await db.getAuthorByUserId(ctx.user.id);
      if (!author) {
        return [];
      }

      return await db.getBooksByAuthorId(author.id);
    }),

    // Get single book by ID
    getById: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ ctx, input }) => {
        const book = await db.getBookById(input.bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        // Verify ownership
        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        return book;
      }),

    // Create new book
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        genre: z.string().optional(),
        targetWordCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Author profile required. Please create your profile first.",
          });
        }

        await db.createBook({
          authorId: author.id,
          title: input.title,
          subtitle: input.subtitle,
          genre: input.genre,
          targetWordCount: input.targetWordCount,
          status: "idea",
        });

        return { success: true };
      }),

    // Update book
    update: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        genre: z.string().optional(),
        status: z.enum(["idea", "outlining", "drafting", "editing", "designed", "marketing", "published"]).optional(),
        coverUrl: z.string().optional(),
        wordCount: z.number().optional(),
        targetWordCount: z.number().optional(),
        currentChapter: z.number().optional(),
        totalChapters: z.number().optional(),
        programDay: z.number().optional(),
        programStep: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bookId, ...updateData } = input;

        // Verify ownership
        const book = await db.getBookById(bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        await db.updateBook(bookId, updateData);
        return { success: true };
      }),

    // Delete book
    delete: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const book = await db.getBookById(input.bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        await db.deleteBook(input.bookId);
        return { success: true };
      }),
  }),

  // Chapter management
  chapter: router({
    // Get all chapters for a book
    getByBookId: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify book ownership
        const book = await db.getBookById(input.bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        return await db.getChaptersByBookId(input.bookId);
      }),

    // Create chapter
    create: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        chapterNumber: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify book ownership
        const book = await db.getBookById(input.bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }

        const author = await db.getAuthorByUserId(ctx.user.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        await db.createChapter({
          bookId: input.bookId,
          chapterNumber: input.chapterNumber,
          title: input.title,
          content: input.content,
          status: "drafting",
        });

        return { success: true };
      }),

    // Update chapter
    update: protectedProcedure
      .input(z.object({
        chapterId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(["planned", "drafting", "completed", "edited"]).optional(),
        wordCount: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { chapterId, ...updateData } = input;
        await db.updateChapter(chapterId, updateData);
        return { success: true };
      }),
  }),

  // AI Generation
  ai: router({
    generateOutline: protectedProcedure
      .input(z.object({
        // For SUCKcess Story (Track 2)
        disasterMoment: z.string().optional(),
        transformation: z.string().optional(),
        currentState: z.string().optional(),
        lessonLearned: z.string().optional(),
        // For Independent Author (Track 1)
        topic: z.string().optional(),
        bookIdea: z.string().optional(),
        // Common fields
        targetAudience: z.string(),
        uniqueAngle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const outline = await generateBookOutline(input);
        return { outline };
      }),
    
    generateProfile: publicProcedure
      .input(z.object({
        name: z.string(),
        biggestChallenge: z.string(),
        currentStatus: z.string(),
        desiredImpact: z.string(),
        writingExperience: z.string(),
      }))
      .mutation(async ({ input }) => {
        const profile = await generateSuckcessProfile(input);
        return { profile };
      }),
    
    generateChapter: protectedProcedure
      .input(z.object({
        bookTitle: z.string(),
        chapterNumber: z.number(),
        chapterTitle: z.string(),
        chapterOutline: z.string(),
        previousChapterSummary: z.string().optional(),
        authorVoiceNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const draft = await generateChapterDraft(input);
        return { draft };
      }),
  }),

  // Manuscript export
  manuscript: router({
    exportDOCX: protectedProcedure
      .input(
        z.object({
          bookTitle: z.string(),
          subtitle: z.string().optional(),
          authorName: z.string(),
          chapters: z.array(
            z.object({
              number: z.number(),
              title: z.string(),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = await generateDOCX(input);
        return {
          success: true,
          data: buffer.toString("base64"),
          filename: `${input.bookTitle.replace(/[^a-z0-9]/gi, "_")}.docx`,
        };
      }),
    exportPDF: protectedProcedure
      .input(
        z.object({
          bookTitle: z.string(),
          subtitle: z.string().optional(),
          authorName: z.string(),
          chapters: z.array(
            z.object({
              number: z.number(),
              title: z.string(),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = await generatePDF(input);
        return {
          success: true,
          data: buffer.toString("base64"),
          filename: `${input.bookTitle.replace(/[^a-z0-9]/gi, "_")}.pdf`,
        };
      }),
  }),

  // Amazon KDP Integration
  amazon: router({
    // Research optimal categories for bestseller positioning
    researchCategories: protectedProcedure
      .input(z.object({
        title: z.string(),
        genre: z.string(),
        keywords: z.array(z.string()),
        targetAudience: z.string()
      }))
      .mutation(async ({ input }) => {
        const categories = await researchAmazonCategories(input);
        return { categories };
      }),

    // Analyze competition in a specific category
    analyzeCategory: protectedProcedure
      .input(z.object({
        category: z.string(),
        subcategory: z.string().optional(),
        bookTitle: z.string(),
        genre: z.string()
      }))
      .mutation(async ({ input }) => {
        const analysis = await analyzeCategoryCompetition(input);
        return analysis;
      }),

    // Get recommended category combination (2 categories)
    recommendCategories: protectedProcedure
      .input(z.object({
        categories: z.array(z.object({
          category: z.string(),
          subcategory: z.string().optional(),
          competitivenessScore: z.number(),
          estimatedMonthlySearches: z.string(),
          topSellerRequirement: z.string(),
          reasoning: z.string(),
          recommended: z.boolean()
        }))
      }))
      .mutation(async ({ input }) => {
        const recommendation = await recommendCategoryCombination(input.categories);
        return recommendation;
      }),

    // Optimize book title and subtitle for Amazon search
    optimizeTitle: protectedProcedure
      .input(z.object({
        originalTitle: z.string(),
        genre: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        keywords: z.array(z.string())
      }))
      .mutation(async ({ input }) => {
        const result = await generateOptimizedTitle(input);
        return result;
      }),

    // Generate conversion-optimized book description
    optimizeDescription: protectedProcedure
      .input(z.object({
        title: z.string(),
        genre: z.string(),
        targetAudience: z.string(),
        keyBenefits: z.array(z.string()),
        outline: z.string(),
        authorCredentials: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const result = await generateOptimizedDescription(input);
        return result;
      }),

    // Research and generate optimal keywords
    optimizeKeywords: protectedProcedure
      .input(z.object({
        title: z.string(),
        genre: z.string(),
        targetAudience: z.string(),
        mainTopics: z.array(z.string())
      }))
      .mutation(async ({ input }) => {
        const result = await generateOptimizedKeywords(input);
        return result;
      }),

    // Generate complete optimized listing (title, description, keywords, bio)
    generateCompleteListing: protectedProcedure
      .input(z.object({
        originalTitle: z.string(),
        genre: z.string(),
        targetAudience: z.string(),
        mainBenefit: z.string(),
        keyBenefits: z.array(z.string()),
        outline: z.string(),
        authorName: z.string(),
        authorBio: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const listing = await generateCompleteListing(input);
        return listing;
      }),
  }),
});

export type AppRouter = typeof appRouter;
