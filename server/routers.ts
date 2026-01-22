import { COOKIE_NAME } from "@shared/const";
import { generateBookOutline, generateSuckcessProfile, generateChapterDraft } from "./ai-generation";
import { generateDOCX, generatePDF } from "./manuscript-export";
import { researchAmazonCategories, analyzeCategoryCompetition, recommendCategoryCombination } from "./amazon-category-research";
import { generateOptimizedTitle, generateOptimizedDescription, generateOptimizedKeywords, generateCompleteListing } from "./kdp-listing-optimizer";
import { generateBookCover, generateCoverVariations, regenerateCoverWithPrompt, CoverCustomization } from "./cover-generator";
import { generateBookWrap } from "./book-wrap-generator";
import { generateExportBundle } from "./export-bundle";
import { storagePut } from "./storage";
import { parseIntoPages, generatePagePreviewHTML, getPreviewSummary } from "./interior-preview";
import { analyzeManuscript, generateMoreTitles, refineDescription } from "./manuscript-analyzer";
import { generateBlueprintContent } from "./blueprint-generator";
import { generateNextMessage, extractDataFromResponse, CONVERSATION_SECTIONS, getNextSection } from "./writing-studio-agent";
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

    // Upload profile photo to S3
    uploadProfilePhoto: protectedProcedure
      .input(z.object({
        imageData: z.string(), // base64 encoded image
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const base64Data = input.imageData.split(',')[1] || input.imageData;
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique file key
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `author-photos/${ctx.user.id}-${Date.now()}-${randomSuffix}.jpg`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url };
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

        const book = await db.createBook({
          authorId: author.id,
          title: input.title,
          subtitle: input.subtitle,
          genre: input.genre,
          targetWordCount: input.targetWordCount,
          status: "idea",
        });

        return { success: true, bookId: book.id };
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

    // Update Book Wrap content (editable fields)
    updateBookWrapContent: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        selectedTitle: z.string().optional(),
        selectedSubtitle: z.string().optional(),
        authorName: z.string().optional(),
        bookDescription: z.string().optional(),
        authorBio: z.string().optional(),
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

  // Story Blueprint management for "Start Your Writing Process" feature
  blueprint: router({    // Create new story blueprint
    create: protectedProcedure
      .input(z.object({
        projectType: z.enum(["novel", "novella", "short_story", "memoir", "non_fiction", "childrens_book"]),
        workingTitle: z.string().optional(),
        bookId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const blueprint = await db.createStoryBlueprint({
          userId: ctx.user.id,
          projectType: input.projectType,
          workingTitle: input.workingTitle,
          bookId: input.bookId,
        });
        
        if (!blueprint) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create blueprint",
          });
        }
        
        return { success: true, blueprintId: blueprint.id };
      }),

    // Get blueprint by ID
    get: protectedProcedure
      .input(z.object({ blueprintId: z.number() }))
      .query(async ({ ctx, input }) => {
        const blueprint = await db.getStoryBlueprintById(input.blueprintId);
        if (!blueprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blueprint not found",
          });
        }
        // Verify ownership
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }
        return blueprint;
      }),

    // Get blueprint by book ID
    getByBookId: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ ctx, input }) => {
        const blueprint = await db.getStoryBlueprintByBookId(input.bookId);
        if (!blueprint) {
          return null;
        }
        // Verify ownership
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }
        return blueprint;
      }),

    // Update blueprint data
    update: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        data: z.object({
          workingTitle: z.string().optional(),
          targetLength: z.string().optional(),
          primaryGenre: z.string().optional(),
          secondaryGenre: z.string().optional(),
          corePremise: z.string().optional(),
          timePeriod: z.string().optional(),
          location: z.string().optional(),
          pointOfView: z.string().optional(),
          protagonistData: z.any().optional(),
          supportingCharacters: z.any().optional(),
          plotStructure: z.any().optional(),
          settingData: z.any().optional(),
          audienceData: z.any().optional(),
          thematicElements: z.any().optional(),
          conversationHistory: z.any().optional(),
          blueprintGenerated: z.boolean().optional(),
          blueprintContent: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const blueprint = await db.getStoryBlueprintById(input.blueprintId);
        if (!blueprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blueprint not found",
          });
        }
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        await db.updateStoryBlueprint(input.blueprintId, input.data);
        return { success: true };
      }),

    // List user's blueprints
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.listUserBlueprints(ctx.user.id);
    }),

    // Generate blueprint from conversation data
    generateFromConversation: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const blueprint = await db.getStoryBlueprintById(input.blueprintId);
        if (!blueprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blueprint not found",
          });
        }
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        // Generate comprehensive blueprint using AI
        const blueprintMarkdown = await generateBlueprintContent(blueprint);

        // Update blueprint with generated content
        await db.updateStoryBlueprint(input.blueprintId, {
          blueprintContent: blueprintMarkdown,
          blueprintGenerated: true,
        });

        return { success: true, content: blueprintMarkdown };
      }),

    // Start new conversation
    startConversation: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const blueprint = await db.getStoryBlueprintById(input.blueprintId);
        if (!blueprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blueprint not found",
          });
        }
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        // Get author profile for personalization
        const author = await db.getAuthorByUserId(ctx.user.id);

        // Generate first AI message
        const state = {
          currentSection: CONVERSATION_SECTIONS[0],
          completedSections: [],
          collectedData: {},
          conversationHistory: [],
        };

        const { message, suggestions } = await generateNextMessage(state, null, author);

        // Save conversation history
        const conversationHistory = [
          { role: "assistant" as const, content: message, timestamp: new Date().toISOString(), suggestions },
        ];

        await db.updateStoryBlueprint(input.blueprintId, {
          conversationHistory: conversationHistory as any,
        });

        return {
          message,
          suggestions,
          currentSection: CONVERSATION_SECTIONS[0],
          completedSections: 0,
          totalSections: CONVERSATION_SECTIONS.length,
        };
      }),

    // Send message in conversation
    sendMessage: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify ownership
        const blueprint = await db.getStoryBlueprintById(input.blueprintId);
        if (!blueprint) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Blueprint not found",
          });
        }
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }

        // Parse conversation history
        const conversationHistory: Array<{ role: string; content: string }> = blueprint.conversationHistory
          ? (blueprint.conversationHistory as any).map((msg: any) => ({ role: msg.role, content: msg.content }))
          : [];

        // Add user message
        conversationHistory.push({
          role: "user",
          content: input.message,
        });

        // Extract data from user response
        const currentSection = (blueprint.currentSection as any) || CONVERSATION_SECTIONS[0];
        
        const extractedData = await extractDataFromResponse(
          currentSection,
          input.message,
          conversationHistory.map((msg) => ({ role: msg.role, content: msg.content }))
        );

        // Merge extracted data with existing blueprint data
        const updatedData = { ...extractedData };

        // Get author profile
        const author = await db.getAuthorByUserId(ctx.user.id);

        // Generate AI response
        const state = {
          currentSection,
          completedSections: (blueprint.completedSections as any) || [],
          collectedData: updatedData,
          conversationHistory: conversationHistory as Array<{ role: "user" | "assistant"; content: string }>,
        };

        const { message: aiMessage, suggestions, isComplete } = await generateNextMessage(state, input.message, author);

        // Add AI message
        conversationHistory.push({
          role: "assistant",
          content: aiMessage,
        });

        // Determine next section if current is complete
        let nextSection = currentSection;
        let completedSections = state.completedSections;
        
        if (isComplete && !completedSections.includes(currentSection)) {
          completedSections.push(currentSection);
          const next = getNextSection(currentSection);
          if (next) {
            nextSection = next;
          }
        }

        // Update blueprint
        await db.updateStoryBlueprint(input.blueprintId, {
          ...updatedData,
          conversationHistory: conversationHistory as any,
          currentSection: nextSection,
          completedSections: completedSections as any,
        });

        return {
          message: aiMessage,
          suggestions,
          currentSection: nextSection,
          completedSections: completedSections.length,
          totalSections: CONVERSATION_SECTIONS.length,
          isComplete: completedSections.length === CONVERSATION_SECTIONS.length,
        };
      }),

    // Get blueprint transformed as AIAnalysis for ReadyToPublish
    getAsAIAnalysis: protectedProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ ctx, input }) => {
        const blueprint = await db.getStoryBlueprintByBookId(input.bookId);
        if (!blueprint) {
          return null;
        }
        // Verify ownership
        if (blueprint.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied",
          });
        }
        
        // Transform blueprint to AIAnalysis format
        const { blueprintToAIAnalysis } = await import("./blueprint-transformer");
        return blueprintToAIAnalysis(blueprint);
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
    // Extract text from uploaded file (PDF, DOCX, TXT)
    extractTextFromFile: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(), // base64 encoded
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        let extractedText = '';
        
        try {
          if (input.fileType === 'application/pdf' || input.fileName.endsWith('.pdf')) {
            // Extract text from PDF
            const { PDFParse } = await import('pdf-parse');
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            extractedText = result.text;
          } else if (input.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || input.fileName.endsWith('.docx')) {
            // Extract text from DOCX
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
          } else {
            // Plain text file
            extractedText = buffer.toString('utf-8');
          }
          
          // Clean up the text: remove excessive whitespace, invalid characters
          extractedText = extractedText
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
            .replace(/\r\n/g, '\n') // Normalize line endings
            .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
            .trim();
          
          // Count words
          const wordCount = extractedText.trim().split(/\s+/).filter(w => w.length > 0).length;
          
          return {
            text: extractedText,
            wordCount,
          };
        } catch (error) {
          console.error('[extractTextFromFile] Error:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to extract text from ${input.fileType}: ${(error as Error).message}`,
          });
        }
      }),

    analyze: protectedProcedure
      .input(z.object({
        manuscript: z.string().min(100),
        wordCount: z.number(),
        initialTitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          console.log('[manuscriptAnalysis.analyze] Starting analysis...');
          console.log('[manuscriptAnalysis.analyze] User ID:', ctx.user.id);
          console.log('[manuscriptAnalysis.analyze] Manuscript length:', input.manuscript.length);
          console.log('[manuscriptAnalysis.analyze] Word count:', input.wordCount);
          
          // Analyze the manuscript
          console.log('[manuscriptAnalysis.analyze] Calling analyzeManuscript...');
          const analysis = await analyzeManuscript(input);
          console.log('[manuscriptAnalysis.analyze] Analysis complete:', {
            titlesCount: analysis.suggestedTitles?.length,
            subtitlesCount: analysis.suggestedSubtitles?.length,
            genre: analysis.detectedGenre,
          });
          
          // Get or create author profile for this user
          console.log('[manuscriptAnalysis.analyze] Looking up author profile for user:', ctx.user.id);
          let author = await db.getAuthorByUserId(ctx.user.id);
          
          if (!author) {
            console.log('[manuscriptAnalysis.analyze] No author profile found, creating one...');
            await db.createAuthorProfile({
              userId: ctx.user.id,
              penName: ctx.user.name || 'Anonymous Author',
            });
            author = await db.getAuthorByUserId(ctx.user.id);
            console.log('[manuscriptAnalysis.analyze] Author profile created:', author?.id);
          } else {
            console.log('[manuscriptAnalysis.analyze] Found existing author profile:', author.id);
          }
          
          if (!author) {
            throw new Error('Failed to create or retrieve author profile');
          }
          
          // Create a book in the database
          // Use initialTitle if provided, otherwise use first AI-suggested title
          const bookTitle = input.initialTitle || analysis.suggestedTitles[0];
          console.log('[manuscriptAnalysis.analyze] Creating book with title:', bookTitle);
          
          const insertResult = await db.createBook({
            authorId: author.id,
            title: bookTitle,
            subtitle: analysis.suggestedSubtitles[0],
            genre: analysis.detectedGenre,
            targetWordCount: input.wordCount,
            content: input.manuscript,
            wordCount: input.wordCount,
            status: "drafting", // Valid status from schema
          });
          
          console.log('[manuscriptAnalysis.analyze] Book created, insertResult:', insertResult);
          
          // Get the newly created book ID (cast to any to access insertId)
          const bookId = Number((insertResult as any).insertId);
          console.log('[manuscriptAnalysis.analyze] Book ID:', bookId);
          
          // Return both analysis and bookId
          return {
            ...analysis,
            bookId,
          };
        } catch (error) {
          console.error('[manuscriptAnalysis.analyze] ERROR:', error);
          console.error('[manuscriptAnalysis.analyze] Error stack:', (error as Error).stack);
          console.error('[manuscriptAnalysis.analyze] Error message:', (error as Error).message);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to analyze manuscript: ${(error as Error).message}`,
            cause: error,
          });
        }
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

    // Generate standalone manuscript file (DOCX) for KDP upload
    generateManuscriptFile: protectedProcedure
      .input(z.object({
        bookTitle: z.string(),
        authorName: z.string(),
        manuscriptContent: z.string(),
        copyrightPage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { bookTitle, authorName, manuscriptContent, copyrightPage } = input;
        
        // Parse manuscript into chapters (same logic as export-bundle)
        const parseManuscriptIntoChapters = (content: string) => {
          const chapters: { number: number; title: string; content: string }[] = [];
          const chapterRegex = /(?:^|\n)(?:Chapter|CHAPTER)\s+(?:(\d+)|([A-Za-z]+))(?::|\s*[-–—]\s*|\s+)([^\n]+)?/g;
          const matches: RegExpExecArray[] = [];
          let match;
          while ((match = chapterRegex.exec(content)) !== null) {
            matches.push(match);
          }
          if (matches.length === 0) {
            return [{ number: 1, title: "Full Text", content: content.trim() }];
          }
          for (let i = 0; i < matches.length; i++) {
            const currentMatch = matches[i];
            const nextMatch = matches[i + 1];
            const startIndex = currentMatch.index;
            const endIndex = nextMatch ? nextMatch.index : content.length;
            const chapterContent = content.substring(startIndex, endIndex).trim();
            const chapterNumber = currentMatch[1] ? parseInt(currentMatch[1], 10) : i + 1;
            const chapterTitle = currentMatch[3] || `Chapter ${chapterNumber}`;
            chapters.push({ number: chapterNumber, title: chapterTitle, content: chapterContent });
          }
          return chapters;
        };
        
        const chapters = parseManuscriptIntoChapters(manuscriptContent);
        
        // Generate DOCX file
        const docxBuffer = await generateDOCX({
          bookTitle,
          authorName,
          chapters,
        });
        
        // Upload to S3
        const fileKey = `manuscripts/${bookTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.docx`;
        const { url } = await storagePut(fileKey, docxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        
        return { url, fileKey };
      }),
  }),

  // Amazon KDP Integration
  amazon: router({
    // Research optimal categories for bestseller positioning (AI-powered)
    researchCategories: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        format: z.enum(['kindle', 'paperback']).optional(), // Specify Kindle or Paperback for correct category tree
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
          format: input.format, // Pass format to get correct category tree
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
        bookId: z.string().optional(),
        title: z.string().optional(),
        genre: z.string().optional(),
        targetAudience: z.string().optional(),
        mainTopics: z.array(z.string()).optional(),
        format: z.enum(['kindle', 'paperback']).optional(),
        categories: z.array(z.string()).optional()
      }))
      .mutation(async ({ input, ctx }) => {
        // If bookId is provided, fetch book data
        let bookData: any = null;
        if (input.bookId) {
          bookData = await db.getBookById(parseInt(input.bookId));
          if (!bookData) {
            throw new Error("Book not found");
          }
        }

        const result = await generateOptimizedKeywords({
          title: input.title || bookData?.title || "Untitled",
          genre: input.genre || bookData?.genre || "General",
          targetAudience: input.targetAudience || bookData?.targetAudience || "General readers",
          mainTopics: input.mainTopics || [],
          bookContent: bookData?.content || bookData?.description,
          selectedCategories: input.categories,
          format: input.format
        });
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
        if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'].includes(input.fileType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid file type. Only PNG, JPG, and PDF are supported.",
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

    // Generate complete book wrap (front + spine + back)
    generateWrap: protectedProcedure
      .input(z.object({
        frontCoverUrl: z.string(),
        bookTitle: z.string(),
        authorName: z.string(),
        authorPhotoUrl: z.string().optional(),
        authorBio: z.string(),
        bookDescription: z.string(),
        backgroundColor: z.string(),
        textColor: z.string(),
        fontSize: z.number(),
        pageCount: z.number(),
        template: z.enum(["modern", "classic", "minimalist", "bold"]),
      }))
      .mutation(async ({ input }) => {
        const wrapUrl = await generateBookWrap(input);
        return { wrapUrl };
      }),
  }),

  // Marketing Campaign Builder
  marketing: router({
    // Generate email sequence for book marketing
    generateEmailSequence: protectedProcedure
      .input(z.object({
        bookId: z.string(),
        emailType: z.enum(["prelaunch", "launch", "postlaunch"]),
        campaignType: z.enum(["launch", "promotion", "relaunch"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const book = await db.getBookById(parseInt(input.bookId));
        if (!book || book.authorId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
        }

        const emailPrompts = {
          prelaunch: `Write a pre-launch teaser email for "${book.title}". Create excitement and anticipation. Include a call-to-action to add to wishlist. Keep it under 200 words.`,
          launch: `Write a launch announcement email for "${book.title}". Celebrate the release, highlight key benefits, include Amazon link placeholder [AMAZON_LINK]. Keep it under 250 words.`,
          postlaunch: `Write a thank you email to readers who supported the launch of "${book.title}". Express gratitude, ask for honest reviews, mention future books. Keep it under 200 words.`,
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert book marketing copywriter. Write compelling, personable emails that convert readers into buyers. Use a warm, authentic tone.",
            },
            {
              role: "user",
              content: `${emailPrompts[input.emailType]}\n\nBook details:\nTitle: ${book.title}\nSubtitle: ${book.subtitle || "N/A"}\nGenre: ${book.genre || "N/A"}\nDescription: ${book.description || "N/A"}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const emailContent = typeof content === 'string' ? content : "Failed to generate email";
        return { emailContent };
      }),

    // Generate social media post
    generateSocialPost: protectedProcedure
      .input(z.object({
        bookId: z.string(),
        platform: z.enum(["twitter", "facebook", "instagram"]),
        campaignType: z.enum(["launch", "promotion", "relaunch"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const book = await db.getBookById(parseInt(input.bookId));
        if (!book || book.authorId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });
        }

        const platformSpecs = {
          twitter: "280 characters max, use 1-2 hashtags, conversational tone",
          facebook: "Longer format (300-500 words), storytelling approach, emotional hook",
          instagram: "Caption with line breaks, 5-10 relevant hashtags at the end, visual description",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a social media marketing expert specializing in book promotion. Create engaging, shareable posts that drive book sales.",
            },
            {
              role: "user",
              content: `Write a ${input.platform} post for "${book.title}" (${input.campaignType} campaign).\n\nPlatform requirements: ${platformSpecs[input.platform]}\n\nBook details:\nTitle: ${book.title}\nGenre: ${book.genre || "N/A"}\nDescription: ${book.description || "N/A"}`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const postContent = typeof content === 'string' ? content : "Failed to generate post";
        return { postContent };
      }),
  }),

  // Analytics & Feedback Router
  analytics: router({
    // Submit feedback on AI recommendation
    submitFeedback: protectedProcedure
      .input(z.object({
        bookId: z.number().optional(),
        recommendationType: z.enum(["category", "title", "description", "keyword", "cover"]),
        recommendationData: z.any(),
        confidenceScore: z.number().min(0).max(1).optional(),
        userRating: z.number().min(1).max(5),
        userFeedback: z.string().optional(),
        wasUsed: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { aiRecommendationFeedback } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db.insert(aiRecommendationFeedback).values({
          userId: ctx.user.id,
          bookId: input.bookId,
          recommendationType: input.recommendationType,
          recommendationData: input.recommendationData,
          confidenceScore: input.confidenceScore?.toString(),
          userRating: input.userRating,
          userFeedback: input.userFeedback,
          wasUsed: input.wasUsed,
        });

        return { success: true };
      }),

    // Record book success metrics
    recordSuccessMetrics: protectedProcedure
      .input(z.object({
        bookId: z.number(),
        amazonBSR: z.number().optional(),
        kindleBSR: z.number().optional(),
        categoryRanks: z.array(z.object({ category: z.string(), rank: z.number() })).optional(),
        reviewCount: z.number().optional(),
        averageRating: z.number().optional(),
        estimatedSales: z.number().optional(),
        currentPrice: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bookSuccessMetrics, books } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        // Get book details
        const book = await db.select().from(books).where(eq(books.id, input.bookId)).limit(1);
        if (!book[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Book not found" });

        // Parse stored data
        const categories = book[0].amazonCategories ? JSON.parse(book[0].amazonCategories) : [];
        const keywords = book[0].amazonKeywords ? JSON.parse(book[0].amazonKeywords) : [];

        await db.insert(bookSuccessMetrics).values({
          bookId: input.bookId,
          amazonBSR: input.amazonBSR,
          kindleBSR: input.kindleBSR,
          categoryRanks: input.categoryRanks,
          reviewCount: input.reviewCount,
          averageRating: input.averageRating?.toString(),
          estimatedSales: input.estimatedSales,
          currentPrice: input.currentPrice?.toString(),
          publishedCategories: categories,
          publishedKeywords: keywords,
          publishedTitle: book[0].selectedTitle || book[0].title,
          publishedGenre: book[0].genre,
          publishedCoverStyle: book[0].coverUrl ? "ai-generated" : "custom",
        });

        return { success: true };
      }),

    // Get success patterns for recommendations
    getSuccessPatterns: protectedProcedure
      .input(z.object({
        genre: z.string().optional(),
        patternType: z.enum(["category", "keyword", "cover_style", "title_format", "pricing"]).optional(),
      }))
      .query(async ({ input }) => {
        const { successPatterns } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, and, desc } = await import("drizzle-orm");

        let query = db.select().from(successPatterns);

        const conditions = [];
        if (input.genre) conditions.push(eq(successPatterns.genre, input.genre));
        if (input.patternType) conditions.push(eq(successPatterns.patternType, input.patternType));

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        const patterns = await query.orderBy(desc(successPatterns.confidenceLevel)).limit(20);
        return patterns;
      }),

    // Get algorithm accuracy dashboard data
    getAccuracyMetrics: protectedProcedure
      .query(async ({ ctx }) => {
        const { aiRecommendationFeedback } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, sql } = await import("drizzle-orm");

        // Get feedback stats by recommendation type
        const feedbackStats = await db
          .select({
            recommendationType: aiRecommendationFeedback.recommendationType,
            avgRating: sql<number>`AVG(${aiRecommendationFeedback.userRating})`,
            totalFeedback: sql<number>`COUNT(*)`,
            usageRate: sql<number>`SUM(CASE WHEN ${aiRecommendationFeedback.wasUsed} THEN 1 ELSE 0 END) / COUNT(*) * 100`,
          })
          .from(aiRecommendationFeedback)
          .where(eq(aiRecommendationFeedback.userId, ctx.user.id))
          .groupBy(aiRecommendationFeedback.recommendationType);

        return feedbackStats;
      }),
  }),
});

export type AppRouter = typeof appRouter;
