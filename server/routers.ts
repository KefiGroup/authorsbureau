import { COOKIE_NAME } from "@shared/const";
import { generateBookOutline, generateSuckcessProfile, generateChapterDraft } from "./ai-generation";
import { generateDOCX, generatePDF } from "./manuscript-export";
import { researchAmazonCategories, analyzeCategoryCompetition, recommendCategoryCombination } from "./amazon-category-research";
import { generateOptimizedTitle, generateOptimizedDescription, generateOptimizedKeywords, generateCompleteListing } from "./kdp-listing-optimizer";
import { generateBookCover, generateCoverVariations, regenerateCoverWithPrompt } from "./cover-generator";
import { generateExportBundle } from "./export-bundle";
import { analyzeManuscript, generateMoreTitles, refineDescription } from "./manuscript-analyzer";
import * as dbCovers from "./db-covers";
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

  // Manuscript Analysis (AI-Agentic Publishing)
  manuscriptAnalysis: router({
    analyze: protectedProcedure
      .input(z.object({
        manuscript: z.string().min(100),
        wordCount: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await analyzeManuscript(input);
      }),

    generateMoreTitles: protectedProcedure
      .input(z.object({
        manuscript: z.string(),
        currentTitles: z.array(z.string()),
        preferredStyle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await generateMoreTitles(input);
      }),

    refineDescription: protectedProcedure
      .input(z.object({
        originalDescription: z.string(),
        feedback: z.string(),
        manuscript: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await refineDescription(input);
      }),
  }),

  // Export Bundle
  export: router({
    generateBundle: protectedProcedure
      .input(z.object({
        bookTitle: z.string(),
        authorName: z.string(),
        manuscriptContent: z.string(),
        coverImageUrl: z.string().optional(),
        metadata: z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string(),
          categories: z.array(z.string()),
          keywords: z.array(z.string()),
          price: z.string().optional(),
          genre: z.string(),
        }),
        isbn: z.string().optional(),
        copyrightPage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await generateExportBundle(input);
      }),
  }),

  // Amazon KDP Integration
  amazon: router({
    // Research optimal categories for bestseller positioning (AI-powered)
    researchCategories: protectedProcedure
      .input(z.object({
        bookId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get book data
        const book = await db.getBookById(input.bookId);
        if (!book) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Book not found",
          });
        }
        
        // Get author to verify ownership
        const author = await db.getAuthorByUserId(ctx.user!.id);
        if (!author || book.authorId !== author.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to access this book",
          });
        }
        
        // AI analyzes book content and recommends categories
        const categories = await researchAmazonCategories({
          title: book.title,
          genre: book.genre || "General",
          keywords: [], // Will be extracted from book content
          targetAudience: "General readers", // Extract from book description
          bookContent: book.description || book.content || "",
        });
        
        return { 
          categories,
          bookAnalysis: {
            title: book.title,
            extractedThemes: categories.slice(0, 3).map(c => c.category),
          }
        };
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

  // Book Cover Generator
  covers: router({
    // Generate a single book cover
    generate: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        bookTitle: z.string(),
        authorName: z.string(),
        genre: z.string(),
        style: z.string().optional(),
        customPrompt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { bookId, ...coverParams } = input;
        
        // Generate cover
        const cover = await generateBookCover(coverParams);
        
        // Save to database
        const savedCover = await dbCovers.createBookCover({
          bookId,
          coverUrl: cover.imageUrl,
          coverPrompt: cover.prompt,
          designStyle: cover.style,
        });
        
        return { cover: savedCover };
      }),

    // Generate multiple cover variations
      generateVariations: protectedProcedure
      .input(z.object({
        bookTitle: z.string(),
        authorName: z.string(),
        genre: z.string(),
        themes: z.array(z.string()).optional(),
        targetAudience: z.string().optional(),
        count: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await generateCoverVariations(input);
      }),

    // Regenerate with modifications
    regenerate: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        bookTitle: z.string(),
        authorName: z.string(),
        genre: z.string(),
        basePrompt: z.string(),
        modifications: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { bookId, ...regenerateParams } = input;
        
        // Regenerate cover
        const cover = await regenerateCoverWithPrompt(regenerateParams);
        
        // Save to database
        const savedCover = await dbCovers.createBookCover({
          bookId,
          coverUrl: cover.imageUrl,
          coverPrompt: cover.prompt,
          designStyle: cover.style,
        });
        
        return { cover: savedCover };
      }),

    // Get all covers for a book
    getBookCovers: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        const covers = await dbCovers.getBookCovers(input.bookId);
        return { covers };
      }),

    // Set active cover for book
    setActiveCover: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        coverId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const cover = await dbCovers.getBookCoverById(input.coverId);
        if (!cover || !cover.coverUrl) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cover not found or invalid",
          });
        }
        
        await dbCovers.updateBookCoverUrl(input.bookId, cover.coverUrl);
        return { success: true };
      }),

    // Delete a cover
    deleteCover: protectedProcedure
      .input(z.object({ coverId: z.number() }))
      .mutation(async ({ input }) => {
        await dbCovers.deleteBookCover(input.coverId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
