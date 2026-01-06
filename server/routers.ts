import { COOKIE_NAME } from "@shared/const";
import { generateBookOutline, generateSuckcessProfile, generateChapterDraft } from "./ai-generation";
import { generateDOCX, generatePDF } from "./manuscript-export";
import { researchAmazonCategories, analyzeCategoryCompetition, recommendCategoryCombination } from "./amazon-category-research";
import { generateOptimizedTitle, generateOptimizedDescription, generateOptimizedKeywords, generateCompleteListing } from "./kdp-listing-optimizer";
import { generateBookCover, generateCoverVariations, regenerateCoverWithPrompt, CoverCustomization } from "./cover-generator";
import { generateExportBundle } from "./export-bundle";
import { storagePut } from "./storage";
import { parseIntoPages, generatePagePreviewHTML, getPreviewSummary } from "./interior-preview";
import { analyzeManuscript, generateMoreTitles, refineDescription } from "./manuscript-analyzer";
import * as dbCovers from "./db-covers";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

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
        linkedInUrl: z.string().url().optional().or(z.literal("")),
        avatarUrl: z.string().url().optional().or(z.literal("")),
        booksAuthored: z.string().optional(),
        accomplishments: z.string().optional(),
        education: z.string().optional(),
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
          linkedInUrl: input.linkedInUrl || null,
          avatarUrl: input.avatarUrl || null,
          booksAuthored: input.booksAuthored || null,
          accomplishments: input.accomplishments || null,
          education: input.education || null,
        });

        return { success: true };
      }),

    // Generate author bio using AI
    generateAuthorBio: protectedProcedure
      .input(z.object({
        booksAuthored: z.string().optional(),
        accomplishments: z.string().optional(),
        education: z.string().optional(),
        additionalInfo: z.string().optional(),
        targetLength: z.enum(["short", "medium", "long"]).default("medium"), // short=100 words, medium=150 words, long=200 words
      }))
      .mutation(async ({ input }) => {
        const lengthMap = {
          short: "100 words (suitable for back cover)",
          medium: "150 words (suitable for Amazon Author Central)",
          long: "200 words (suitable for website/press kit)",
        };

        const prompt = `You are a professional author bio writer. Create a compelling third-person author biography based on the following information:

${input.booksAuthored ? `Books Authored: ${input.booksAuthored}` : ""}
${input.accomplishments ? `Accomplishments: ${input.accomplishments}` : ""}
${input.education ? `Education: ${input.education}` : ""}
${input.additionalInfo ? `Additional Information: ${input.additionalInfo}` : ""}

Requirements:
- Write in third person (use "they" or the author's name if provided)
- Target length: ${lengthMap[input.targetLength]}
- Professional tone suitable for book publishing
- Focus on credentials and achievements relevant to readers
- No promotional language or excessive self-praise
- Follow Amazon Author Central guidelines (no special formatting)

Generate the author bio now:`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional author bio writer specializing in book publishing." },
            { role: "user", content: prompt },
          ],
        });

        const content = response.choices[0].message.content;
        const generatedBio = typeof content === "string" ? content.trim() : "";
        const wordCount = generatedBio.split(/\s+/).length;
        const charCount = generatedBio.length;

        return {
          bio: generatedBio,
          wordCount,
          charCount,
          withinLimit: charCount <= 2000, // Amazon Author Central limit
        };
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

    // Save workflow progress (Ready to Publish)
    saveWorkflowProgress: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        workflowStep: z.string(),
        aiAnalysis: z.string().optional(), // JSON string
        selectedTitle: z.string().optional(),
        selectedSubtitle: z.string().optional(),
        selectedCoverUrl: z.string().optional(),
        generatedCovers: z.string().optional(), // JSON string
        amazonCategories: z.string().optional(), // JSON string
        amazonKeywords: z.string().optional(), // JSON string
        suggestedPrice: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bookId, ...progressData } = input;

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

        await db.updateBook(bookId, progressData);
        return { success: true };
      }),

    // Get workflow progress (Resume workflow)
    getWorkflowProgress: protectedProcedure
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

        return {
          workflowStep: book.workflowStep,
          aiAnalysis: book.aiAnalysis ? JSON.parse(book.aiAnalysis) : null,
          selectedTitle: book.selectedTitle,
          selectedSubtitle: book.selectedSubtitle,
          selectedCoverUrl: book.selectedCoverUrl,
          generatedCovers: book.generatedCovers ? JSON.parse(book.generatedCovers) : null,
          amazonCategories: book.amazonCategories ? JSON.parse(book.amazonCategories) : null,
          amazonKeywords: book.amazonKeywords ? JSON.parse(book.amazonKeywords) : null,
          suggestedPrice: book.suggestedPrice,
        };
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

    chatWithPublisher: protectedProcedure
      .input(z.object({
        manuscript: z.string(),
        analysis: z.object({
          suggestedTitles: z.array(z.string()),
          suggestedSubtitles: z.array(z.string()),
          bookDescription: z.string(),
          detectedGenre: z.string(),
          targetAudience: z.string(),
          themes: z.array(z.string()),
          keyBenefits: z.array(z.string()),
        }),
        messageHistory: z.array(z.object({
          role: z.enum(["assistant", "user"]),
          content: z.string(),
        })),
        userMessage: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        // Build context from analysis
        const context = `You are a senior New York Times publisher with 20+ years of experience helping authors create bestsellers.

Manuscript Analysis:
- Genre: ${input.analysis.detectedGenre}
- Target Audience: ${input.analysis.targetAudience}
- Main Themes: ${input.analysis.themes.join(", ")}
- Key Benefits: ${input.analysis.keyBenefits.join(", ")}

Suggested Titles:
${input.analysis.suggestedTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Book Description:
${input.analysis.bookDescription}

Your role is to provide expert guidance on:
- Title selection and refinement
- Cover design strategy
- Market positioning
- Pricing and launch strategy
- Amazon KDP optimization

Be conversational, encouraging, and specific. Reference the manuscript analysis when relevant.`;

        // Build message history for LLM
        const messages = [
          { role: "system" as const, content: context },
          ...input.messageHistory.map(msg => ({
            role: msg.role === "assistant" ? "assistant" as const : "user" as const,
            content: msg.content,
          })),
          { role: "user" as const, content: input.userMessage },
        ];

        const response = await invokeLLM({ messages });
        
        return {
          message: response.choices[0].message.content || "I'm here to help! What would you like to discuss?",
        };
      }),
  }),

  // Interior Preview
  preview: router({
    getSummary: protectedProcedure
      .input(z.object({
        content: z.string(),
      }))
      .query(({ input }) => {
        return getPreviewSummary(input.content);
      }),
    
    getPage: protectedProcedure
      .input(z.object({
        content: z.string(),
        pageNumber: z.number().min(1),
        bookTitle: z.string(),
        authorName: z.string(),
        fontSize: z.number().optional(),
        lineSpacing: z.number().optional(),
      }))
      .query(({ input }) => {
        const pages = parseIntoPages(input.content);
        const page = pages.find(p => p.pageNumber === input.pageNumber);
        
        if (!page) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Page ${input.pageNumber} not found`,
          });
        }
        
        const html = generatePagePreviewHTML(page, {
          bookTitle: input.bookTitle,
          authorName: input.authorName,
          fontSize: input.fontSize,
          lineSpacing: input.lineSpacing,
        });
        
        return {
          page,
          html,
        };
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

    // Customize existing cover with new style parameters
    customizeCover: protectedProcedure
      .input(z.object({
        bookTitle: z.string(),
        authorName: z.string(),
        genre: z.string(),
        customization: z.object({
          titleFont: z.string().optional(),
          authorFont: z.string().optional(),
          titleColor: z.string().optional(),
          authorColor: z.string().optional(),
          backgroundColor: z.string().optional(),
          titlePosition: z.enum(["top", "center", "bottom"]).optional(),
          titleSize: z.number().optional(),
          authorSize: z.number().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { bookTitle, authorName, genre, customization } = input;
        
        // Generate new cover with customization
        const cover = await generateBookCover({
          bookTitle,
          authorName,
          genre,
          style: "professional",
          customization: customization as CoverCustomization,
        });
        
        return { coverUrl: cover.imageUrl };
      }),

    // Upload custom cover
    uploadCustomCover: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // base64 encoded
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate file type
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(input.fileType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type. Only PNG and JPG are supported.",
          });
        }

        // Convert base64 to buffer
        const base64Data = input.fileData.split(',')[1] || input.fileData;
        const buffer = Buffer.from(base64Data, 'base64');

        // Validate file size (max 50MB)
        if (buffer.length > 50 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size exceeds 50MB limit.",
          });
        }

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = input.fileType.split('/')[1];
        const fileKey = `covers/${ctx.user.id}-${timestamp}-${randomSuffix}.${extension}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        return { url, key: fileKey };
      }),
  }),
});

export type AppRouter = typeof appRouter;
