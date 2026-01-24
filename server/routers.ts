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
import { generateNextMessage as generateNextMessageV1, extractDataFromResponse, CONVERSATION_SECTIONS, getNextSection } from "./writing-studio-agent";
import { generateNextMessage as generateNextMessageV2, extractEssentialData, ConversationMode } from "./writing-studio-agent-v2";
import * as dbCovers from "./db-covers";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

/**
 * Strip ALL markdown formatting from text
 * Removes: ##, **, *, _,  __, ~~, `, etc.
 */
function stripMarkdownFromText(text: string): string {
  if (!text) return text;
  
  return text
    // Remove headers (##, ###, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks (```text```)
    .replace(/```[\s\S]*?```/g, '')
    // Clean up any remaining asterisks or underscores
    .replace(/[*_]/g, '')
    .trim();
}

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
      .mutation(async ({ ctx, input }) => {
        // Get author's pen name for personalization
        const author = await db.getAuthorByUserId(ctx.user.id);
        const authorName = author?.penName || "the author";
        
        console.log('[Bio Generation] User ID:', ctx.user.id);
        console.log('[Bio Generation] Author object:', author);
        console.log('[Bio Generation] Author name:', authorName);
        const lengthMap = {
          short: "100 words (suitable for back cover)",
          medium: "150 words (suitable for Amazon Author Central)",
          long: "200 words (suitable for website/press kit)",
        };

        const firstName = authorName.split(' ')[0];
        const prompt = `Write a professional author biography. The author's name is ${authorName}.

${input.booksAuthored ? `Books: ${input.booksAuthored}` : ""}
${input.accomplishments ? `Accomplishments: ${input.accomplishments}` : ""}
${input.education ? `Education: ${input.education}` : ""}
${input.additionalInfo ? `Additional: ${input.additionalInfo}` : ""}

IMPORTANT RULES:
- Write in third person
- Use "${authorName}" or "${firstName}" throughout the bio
- DO NOT use: they, them, their, he, she, his, her, the author
- Length: ${lengthMap[input.targetLength]}
- Professional tone for book publishing

Example start: "${authorName} brings a unique blend of..."
Example middle: "${firstName} previously served as..."
Example end: "${authorName}'s work focuses on..."

Write the bio now:`;

        const response = await invokeLLM({
          model: "gpt-4o", // Use GPT-4o for best writing quality and instruction following
          messages: [
            { role: "system", content: "You are a professional author bio writer. You MUST use the author's actual name throughout the bio. NEVER use pronouns like 'they', 'them', 'their', 'he', 'she'." },
            { role: "user", content: prompt },
            { role: "assistant", content: `I understand. I will write the bio using only "${authorName}" and "${firstName}", never using pronouns. Here is the professional biography:\n\n${authorName}` },
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
          conversationMode: "initial_questions" as const,
          essentialData: {},
          conversationHistory: [],
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

    // Get all user's projects
    getUserProjects: protectedProcedure
      .query(async ({ ctx }) => {
        const { storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, desc } = await import("drizzle-orm");

        const projects = await db.select()
          .from(storyBlueprints)
          .where(eq(storyBlueprints.userId, ctx.user.id))
          .orderBy(desc(storyBlueprints.updatedAt));

        return projects;
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

    // Delete blueprint
    delete: protectedProcedure
      .input(z.object({ blueprintId: z.number() }))
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

        // Delete the blueprint
        const { storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const database = await getDb();
        if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await database.delete(storyBlueprints).where(eq(storyBlueprints.id, input.blueprintId));
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

        // Update blueprint with generated content (keep markdown for rich formatting)
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

        // Generate first AI message using v2 agent
        const state = {
          mode: "initial_questions" as ConversationMode,
          essentialData: {},
          generatedBlueprint: undefined,
          conversationHistory: [],
        };

        const response = await generateNextMessageV2(state, null, author);

        // Save conversation history
        const conversationHistory = [
          { role: "assistant" as const, content: response.message, timestamp: new Date().toISOString() },
        ];

        await db.updateStoryBlueprint(input.blueprintId, {
          conversationHistory: conversationHistory as any,
          conversationMode: "initial_questions",
        });

        return {
          message: response.message,
          suggestions: response.suggestions,
          conversationMode: "initial_questions",
          progress: response.progress,
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
        const conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = blueprint.conversationHistory
          ? (blueprint.conversationHistory as any).map((msg: any) => ({ role: msg.role, content: msg.content }))
          : [];

        // Get author profile
        const author = await db.getAuthorByUserId(ctx.user.id);
        
        // Get conversation mode
        const mode = (blueprint.conversationMode as ConversationMode) || "initial_questions";
        const essentialData = (blueprint.essentialData as any) || {};

        // Build state for v2 agent
        const state = {
          mode,
          essentialData,
          generatedBlueprint: blueprint.blueprintGenerated ? {
            projectType: blueprint.projectType,
            workingTitle: blueprint.workingTitle,
            targetLength: blueprint.targetLength,
            primaryGenre: blueprint.primaryGenre,
            secondaryGenre: blueprint.secondaryGenre,
            corePremise: blueprint.corePremise,
            protagonistData: blueprint.protagonistData,
            supportingCharacters: blueprint.supportingCharacters,
            timePeriod: blueprint.timePeriod,
            location: blueprint.location,
            settingData: blueprint.settingData,
            plotStructure: blueprint.plotStructure,
            audienceData: blueprint.audienceData,
            thematicElements: blueprint.thematicElements,
          } : undefined,
          conversationHistory,
        };

        // Generate AI response using v2 agent
        let response;
        try {
          response = await generateNextMessageV2(state, input.message, author);
        } catch (error) {
          console.error("[blueprint.sendMessage] Error generating AI response:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate AI response: " + (error as Error).message });
        }

        // Add messages to history
        conversationHistory.push({ role: "user", content: input.message });
        conversationHistory.push({ role: "assistant", content: response.message });

        // Extract essential data if in initial_questions mode
        let updatedEssentialData = essentialData;
        let nextMode = mode;
        let blueprintResponse: any = null;
        
        // Initialize update data object
        const updateData: any = {
          conversationHistory: conversationHistory as any,
          conversationMode: nextMode,
          essentialData: updatedEssentialData,
        };
        
        if (mode === "initial_questions") {
          const extracted = await extractEssentialData(input.message, conversationHistory);
          updatedEssentialData = { ...essentialData, ...extracted };
          
          // Check if we have all essential data (including branching path completion)
          let shouldGenerateBlueprint = false;
          
          if (updatedEssentialData.wantsDetailedOnboarding === true) {
            // Detailed path: need all 3 essential + all 3 detailed + pages
            shouldGenerateBlueprint = !!updatedEssentialData.projectType && 
                                     !!updatedEssentialData.briefDescription && 
                                     !!updatedEssentialData.targetAudience && 
                                     !!updatedEssentialData.detailedContext?.themes &&
                                     !!updatedEssentialData.detailedContext?.tone &&
                                     !!updatedEssentialData.detailedContext?.structure &&
                                     !!updatedEssentialData.targetPages;
          } else if (updatedEssentialData.wantsDetailedOnboarding === false) {
            // Quick path: need 3 essential + pages
            shouldGenerateBlueprint = !!updatedEssentialData.projectType && 
                                     !!updatedEssentialData.briefDescription && 
                                     !!updatedEssentialData.targetAudience && 
                                     !!updatedEssentialData.targetPages;
          }
          
          if (shouldGenerateBlueprint) {
            nextMode = "blueprint_generation";
            
            // Automatically generate blueprint
            const blueprintState = {
              mode: "blueprint_generation" as ConversationMode,
              essentialData: updatedEssentialData,
              generatedBlueprint: undefined,
              conversationHistory,
            };
            
            try {
              console.log("[blueprint.sendMessage] Triggering automatic blueprint generation...");
              blueprintResponse = await generateNextMessageV2(blueprintState, null, author);
              console.log("[blueprint.sendMessage] Blueprint generated successfully:", blueprintResponse.blueprintData ? "YES" : "NO");
            } catch (error) {
              console.error("[blueprint.sendMessage] Error generating blueprint:", error);
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate blueprint: " + (error as Error).message });
            }
            
            // Save generated blueprint
            if (blueprintResponse.blueprintData) {
              updateData.blueprintGenerated = true;
              updateData.projectType = blueprintResponse.blueprintData.projectType;
              updateData.workingTitle = blueprintResponse.blueprintData.workingTitle;
              updateData.targetLength = blueprintResponse.blueprintData.targetLength;
              updateData.targetPages = updatedEssentialData.targetPages || null; // Save user-selected page count
              updateData.primaryGenre = blueprintResponse.blueprintData.primaryGenre;
              updateData.secondaryGenre = blueprintResponse.blueprintData.secondaryGenre;
              updateData.corePremise = blueprintResponse.blueprintData.corePremise;
              updateData.protagonistData = blueprintResponse.blueprintData.protagonistData;
              updateData.supportingCharacters = blueprintResponse.blueprintData.supportingCharacters;
              updateData.timePeriod = blueprintResponse.blueprintData.timePeriod;
              updateData.location = blueprintResponse.blueprintData.location;
              updateData.settingData = blueprintResponse.blueprintData.settingData;
              updateData.plotStructure = blueprintResponse.blueprintData.plotStructure;
              updateData.audienceData = blueprintResponse.blueprintData.audienceData;
              updateData.thematicElements = blueprintResponse.blueprintData.thematicElements;
              nextMode = "refinement";
              updateData.conversationMode = nextMode;
              
              // Add blueprint generation message to history
              conversationHistory.push({ role: "assistant", content: blueprintResponse.message });
            }
          }
        }

        // Update final values before saving
        updateData.conversationHistory = conversationHistory as any;
        updateData.conversationMode = nextMode;
        updateData.essentialData = updatedEssentialData;

        await db.updateStoryBlueprint(input.blueprintId, updateData);

        // Determine which response to return (blueprint generation or regular response)
        const finalResponse = (mode === "initial_questions" && nextMode === "refinement") 
          ? blueprintResponse! 
          : response;

        return {
          message: finalResponse.message,
          suggestions: finalResponse.suggestions || [],
          conversationMode: nextMode,
          blueprintGenerated: !!finalResponse.blueprintData,
          progress: finalResponse.progress,
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

    // Generate chapter outline from blueprint
    generateChapterOutline: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storyBlueprints, chapterOutlines } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        const { invokeLLM } = await import("./_core/llm");

        // Get blueprint
        const blueprint = await db.select().from(storyBlueprints).where(eq(storyBlueprints.id, input.blueprintId)).limit(1);
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });

        // Generate chapter outline using AI
        const prompt = `Based on this book blueprint, generate a detailed chapter-by-chapter outline for a ${blueprint[0].projectType || "novel"}.

Blueprint:
${JSON.stringify(blueprint[0].essentialData, null, 2)}

Generate 20 chapters. For each chapter, provide:
1. Chapter title (creative and engaging, NO markdown symbols)
2. Chapter summary (2-3 sentences describing what happens, NO markdown symbols)

IMPORTANT: Use PLAIN TEXT only - NO markdown symbols (##, **, *, etc.) in titles or summaries.

Return ONLY a JSON object with this structure:
{
  "chapters": [
    {"title": "Chapter Title", "summary": "What happens in this chapter..."},
    ...
  ]
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional book editor helping authors structure their books." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "chapter_outline",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        summary: { type: "string" }
                      },
                      required: ["title", "summary"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["chapters"],
                additionalProperties: false
              }
            }
          }
        });

        const messageContent = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        const outlineData = JSON.parse(messageContent || "{}");

        // Delete existing outline if any
        await db.delete(chapterOutlines).where(eq(chapterOutlines.blueprintId, input.blueprintId));

        // Save outline to database (markdown-free)
        await db.insert(chapterOutlines).values({
          blueprintId: input.blueprintId,
          outline: outlineData,
          approved: false,
        });

        return { success: true, outline: outlineData };
      }),

    // Get chapter outline for a blueprint
    getChapterOutline: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { chapterOutlines } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        const outline = await db.select().from(chapterOutlines)
          .where(eq(chapterOutlines.blueprintId, input.blueprintId))
          .limit(1);

        return outline[0] || null;
      }),

    // Approve chapter outline
    approveChapterOutline: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { chapterOutlines } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await db.update(chapterOutlines)
          .set({ approved: true })
          .where(eq(chapterOutlines.blueprintId, input.blueprintId));

        return { success: true };
      }),

    // Save book structure selections
    saveBookStructure: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        hasPrologue: z.boolean(),
        hasDedication: z.boolean(),
        hasAcknowledgements: z.boolean(),
        hasEpilogue: z.boolean(),
        hasAuthorBio: z.boolean(),
        hasAlsoBy: z.boolean(),
        hasNewsletter: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { bookStructures } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        // Check if structure already exists
        const existing = await db.select().from(bookStructures)
          .where(eq(bookStructures.blueprintId, input.blueprintId))
          .limit(1);

        if (existing[0]) {
          // Update existing
          await db.update(bookStructures)
            .set({
              hasPrologue: input.hasPrologue,
              hasDedication: input.hasDedication,
              hasAcknowledgements: input.hasAcknowledgements,
              hasEpilogue: input.hasEpilogue,
              hasAuthorBio: input.hasAuthorBio,
              hasAlsoBy: input.hasAlsoBy,
              hasNewsletter: input.hasNewsletter,
            })
            .where(eq(bookStructures.blueprintId, input.blueprintId));
        } else {
          // Create new
          await db.insert(bookStructures).values({
            blueprintId: input.blueprintId,
            hasPrologue: input.hasPrologue,
            hasDedication: input.hasDedication,
            hasAcknowledgements: input.hasAcknowledgements,
            hasEpilogue: input.hasEpilogue,
            hasAuthorBio: input.hasAuthorBio,
            hasAlsoBy: input.hasAlsoBy,
            hasNewsletter: input.hasNewsletter,
          });
        }

        return { success: true };
      }),

    // Get book structure selections
    getBookStructure: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { bookStructures } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        const structure = await db.select().from(bookStructures)
          .where(eq(bookStructures.blueprintId, input.blueprintId))
          .limit(1);

        return structure[0] || null;
      }),

    // Get manuscript progress (which chapters/sections are complete)
    getProgress: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { manuscripts } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        const allManuscripts = await db.select().from(manuscripts)
          .where(eq(manuscripts.blueprintId, input.blueprintId));

        return allManuscripts;
      }),

    // Generate a single chapter
    generateChapter: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        sectionType: z.enum(["prologue", "copyright", "chapter", "epilogue", "dedication", "acknowledgements", "authorBio", "alsoBy", "newsletter"]),
        sectionNumber: z.number().optional(),
        sectionTitle: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts, storyBlueprints, chapterOutlines } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, and, isNull } = await import("drizzle-orm");
        const { invokeLLM } = await import("./_core/llm");

        // Get blueprint data
        const blueprint = await db.select().from(storyBlueprints)
          .where(eq(storyBlueprints.id, input.blueprintId))
          .limit(1);
        
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });

        // Get chapter outline if it's a chapter
        let chapterOutline = null;
        if (input.sectionType === "chapter" && input.sectionNumber) {
          const outlines = await db.select().from(chapterOutlines)
            .where(eq(chapterOutlines.blueprintId, input.blueprintId))
            .limit(1);
          
          if (outlines[0] && outlines[0].outline) {
            const outlineData = outlines[0].outline as { chapters: any[] };
            // sectionNumber is 1-indexed, array is 0-indexed
            chapterOutline = outlineData.chapters[input.sectionNumber - 1];
          }
        }

        // Check if manuscript already exists
        const conditions = [
          eq(manuscripts.blueprintId, input.blueprintId),
          eq(manuscripts.sectionType, input.sectionType),
        ];
        if (input.sectionNumber !== undefined) {
          conditions.push(eq(manuscripts.sectionNumber, input.sectionNumber));
        } else {
          conditions.push(isNull(manuscripts.sectionNumber));
        }
        const existing = await db.select().from(manuscripts)
          .where(and(...conditions))
          .limit(1);

        let manuscriptId: number;

        if (existing[0]) {
          // Update status to generating
          await db.update(manuscripts)
            .set({ status: "generating" })
            .where(eq(manuscripts.id, existing[0].id));
          manuscriptId = existing[0].id;
        } else {
          // Create new manuscript entry
          const [result] = await db.insert(manuscripts).values({
            blueprintId: input.blueprintId,
            sectionType: input.sectionType,
            sectionNumber: input.sectionNumber || null,
            sectionTitle: input.sectionTitle,
            status: "generating",
          }).$returningId();
          manuscriptId = result.id;
        }

        // Build AI prompt based on section type
        let prompt = "";
        const blueprintData = blueprint[0];
        
        // DEBUG LOGGING - Start
        console.log("=== CHAPTER GENERATION DEBUG ===");
        console.log("Blueprint ID:", blueprintData.id);
        console.log("Working Title:", blueprintData.workingTitle);
        console.log("blueprintContent status:", 
          blueprintData.blueprintContent === null ? "NULL" : 
          blueprintData.blueprintContent === "" ? "EMPTY" : 
          `HAS_DATA (${blueprintData.blueprintContent?.length} chars)`);
        console.log("essentialData status:", 
          blueprintData.essentialData === null ? "NULL" : 
          blueprintData.essentialData === undefined ? "UNDEFINED" : 
          `HAS_DATA (${JSON.stringify(blueprintData.essentialData).length} chars)`);
        if (blueprintData.essentialData) {
          console.log("essentialData keys:", Object.keys(blueprintData.essentialData));
        }
        
        // Use blueprintContent if available, otherwise use essentialData
        const blueprintInfo = blueprintData.blueprintContent || JSON.stringify(blueprintData.essentialData, null, 2) || "No blueprint data available";
        
        console.log("Final blueprintInfo length:", blueprintInfo.length);
        console.log("First 500 chars of blueprintInfo:", blueprintInfo.substring(0, 500));
        console.log("=== END DEBUG ===");

        // Extract target audience from blueprint
        const essentialData = blueprintData.essentialData as { targetAudience?: string; projectType?: string; briefDescription?: string } | null;
        const targetAudience = essentialData?.targetAudience || "general readers";
        const projectType = blueprintData.projectType || essentialData?.projectType || "book";
        
        // Build audience-specific writing instructions
        let audienceInstructions = "";
        const audienceLower = targetAudience.toLowerCase();
        
        if (audienceLower.includes("beginner") || audienceLower.includes("new") || audienceLower.includes("novice")) {
          audienceInstructions = `
AUDIENCE ADAPTATION (CRITICAL):
This book is for ${targetAudience}. You MUST:
- Use simple, clear language that anyone can understand
- Explain all technical terms and jargon when first introduced
- Include concrete examples and analogies to illustrate concepts
- Break down complex ideas into digestible steps
- Avoid assuming prior knowledge
- Use conversational tone while maintaining professionalism
- Add practical examples that beginners can relate to`;
        } else if (audienceLower.includes("advanced") || audienceLower.includes("expert") || audienceLower.includes("professional")) {
          audienceInstructions = `
AUDIENCE ADAPTATION:
This book is for ${targetAudience}. You should:
- Use industry-standard terminology
- Assume foundational knowledge
- Focus on advanced concepts and nuances
- Include technical depth and precision`;
        } else {
          audienceInstructions = `
AUDIENCE: ${targetAudience}
- Write in a style appropriate for this audience
- Balance accessibility with depth`;
        }

        if (input.sectionType === "chapter") {
          prompt = `You are an Author-First Writing AI designed to write complete, publish-ready chapters with confidence and momentum.

**Your Core Principles:**
- Assume intelligently - make strong creative decisions based on the blueprint
- Generate confidently - produce complete, polished content without hesitation
- Never interrupt creative flow - no mid-chapter questions or clarifications
- Write like a human author, not an AI tool

**Book Blueprint:**
${blueprintInfo}
${audienceInstructions}

**Chapter to Write:**
Chapter ${input.sectionNumber}: ${input.sectionTitle}
${chapterOutline ? `Summary: ${chapterOutline.summary}` : ""}

**Writing Instructions:**

1. CONTENT REQUIREMENTS:
   - Write the COMPLETE chapter (2,500-3,500 words)
   - Do NOT include "Chapter X" heading - just write the content
   - Maintain full awareness of the book blueprint and previous chapters
   - Ensure consistency with established themes, tone, and character/concept voice
   - Never contradict earlier content unless explicitly changing direction

2. WRITING STYLE (CRITICAL):
   - Write in clear, human, direct language
   - Use concrete examples and vivid descriptions
   - Adapt style precisely to the target audience specified above
   - Write in narrative/expository style, NOT bullet points
   - Include smooth transitions between ideas

3. FORBIDDEN AI PHRASES (NEVER USE):
   ❌ "Unlock" / "Unlock the secrets"
   ❌ "Dive into" / "Dive deep"
   ❌ "Revolutionary" / "Game-changing"
   ❌ "In today's fast-paced world"
   ❌ "Embark on a journey"
   ❌ "Transform your life"
   
   Instead: Be specific, concrete, and authentic.

4. FORMATTING RULES:
   - Use markdown for emphasis (bold, italic) but NO headers (##)
   - NO LATEX FORMULAS! Use plain text:
     ❌ WRONG: \text{FI Number} = \frac{\text{Annual Expenses}}{0.04}
     ✅ CORRECT: FI Number = Annual Expenses ÷ 0.04
     Use symbols: ÷, ×, ±, ≈, (), [], {}

5. TABLE REQUIREMENTS (IF APPLICABLE):
   - Use proper markdown table syntax with header separator:
     | Column 1 | Column 2 | Column 3 |
     |----------|----------|----------|
     | Data 1   | Data 2   | Data 3   |
   - NO PLACEHOLDER DASHES (---) IN TABLES!
   - Every cell MUST contain actual calculated data
   - ❌ WRONG: | --- | --- | --- |
   - ✅ CORRECT: | 30 | 30 | $1,010 |
   - If you cannot calculate exact values, use reasonable estimates

**Your Success Criteria:**
- The chapter reads like it was written by a professional author
- The content flows naturally and maintains reader engagement
- No generic AI-sounding language
- Complete, publish-ready prose

Generate the full chapter content now:`
        } else if (input.sectionType === "prologue") {
          prompt = `You are a professional author. Write a compelling PROLOGUE for this book based on the blueprint below.

**Book Blueprint:**
${blueprintInfo}

**Instructions:**
- Write a complete prologue (800-1,200 words)
- Set the stage for the main story
- Create intrigue and hook the reader
- Use engaging, professional prose
- Do NOT include "Prologue" heading - just write the content`;
        } else if (input.sectionType === "epilogue") {
          prompt = `You are a professional author. Write a satisfying EPILOGUE for this book based on the blueprint below.

**Book Blueprint:**
${blueprintInfo}

**Instructions:**
- Write a complete epilogue (800-1,200 words)
- Provide closure and resolution
- Show what happens after the main story
- Use engaging, professional prose
- Do NOT include "Epilogue" heading - just write the content`;
        } else if (input.sectionType === "dedication") {
          prompt = `Write a heartfelt book DEDICATION (1-3 sentences) for this book:

**Book Title:** ${blueprintData.workingTitle}
**Book Theme:** ${blueprintData.blueprintContent?.substring(0, 200)}

Create a professional, touching dedication. Just write the dedication text, no heading.`;
        } else if (input.sectionType === "copyright") {
          // Get author info for copyright
          const { authors } = await import("../drizzle/schema");
          const authorProfile = await db.select().from(authors)
            .where(eq(authors.userId, ctx.user.id))
            .limit(1);
          
          const author = authorProfile[0];
          const authorName = author?.penName || ctx.user.name || "[Author Name]";
          const currentYear = new Date().getFullYear();
          
          prompt = `Generate a professional COPYRIGHT PAGE for this book:

**Book Title:** ${blueprintData.workingTitle}
**Author Name:** ${authorName}
**Copyright Year:** ${currentYear}

Include:
1. Copyright notice: "Copyright © ${currentYear} by ${authorName}. All rights reserved."
2. Standard rights statement (no part may be reproduced without permission)
3. Publisher info placeholder (if self-published)
4. ISBN placeholder
5. Disclaimer (This is a work of fiction...)

Format professionally. Just write the copyright page content, no heading.`;
        } else if (input.sectionType === "acknowledgements") {
          prompt = `Write professional ACKNOWLEDGEMENTS (2-3 paragraphs) for this book:

**Book Title:** ${blueprintData.workingTitle}

Thank the people who typically help authors: editors, beta readers, family, supporters, etc. Make it warm and professional. Just write the acknowledgements text, no heading.`;
        } else if (input.sectionType === "authorBio") {
          // Get author profile to use their bio
          const { authors } = await import("../drizzle/schema");
          const authorProfile = await db.select().from(authors)
            .where(eq(authors.userId, ctx.user.id))
            .limit(1);
          
          const author = authorProfile[0];
          
          if (author && author.bio) {
            // Use the author's profile bio directly
            prompt = `Format this author bio for publication in a book:

${author.bio}

Ensure it's in third person, professional, and compelling. If the author's name is a placeholder like "[Author Name Here]", replace it with "${author.penName || ctx.user.name || 'the author'}".
Just return the formatted bio text, no heading.`;
          } else {
            // Fallback: Generate a generic bio
            prompt = `Write a professional AUTHOR BIO (150-200 words) for the author of this book:

**Book Title:** ${blueprintData.workingTitle}
**Book Theme:** ${blueprintData.blueprintContent?.substring(0, 300)}
**Author Name:** ${author?.penName || ctx.user.name || '[Author Name]'}

Create a compelling third-person bio that establishes credibility and connects with readers. Just write the bio text, no heading.`;
          }
        } else if (input.sectionType === "alsoBy") {
          prompt = `Create an "ALSO BY THIS AUTHOR" page for this book:

**Current Book:** ${blueprintData.workingTitle}

Generate a professional list of 3-5 fictional previous books by the same author in a similar genre. Format as a simple list. Just write the list, no heading.`;
        } else if (input.sectionType === "newsletter") {
          prompt = `Write a NEWSLETTER SIGNUP invitation (100-150 words) for the end of this book:

**Book Title:** ${blueprintData.workingTitle}

Create a warm, engaging invitation for readers to join the author's email list. Mention benefits like updates on new releases, exclusive content, etc. Just write the invitation text, no heading.`;
        }

        // Generate content with AI
        const systemMessage = `You are an Author-First Writing AI - a world-class authoring system, not a chatbot.

YOUR ROLE:
- Act as a calm, confident editor and writing partner
- Make strong assumptions and proceed decisively
- Never sound like generic AI writing tools
- Write with human voice, clarity, and authenticity

ABSOLUTE REQUIREMENTS:

1. WRITING QUALITY:
   - Clear, human, direct language
   - Concrete examples over abstract concepts
   - No AI-sounding phrases: "unlock", "dive into", "revolutionary", "in today's fast-paced world"
   - Professional author voice, not robotic or formulaic

2. TABLES (IF APPLICABLE):
   - NEVER use placeholder dashes (---) or "TBD" or empty cells
   - ALL table cells MUST contain actual calculated data, real numbers, or specific text
   - If you create a comparison table, calculate ALL values for ALL rows
   - Use reasonable estimates if exact values are unknown
   
   ❌ FORBIDDEN:
   | Strategy | Return | Value |
   |----------|--------|-------|
   | ---      | ---    | ---   |
   
   ✅ REQUIRED:
   | Strategy | Return | Value |
   |----------|--------|-------|
   | Bonds    | 3.0%   | $42,789 |
   | Stocks   | 8.0%   | $100,626 |

3. FORMULAS:
   - NEVER use LaTeX syntax (\text{}, \frac{}, \sqrt{})
   - Use plain text with standard symbols: ÷, ×, ±, ≈, (), [], {}
   - Example: "FI Number = Annual Expenses ÷ 0.04"

4. CONTEXT AWARENESS:
   - Maintain full awareness of the book blueprint
   - Stay consistent with previous chapters
   - Never contradict established content
   - Preserve character voice or author voice throughout

IF UNSURE: Make a strong assumption, proceed, and let the user edit. Never stop to ask clarifying questions.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
          ],
        });

        const generatedContent = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        const wordCount = generatedContent.split(/\s+/).length;

        // Update manuscript with generated content (keep markdown for rich formatting)
        await db.update(manuscripts)
          .set({
            content: generatedContent,
            wordCount,
            status: "draft",
          })
          .where(eq(manuscripts.id, manuscriptId));

        return {
          manuscriptId,
          content: generatedContent,
          wordCount,
        };
      }),

    // Get a specific chapter/section
    getChapter: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        sectionType: z.enum(["prologue", "copyright", "chapter", "epilogue", "dedication", "acknowledgements", "authorBio", "alsoBy", "newsletter"]),
        sectionNumber: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { manuscripts } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, and, isNull } = await import("drizzle-orm");

        const conditions = [
          eq(manuscripts.blueprintId, input.blueprintId),
          eq(manuscripts.sectionType, input.sectionType),
        ];

        if (input.sectionNumber !== undefined) {
          conditions.push(eq(manuscripts.sectionNumber, input.sectionNumber));
        } else {
          conditions.push(isNull(manuscripts.sectionNumber));
        }

        const manuscript = await db.select().from(manuscripts)
          .where(and(...conditions))
          .limit(1);

        return manuscript[0] || null;
      }),

    // Approve a chapter
    approveChapter: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await db.update(manuscripts)
          .set({ status: "approved" })
          .where(eq(manuscripts.id, input.manuscriptId));

        return { success: true };
      }),

    // Unapprove a chapter (reverse approval)
    unapproveChapter: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await db.update(manuscripts)
          .set({ status: "draft" })
          .where(eq(manuscripts.id, input.manuscriptId));

        return { success: true };
      }),

    // Update chapter content manually
    updateChapterContent: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
        content: z.string(),
        wordCount: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await db.update(manuscripts)
          .set({ 
            content: input.content,
            wordCount: input.wordCount,
            updatedAt: new Date(),
          })
          .where(eq(manuscripts.id, input.manuscriptId));

        return { success: true };
      }),

    // Request edit via AI chat
    requestEdit: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
        userMessage: z.string(),
        currentContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts, chapterEdits } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        const { invokeLLM } = await import("./_core/llm");

        // Get manuscript details
        const manuscript = await db.select().from(manuscripts)
          .where(eq(manuscripts.id, input.manuscriptId))
          .limit(1);

        if (!manuscript[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Manuscript not found" });

        // Generate AI response with edit using research-based approach
        const systemMessage = `You are a professional book editor specializing in creative writing and content adaptation.

CORE PRINCIPLE: When asked to rewrite or edit content, you MUST produce completely different wording. Never return the same text unchanged.

EDITING GUIDELINES:

1. AUDIENCE ADAPTATION:
   - "for beginners" or "for new investors" = Use simple language, explain jargon, add concrete examples
   - "more professional" = Use formal tone, industry terminology, authoritative voice
   - "for experts" = Use technical language, assume prior knowledge

2. REWRITING MODES:
   - "Rewrite" = Completely rephrase every sentence while keeping the same meaning
   - "Simplify" = Break complex ideas into simple, clear language
   - "Expand" = Add details, examples, explanations, and context
   - "Shorten" = Condense to essential points, remove redundancy
   - "Improve" = Enhance prose quality, add vivid details, strengthen narrative

3. FEW-SHOT EXAMPLES:

   Example 1 - Simplifying for new investors:
   BEFORE: "Utilize dollar-cost averaging to mitigate volatility exposure."
   AFTER: "Invest the same amount regularly. This reduces the risk of buying at the wrong time."

   Example 2 - Complete rewrite:
   BEFORE: "The market experienced significant turbulence."
   AFTER: "Stock prices swung wildly up and down."

   Example 3 - Adding examples:
   BEFORE: "Diversification reduces risk."
   AFTER: "Diversification reduces risk. For instance, instead of putting all your money in tech stocks, spread it across technology, healthcare, and real estate."

4. FORMATTING:
   - Use markdown for emphasis (bold, italic) but avoid headers (##)
   - For tables, use proper markdown syntax with header separators
   - Calculate all table values - never use placeholders like "---"

5. WORD COUNT:
   - Maintain similar length (±10%) unless specifically asked to change
   - For "shorten": aim for 50-70% of original
   - For "expand": aim for 150-200% of original

REMEMBER: The author expects to see actual changes. Every sentence should be rewritten, not just slightly tweaked.`;

        const userMessage = `Original Content:
${input.currentContent}

Edit Request: ${input.userMessage}

Provide the complete revised content following the editing guidelines.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
          ],
        });

        let revisedContent = typeof response.choices[0].message.content === 'string' 
          ? response.choices[0].message.content 
          : JSON.stringify(response.choices[0].message.content);
        
        // Remove markdown headers (##) from output as per user preference
        revisedContent = revisedContent.replace(/^#{1,6}\s+/gm, '');
        const wordCount = revisedContent.split(/\s+/).length;

        // Save the edit to history
        await db.insert(chapterEdits).values({
          manuscriptId: input.manuscriptId,
          userMessage: input.userMessage,
          aiResponse: revisedContent,
        });

        // Update manuscript with revised content
        await db.update(manuscripts)
          .set({
            content: revisedContent,
            wordCount,
          })
          .where(eq(manuscripts.id, input.manuscriptId));

        return {
          revisedContent,
          wordCount,
        };
      }),

    // Initialize manuscript chapters for a blueprint
    initialize: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
        totalChapters: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { chapters, storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        // Get blueprint to get bookId
        const blueprint = await db.select().from(storyBlueprints).where(eq(storyBlueprints.id, input.blueprintId)).limit(1);
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });
        
        // Create book if blueprint has no associated book
        let bookId = blueprint[0].bookId;
        if (!bookId) {
          const { books } = await import("../drizzle/schema");
          const [newBook] = await db.insert(books).values({
            authorId: ctx.user.id,
            title: blueprint[0].workingTitle || "Untitled Book",
            genre: "Fiction",
            status: "drafting",
            totalChapters: input.totalChapters,
          }).$returningId();
          bookId = newBook.id;
          
          // Update blueprint with bookId
          await db.update(storyBlueprints)
            .set({ bookId })
            .where(eq(storyBlueprints.id, input.blueprintId));
        }

        // Create chapters
        const chapterValues = [];
        for (let i = 1; i <= input.totalChapters; i++) {
          chapterValues.push({
            bookId: bookId,
            chapterNumber: i,
            title: `Chapter ${i}`,
            content: "",
            wordCount: 0,
            status: "planned" as const,
          });
        }

        await db.insert(chapters).values(chapterValues);

        // Update blueprint
        await db.update(storyBlueprints)
          .set({ 
            manuscriptStarted: true,
          })
          .where(eq(storyBlueprints.id, input.blueprintId));

        // Update book with total chapters
        const { books } = await import("../drizzle/schema");
        await db.update(books)
          .set({ totalChapters: input.totalChapters })
          .where(eq(books.id, bookId));

        return { success: true };
      }),

    // Get all chapters for a blueprint
    getChapters: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const { chapters, storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, asc } = await import("drizzle-orm");

        // Get blueprint to get bookId
        const blueprint = await db.select().from(storyBlueprints).where(eq(storyBlueprints.id, input.blueprintId)).limit(1);
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });
        if (!blueprint[0].bookId) return [];

        // Get chapters
        const bookChapters = await db.select().from(chapters)
          .where(eq(chapters.bookId, blueprint[0].bookId))
          .orderBy(asc(chapters.chapterNumber));

        return bookChapters;
      }),

    // Save chapter content
    saveChapter: protectedProcedure
      .input(z.object({
        chapterId: z.number(),
        title: z.string(),
        content: z.string(),
        wordCount: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { chapters } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        await db.update(chapters)
          .set({
            title: input.title,
            content: input.content,
            wordCount: input.wordCount,
            status: input.content.trim() ? "drafting" : "planned",
          })
          .where(eq(chapters.id, input.chapterId));

        return { success: true };
      }),

    // Mark chapter as complete
    markComplete: protectedProcedure
      .input(z.object({
        chapterId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { chapters, storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        // Mark chapter complete
        await db.update(chapters)
          .set({ status: "completed" })
          .where(eq(chapters.id, input.chapterId));

        // Check if all chapters are complete
        const chapter = await db.select().from(chapters).where(eq(chapters.id, input.chapterId)).limit(1);
        if (!chapter[0]) return { success: true };

        const allChapters = await db.select().from(chapters).where(eq(chapters.bookId, chapter[0].bookId));
        const allComplete = allChapters.every((c: any) => c.status === "completed");

        if (allComplete) {
          // Update blueprint
          const blueprint = await db.select().from(storyBlueprints).where(eq(storyBlueprints.bookId, chapter[0].bookId)).limit(1);
          if (blueprint[0]) {
            await db.update(storyBlueprints)
              .set({ manuscriptCompleted: true })
              .where(eq(storyBlueprints.id, blueprint[0].id));
          }
        }

        return { success: true };
      }),

    // Generate 3 rewrite variations for a chapter
    generateRewriteVariations: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
        editInstructions: z.string(),
        currentContent: z.string(),
        chapterTitle: z.string(),
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storyBlueprints } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");
        const { invokeLLM } = await import("./_core/llm");

        // Get blueprint for context
        const blueprint = await db.select().from(storyBlueprints)
          .where(eq(storyBlueprints.id, input.blueprintId))
          .limit(1);
        
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });

        // Generate 3 variations with different creative approaches
        const variations = await Promise.all([
          // Variation 1: Conservative (minor improvements, preserve structure)
          invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an Author-First Writing AI generating a CONSERVATIVE rewrite variation.

Approach: Make minor improvements while preserving the original structure and flow. Focus on clarity, polish, and subtle enhancements. Keep 80-90% of the original intact.

User's edit request: ${input.editInstructions}

Book context:
${JSON.stringify(blueprint[0].essentialData, null, 2)}

IMPORTANT:
- Return ONLY the rewritten chapter content in markdown format
- NO explanations, NO meta-commentary, NO "Here's the rewrite" text
- Start directly with the chapter content
- Use plain text formulas (NO LaTeX: \\text{}, \\frac{}, etc.)
- Avoid AI phrases: "unlock", "dive into", "revolutionary", "embark on a journey"`
              },
              {
                role: "user",
                content: `Chapter Title: ${input.chapterTitle}\n\nCurrent Content:\n${input.currentContent}`
              }
            ]
          }),

          // Variation 2: Moderate (balanced changes, some restructuring)
          invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an Author-First Writing AI generating a MODERATE rewrite variation.

Approach: Make balanced changes with some restructuring. Improve flow, add depth, and enhance engagement. Keep 60-70% of the original, restructure 30-40%.

User's edit request: ${input.editInstructions}

Book context:
${JSON.stringify(blueprint[0].essentialData, null, 2)}

IMPORTANT:
- Return ONLY the rewritten chapter content in markdown format
- NO explanations, NO meta-commentary, NO "Here's the rewrite" text
- Start directly with the chapter content
- Use plain text formulas (NO LaTeX: \\text{}, \\frac{}, etc.)
- Avoid AI phrases: "unlock", "dive into", "revolutionary", "embark on a journey"`
              },
              {
                role: "user",
                content: `Chapter Title: ${input.chapterTitle}\n\nCurrent Content:\n${input.currentContent}`
              }
            ]
          }),

          // Variation 3: Bold (creative reimagining, significant changes)
          invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an Author-First Writing AI generating a BOLD rewrite variation.

Approach: Creative reimagining with significant changes. Restructure for maximum impact, add new examples/stories, transform the narrative. Keep 40-50% of the original, reimagine 50-60%.

User's edit request: ${input.editInstructions}

Book context:
${JSON.stringify(blueprint[0].essentialData, null, 2)}

IMPORTANT:
- Return ONLY the rewritten chapter content in markdown format
- NO explanations, NO meta-commentary, NO "Here's the rewrite" text
- Start directly with the chapter content
- Use plain text formulas (NO LaTeX: \\text{}, \\frac{}, etc.)
- Avoid AI phrases: "unlock", "dive into", "revolutionary", "embark on a journey"`
              },
              {
                role: "user",
                content: `Chapter Title: ${input.chapterTitle}\n\nCurrent Content:\n${input.currentContent}`
              }
            ]
          }),
        ]);

        // Extract content as string
        const getContent = (response: any): string => {
          const content = response.choices[0].message.content;
          if (typeof content === 'string') return content;
          if (Array.isArray(content)) {
            return content.map((item: any) => item.type === 'text' ? item.text : '').join('');
          }
          return '';
        };

        return {
          variations: [
            {
              id: 1,
              approach: "conservative",
              label: "Conservative",
              description: "Minor improvements, preserves structure",
              content: getContent(variations[0]),
            },
            {
              id: 2,
              approach: "moderate",
              label: "Moderate",
              description: "Balanced changes, some restructuring",
              content: getContent(variations[1]),
            },
            {
              id: 3,
              approach: "bold",
              label: "Bold",
              description: "Creative reimagining, significant changes",
              content: getContent(variations[2]),
            },
          ],
        };
      }),

    // Download complete manuscript as DOCX
    downloadManuscript: protectedProcedure
      .input(z.object({
        blueprintId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = await import("docx");
        const { manuscripts, storyBlueprints, bookStructures, chapterOutlines } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq, asc } = await import("drizzle-orm");
        const { storagePut } = await import("./storage");

        // Get blueprint
        const blueprint = await db.select().from(storyBlueprints)
          .where(eq(storyBlueprints.id, input.blueprintId))
          .limit(1);
        if (!blueprint[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Blueprint not found" });

        // Get book structure
        const structure = await db.select().from(bookStructures)
          .where(eq(bookStructures.blueprintId, input.blueprintId))
          .limit(1);

        // Get chapter outline
        const outline = await db.select().from(chapterOutlines)
          .where(eq(chapterOutlines.blueprintId, input.blueprintId))
          .limit(1);

        // Get all approved manuscripts
        const allManuscripts = await db.select().from(manuscripts)
          .where(eq(manuscripts.blueprintId, input.blueprintId))
          .orderBy(asc(manuscripts.id));

        const approvedManuscripts = allManuscripts.filter((m: any) => m.status === "approved");

        if (approvedManuscripts.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No approved sections to download" });
        }

        // Build sections in correct order
        const sections: any[] = [];
        const struct = structure[0];
        const outlineData = outline[0]?.outline as { chapters: any[] } | null;

        if (struct?.hasPrologue) sections.push({ type: "prologue", title: "Prologue" });
        if (struct?.hasCopyright) sections.push({ type: "copyright", title: "Copyright" });
        if (struct?.hasDedication) sections.push({ type: "dedication", title: "Dedication" });

        // Add chapters
        if (outlineData?.chapters) {
          outlineData.chapters.forEach((ch: any, index: number) => {
            sections.push({ type: "chapter", number: index + 1, title: ch.title });
          });
        }

        if (struct?.hasEpilogue) sections.push({ type: "epilogue", title: "Epilogue" });
        if (struct?.hasAcknowledgements) sections.push({ type: "acknowledgements", title: "Acknowledgements" });
        if (struct?.hasAuthorBio) sections.push({ type: "authorBio", title: "Author Bio" });
        if (struct?.hasAlsoBy) sections.push({ type: "alsoBy", title: "Also By This Author" });
        if (struct?.hasNewsletter) sections.push({ type: "newsletter", title: "Newsletter Signup" });

        // Create DOCX document
        const docSections: any[] = [];

        // Title page
        docSections.push(
          new Paragraph({
            text: blueprint[0].workingTitle || "Untitled",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: ctx.user.name || "Author",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({ text: "", pageBreakBefore: true })
        );

        // Add each section
        for (const section of sections) {
          const manuscript = approvedManuscripts.find((m: any) => 
            m.sectionType === section.type && 
            (section.type !== "chapter" || m.sectionNumber === section.number)
          );

          if (manuscript) {
            // Section heading
            docSections.push(
              new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
              })
            );

            // Section content
            const content = manuscript.content || "";
            const paragraphs = content.split("\n\n");
            paragraphs.forEach((para: string) => {
              if (para.trim()) {
                docSections.push(
                  new Paragraph({
                    text: para.trim(),
                    spacing: { after: 200 },
                  })
                );
              }
            });

            // Page break after each section
            docSections.push(
              new Paragraph({ text: "", pageBreakBefore: true })
            );
          }
        }

        // Create document
        const doc = new Document({
          sections: [{
            properties: {},
            children: docSections,
          }],
        });

        // Generate buffer
        const { Packer } = await import("docx");
        const buffer = await Packer.toBuffer(doc);

        // Upload to S3
        const fileName = `${blueprint[0].workingTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'manuscript'}_${Date.now()}.docx`;
        const fileKey = `manuscripts/${ctx.user.id}/${fileName}`;
        const { url } = await storagePut(fileKey, buffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        return { 
          url, 
          fileName,
          sectionCount: approvedManuscripts.length,
        };
      }),

    // Sync Author Bio from Profile
    syncAuthorBioFromProfile: protectedProcedure
      .input(z.object({
        manuscriptId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { manuscripts, authors } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const { eq } = await import("drizzle-orm");

        // Get manuscript
        const { storyBlueprints } = await import("../drizzle/schema");
        const manuscript = await db.select().from(manuscripts)
          .where(eq(manuscripts.id, input.manuscriptId))
          .limit(1);
        if (!manuscript[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Manuscript not found" });
        
        // Check authorization via blueprint
        const blueprint = await db.select().from(storyBlueprints)
          .where(eq(storyBlueprints.id, manuscript[0].blueprintId))
          .limit(1);
        if (!blueprint[0] || blueprint[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Get author profile
        const authorProfile = await db.select().from(authors)
          .where(eq(authors.userId, ctx.user.id))
          .limit(1);
        
        const author = authorProfile[0];
        if (!author || !author.bio) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No bio found in profile. Please add your bio in the Profile page first." });
        }

        // Replace placeholders in bio with actual author name
        const authorName = author.penName || ctx.user.name || "the author";
        let personalizedBio = author.bio;
        
        // Replace various placeholder formats
        personalizedBio = personalizedBio.replace(/\[Author Name Here\]/g, authorName);
        personalizedBio = personalizedBio.replace(/\[Author Name\/They\]/g, authorName);
        personalizedBio = personalizedBio.replace(/\[Author Name\]/g, authorName);
        personalizedBio = personalizedBio.replace(/\[They\]/g, authorName);

        // Calculate word count
        const wordCount = personalizedBio.split(/\s+/).filter(w => w.length > 0).length;

        // Update manuscript
        await db.update(manuscripts)
          .set({
            content: personalizedBio,
            wordCount,
            status: "draft", // Set to draft so user can review before approving
            updatedAt: new Date(),
          })
          .where(eq(manuscripts.id, input.manuscriptId));

        return { success: true, wordCount };
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
          
          // Create or update a book in the database
          // Use initialTitle if provided, otherwise use first AI-suggested title
          const bookTitle = input.initialTitle || analysis.suggestedTitles[0];
          console.log('[manuscriptAnalysis.analyze] Book title:', bookTitle);
          
          // Check if a book with this title already exists for this author
          const existingBook = await db.getBookByTitleAndAuthor(bookTitle, author.id);
          
          let bookId: number;
          
          if (existingBook) {
            console.log('[manuscriptAnalysis.analyze] Found existing book, updating:', existingBook.id);
            
            // Build update data object with only defined fields
            const updateData: any = {
              wordCount: input.wordCount,
              status: "drafting" as const,
            };
            
            // Only add optional fields if they exist
            if (analysis.suggestedSubtitles && analysis.suggestedSubtitles[0]) {
              updateData.subtitle = analysis.suggestedSubtitles[0];
            }
            if (analysis.detectedGenre) {
              updateData.genre = analysis.detectedGenre;
            }
            if (input.wordCount) {
              updateData.targetWordCount = input.wordCount;
            }
            if (input.manuscript) {
              updateData.content = input.manuscript;
            }
            
            await db.updateBook(existingBook.id, updateData);
            bookId = existingBook.id;
            console.log('[manuscriptAnalysis.analyze] Book updated:', bookId);
          } else {
            console.log('[manuscriptAnalysis.analyze] Creating new book with title:', bookTitle);
            
            // Build book data object with only defined fields
            const bookData: any = {
              authorId: author.id,
              title: bookTitle,
              wordCount: input.wordCount,
              status: "drafting" as const,
            };
            
            // Only add optional fields if they exist
            if (analysis.suggestedSubtitles && analysis.suggestedSubtitles[0]) {
              bookData.subtitle = analysis.suggestedSubtitles[0];
            }
            if (analysis.detectedGenre) {
              bookData.genre = analysis.detectedGenre;
            }
            if (input.wordCount) {
              bookData.targetWordCount = input.wordCount;
            }
            if (input.manuscript) {
              bookData.content = input.manuscript;
            }
            
            const createdBook = await db.createBook(bookData);
            bookId = createdBook.id;
            console.log('[manuscriptAnalysis.analyze] Book created:', bookId);
          }
          
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

