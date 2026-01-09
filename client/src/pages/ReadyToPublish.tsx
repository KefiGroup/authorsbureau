import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, FileText, Sparkles, Loader2, BookOpen, CheckCircle2,
  Lightbulb, TrendingUp, Edit3, RefreshCw, Download, Image as ImageIcon,
  Check, ArrowRight, ArrowLeft, Save, Clock, AlertCircle, User, Palette, Trash2, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { BookWrapSpecifications } from '@/components/BookWrapSpecifications';
import { PublisherChat } from "@/components/PublisherChat";
import { AmazonAccountChecklist } from "@/components/AmazonAccountChecklist";
import { KDPPublishingAssistant } from "@/components/KDPPublishingAssistant";
import { CoverUpload } from "@/components/CoverUpload";
import { InteriorPreview } from "@/components/InteriorPreview";
import { CoverCustomizer } from "@/components/CoverCustomizer";
import { KDPUploadGuide } from "@/components/KDPUploadGuide";
import { AuthorProfilePrompt } from "@/components/AuthorProfilePrompt";
import { ManuscriptPreviewModal } from "@/components/ManuscriptPreviewModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WorkflowStep = "upload" | "analyzing" | "review" | "profile-check" | "cover" | "amazon" | "wrap" | "export" | "author-central";

interface AIAnalysis {
  suggestedTitles: string[];
  suggestedSubtitles: string[];
  detectedGenre: string;
  themes: string[];
  targetAudience: string;
  bookDescription: string;
  keyBenefits: string[];
  tone: string;
  wordCount: number;
}

export default function ReadyToPublish() {
  const [location, setLocation] = useLocation();
  const bookIdFromUrl = new URLSearchParams(window.location.search).get('bookId');
  const [bookId, setBookId] = useState<number | null>(bookIdFromUrl ? parseInt(bookIdFromUrl) : null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("upload");
  const [accountChecklistComplete, setAccountChecklistComplete] = useState(false);
  const [showInteriorPreview, setShowInteriorPreview] = useState(false);
  const [customizingCover, setCustomizingCover] = useState<string | null>(null);
  const [showKDPGuide, setShowKDPGuide] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Back navigation helper
  const handleBackNavigation = () => {
    const stepOrder: WorkflowStep[] = ["upload", "analyzing", "review", "profile-check", "cover", "wrap", "amazon", "export", "author-central"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      // Skip analyzing step when going back
      const previousStep = stepOrder[currentIndex - 1];
      setCurrentStep(previousStep === "analyzing" ? "upload" : previousStep);
    }
  };
  const [manuscript, setManuscript] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [uploadMethod, setUploadMethod] = useState<"paste" | "file">("paste");
  const [isUploading, setIsUploading] = useState(false);
  const [existingManuscriptLoaded, setExistingManuscriptLoaded] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [hasCheckedResume, setHasCheckedResume] = useState(false);
  const [startingFresh, setStartingFresh] = useState(false);
  const [initialTitle, setInitialTitle] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  
  // AI Analysis state
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customSubtitle, setCustomSubtitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Cover generation state
  const [generatedCovers, setGeneratedCovers] = useState<any[]>([]);
  const [selectedCover, setSelectedCover] = useState<any | null>(null);
  const [coverFeedback, setCoverFeedback] = useState("");
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState("");

  // Amazon optimization state
  // Separate categories for Kindle and Paperback
  const [recommendedKindleCategories, setRecommendedKindleCategories] = useState<any[]>([]);
  const [selectedKindleCategories, setSelectedKindleCategories] = useState<string[]>([]);
  const [recommendedPaperbackCategories, setRecommendedPaperbackCategories] = useState<any[]>([]);
  const [selectedPaperbackCategories, setSelectedPaperbackCategories] = useState<string[]>([]);
  const [generatedKeywords, setGeneratedKeywords] = useState<string[]>([]);
  const [kindleKeywords, setKindleKeywords] = useState<string[]>([]);
  const [paperbackKeywords, setPaperbackKeywords] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<string>("");
  const [isbnNumber, setIsbnNumber] = useState<string>("");
  const [manuscriptUrl, setManuscriptUrl] = useState<string>("");

  // Load author profile
  const { data: authorProfile } = trpc.author.getProfile.useQuery();

  // Load user's books to auto-select if no bookId provided
  const { data: userBooks } = trpc.book.getMyBooks.useQuery(undefined, {
    enabled: !bookId,
  });

  // Auto-select most recent book if no bookId provided (unless user explicitly starting fresh)
  useEffect(() => {
    console.log('[Auto-select] bookId:', bookId, 'startingFresh:', startingFresh, 'userBooks:', userBooks?.length);
    if (!bookId && !startingFresh && userBooks && userBooks.length > 0) {
      const mostRecentBook = userBooks[0]; // Already sorted by updatedAt DESC
      console.log('[Auto-select] Setting bookId to:', mostRecentBook.id);
      setBookId(mostRecentBook.id);
    }
  }, [bookId, startingFresh, userBooks]);

  // Load existing book if bookId is provided
  const { data: existingBook } = trpc.book.getById.useQuery(
    { bookId: bookId! },
    { enabled: !!bookId }
  );

  // Auto-load existing manuscript and workflow data
  useEffect(() => {
    if (existingBook && existingBook.content && !existingManuscriptLoaded) {
      console.log('[Workflow Restore] Loading book:', existingBook.id, 'workflowStep:', existingBook.workflowStep);
      
      setManuscript(existingBook.content);
      setWordCount(existingBook.wordCount || 0);
      // Load existing title if available
      if (existingBook.title && !initialTitle) {
        setInitialTitle(existingBook.title);
      }
      setExistingManuscriptLoaded(true);
      
      // Auto-restore workflow data if it exists
      if (existingBook.aiAnalysis) {
        try {
          const parsedAnalysis = JSON.parse(existingBook.aiAnalysis);
          setAIAnalysis(parsedAnalysis);
          setEditedDescription(parsedAnalysis.bookDescription || "");
        } catch (e) {
          console.error("Failed to parse AI analysis:", e);
        }
      }
      
      if (existingBook.selectedTitle) {
        setSelectedTitle(existingBook.selectedTitle);
      }
      if (existingBook.selectedSubtitle) {
        setSelectedSubtitle(existingBook.selectedSubtitle);
      }
      
      if (existingBook.generatedCovers) {
        try {
          const parsedCovers = JSON.parse(existingBook.generatedCovers);
          setGeneratedCovers(parsedCovers);
        } catch (e) {
          console.error("Failed to parse generated covers:", e);
        }
      }
      
      if (existingBook.selectedCoverUrl) {
        setSelectedCover(existingBook.selectedCoverUrl);
      }
      
      // CRITICAL: Restore workflow step from database ONLY on initial load
      // This ensures users resume at their saved step, not back at upload
      // DO NOT reset currentStep if user is already progressing through workflow
      if (existingBook.workflowStep && existingBook.workflowStep !== "upload" && existingBook.workflowStep !== "analyzing") {
        console.log('[Workflow Restore] Restoring to step:', existingBook.workflowStep);
        setCurrentStep(existingBook.workflowStep as WorkflowStep);
      } else if (existingBook.aiAnalysis) {
        console.log('[Workflow Restore] No saved step, but has AI analysis - defaulting to review');
        setCurrentStep("review");
      }
      // Removed: else { setCurrentStep("upload"); }
      // This was causing the bug: after AI analysis completes and book refetches,
      // this would reset currentStep to "upload" instead of letting the mutation's
      // onSuccess handler set it to "review"
      
      toast.success(`Loaded existing manuscript: ${existingBook.title} (${existingBook.wordCount} words)`);
    }
  }, [existingBook, existingManuscriptLoaded]);

  // Auto-save workflow progress when step changes (after book is created)
  useEffect(() => {
    if (!bookId || currentStep === "upload" || currentStep === "analyzing") {
      console.log('[Auto-save] Skipping auto-save - bookId:', bookId, 'currentStep:', currentStep);
      return;
    }
    
    console.log('[Auto-save] Preparing to save progress for step:', currentStep, 'bookId:', bookId);
    
    // Auto-save progress whenever step changes
    const timeoutId = setTimeout(() => {
      console.log('[Auto-save] Calling saveProgressMutation with:', {
        bookId,
        workflowStep: currentStep,
        hasAiAnalysis: !!aiAnalysis,
        hasSelectedTitle: !!selectedTitle,
        hasSelectedCover: !!(selectedCover || uploadedCoverUrl),
        coversCount: generatedCovers.length
      });
      
      saveProgressMutation.mutate({
        bookId,
        workflowStep: currentStep,
        aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : undefined,
        selectedTitle: selectedTitle || undefined,
        selectedSubtitle: selectedSubtitle || undefined,
        selectedCoverUrl: selectedCover || uploadedCoverUrl || undefined,
        generatedCovers: generatedCovers.length > 0 ? JSON.stringify(generatedCovers) : undefined,
      });
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentStep, bookId]); // Auto-save when step changes

  // Auto-save title with debounce
  useEffect(() => {
    if (!bookId || !initialTitle.trim()) return;

    setIsSavingTitle(true);
    const timeoutId = setTimeout(() => {
      updateBookTitleMutation.mutate({
        bookId: bookId,
        title: initialTitle.trim(),
      });
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [initialTitle, bookId]);

  // Auto-generate Amazon KDP data when entering Amazon step
  useEffect(() => {
    if (currentStep !== "amazon" || !aiAnalysis || !bookId) return;
    
    // Auto-generate Kindle categories if not already generated
    if (recommendedKindleCategories.length === 0 && !researchKindleCategories.isPending) {
      console.log('[Auto-generate] Triggering Kindle category research');
      researchKindleCategories.mutate({
        bookId: bookId,
        format: 'kindle',
      });
    }
    
    // Auto-generate Paperback categories if not already generated
    if (recommendedPaperbackCategories.length === 0 && !researchPaperbackCategories.isPending) {
      console.log('[Auto-generate] Triggering Paperback category research');
      researchPaperbackCategories.mutate({
        bookId: bookId,
        format: 'paperback',
      });
    }
  }, [currentStep, aiAnalysis, bookId, recommendedKindleCategories.length, recommendedPaperbackCategories.length]);

  // Auto-generate keywords after categories are selected
  useEffect(() => {
    if (currentStep !== "amazon" || !aiAnalysis || !bookId) return;
    
    // Auto-generate Kindle keywords if categories selected but keywords not generated
    if (selectedKindleCategories.length > 0 && kindleKeywords.length === 0 && !generateKindleKeywords.isPending) {
      console.log('[Auto-generate] Triggering Kindle keyword generation');
      generateKindleKeywords.mutate({
        bookId: bookId.toString(),
        format: 'kindle',
        categories: selectedKindleCategories,
      });
    }
    
    // Auto-generate Paperback keywords if categories selected but keywords not generated
    if (selectedPaperbackCategories.length > 0 && paperbackKeywords.length === 0 && !generatePaperbackKeywords.isPending) {
      console.log('[Auto-generate] Triggering Paperback keyword generation');
      generatePaperbackKeywords.mutate({
        bookId: bookId.toString(),
        format: 'paperback',
        categories: selectedPaperbackCategories,
      });
    }
  }, [currentStep, aiAnalysis, bookId, selectedKindleCategories, selectedPaperbackCategories, kindleKeywords.length, paperbackKeywords.length]);

  // Auto-generate manuscript file when reaching Export step
  useEffect(() => {
    if (currentStep !== "export" || !manuscript || !aiAnalysis || manuscriptUrl) return;
    
    const finalTitle = selectedTitle || customTitle || aiAnalysis.suggestedTitles[0] || "Untitled";
    const finalAuthor = authorProfile?.penName || "Author";
    
    console.log('[Auto-generate] Triggering manuscript file generation');
    generateManuscriptFile.mutate({
      bookTitle: finalTitle,
      authorName: finalAuthor,
      manuscriptContent: manuscript,
    });
  }, [currentStep, manuscript, aiAnalysis, manuscriptUrl, selectedTitle, customTitle, authorProfile]);

  // Resume detection: Check if user has saved workflow progress
  useEffect(() => {
    if (existingBook && !hasCheckedResume && existingManuscriptLoaded) {
      // Check if there's saved workflow progress
      const hasSavedProgress = existingBook.workflowStep && 
        existingBook.workflowStep !== "upload" && 
        existingBook.workflowStep !== "analyzing";
      
      if (hasSavedProgress) {
        setShowResumePrompt(true);
      }
      setHasCheckedResume(true);
    }
  }, [existingBook, hasCheckedResume, existingManuscriptLoaded]);

  // Handler to resume from saved progress
  const handleResumeProgress = () => {
    if (!existingBook) return;

    // Restore to saved workflow step, or default to 'review' if not set
    const savedStep = existingBook.workflowStep as WorkflowStep;
    const resumeStep = savedStep && savedStep !== "upload" && savedStep !== "analyzing" ? savedStep : "review";
    setCurrentStep(resumeStep);
    console.log('[DEBUG] Resuming to step:', resumeStep, 'from saved:', savedStep);

    // Restore AI analysis
    if (existingBook.aiAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(existingBook.aiAnalysis);
        setAIAnalysis(parsedAnalysis);
        setEditedDescription(parsedAnalysis.bookDescription || "");
      } catch (e) {
        console.error("Failed to parse AI analysis:", e);
      }
    }

    // Restore selected title/subtitle
    if (existingBook.selectedTitle) {
      setSelectedTitle(existingBook.selectedTitle);
    }
    if (existingBook.selectedSubtitle) {
      setSelectedSubtitle(existingBook.selectedSubtitle);
    }

    // Restore generated covers
    if (existingBook.generatedCovers) {
      try {
        const parsedCovers = JSON.parse(existingBook.generatedCovers);
        setGeneratedCovers(parsedCovers);
      } catch (e) {
        console.error("Failed to parse generated covers:", e);
      }
    }

    // Restore selected cover (reconstruct as object if it's a URL string)
    if (existingBook.selectedCoverUrl) {
      // Check if it's already an object or just a URL string
      if (typeof existingBook.selectedCoverUrl === 'string') {
        setSelectedCover({
          imageUrl: existingBook.selectedCoverUrl,
          style: 'unknown'
        });
      } else {
        setSelectedCover(existingBook.selectedCoverUrl);
      }
    }

    setShowResumePrompt(false);
    toast.success("Resumed from where you left off!");
  };

  // Handler to start fresh (ignore saved progress)
  const handleStartFresh = () => {
    console.log('[Start Fresh] Clearing bookId and setting startingFresh=true');
    setShowResumePrompt(false);
    setCurrentStep("upload");
    // Set flag to prevent auto-select from running
    setStartingFresh(true);
    // Clear bookId to create a NEW book (not reuse existing)
    setBookId(null);
    console.log('[Start Fresh] bookId cleared, startingFresh set to true');
    // Reset all workflow state
    setManuscript("");
    setWordCount(0);
    setAIAnalysis(null);
    setSelectedTitle("");
    setSelectedSubtitle("");
    setCustomTitle("");
    setCustomSubtitle("");
    setGeneratedCovers([]);
    setSelectedCover(null);
    setRecommendedKindleCategories([]);
    setSelectedKindleCategories([]);
    setRecommendedPaperbackCategories([]);
    setSelectedPaperbackCategories([]);
    setKindleKeywords([]);
    setPaperbackKeywords([]);
    // Set to true to prevent auto-reload effect from running
    setExistingManuscriptLoaded(true);
    toast.info("Starting fresh - ready to create a new book!");
  };

  // tRPC mutations
  // Save progress mutation
  const saveProgressMutation = trpc.book.saveWorkflowProgress.useMutation({
    onSuccess: () => {
      console.log('[Auto-save] Progress saved successfully');
      // Don't show toast for auto-save to avoid spam
    },
    onError: (error) => {
      console.error('[Auto-save] Save progress error:', error);
      toast.error("Failed to save progress. Please try again.");
    },
  });

  // Update book title mutation (for auto-save)
  const updateBookTitleMutation = trpc.book.update.useMutation({
    onSuccess: () => {
      setIsSavingTitle(false);
    },
    onError: (error) => {
      console.error('Auto-save title error:', error);
      setIsSavingTitle(false);
    },
  });

  // Upload custom cover mutation
  const uploadCustomCoverMutation = trpc.covers.uploadCustomCover.useMutation({
    onSuccess: (data: any) => {
      console.log('Cover uploaded successfully:', data.url);
    },
    onError: (error: any) => {
      console.error('Failed to upload cover:', error);
    },
  });

  const handleSaveProgress = () => {
    if (!bookId) {
      toast.error("No book ID found");
      return;
    }

    saveProgressMutation.mutate({
      bookId,
      workflowStep: currentStep,
      aiAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : undefined,
      selectedTitle: selectedTitle || undefined,
      selectedSubtitle: selectedSubtitle || undefined,
      selectedCoverUrl: selectedCover || uploadedCoverUrl || undefined,
      generatedCovers: generatedCovers.length > 0 ? JSON.stringify(generatedCovers) : undefined,
    });
  };

  const deleteBookMutation = trpc.book.delete.useMutation({
    onSuccess: () => {
      toast.success("Book deleted successfully");
      setLocation("/books");
    },
    onError: () => {
      toast.error("Failed to delete book");
    },
  });

  const handleDeleteCurrentBook = () => {
    if (!bookId || !existingBook) return;
    
    if (!confirm(`Are you sure you want to delete "${existingBook.title}"? This action cannot be undone.`)) {
      return;
    }

    deleteBookMutation.mutate({ bookId });
  };

  const analyzeManuscript = trpc.manuscriptAnalysis.analyze.useMutation({
    onSuccess: (data) => {
      setAIAnalysis(data);
      setSelectedTitle(data.suggestedTitles[0]);
      setSelectedSubtitle(data.suggestedSubtitles[0]);
      setEditedDescription(data.bookDescription);
      // Capture the bookId from the response
      if (data.bookId) {
        setBookId(data.bookId);
      }
      setAnalysisError(null); // Clear any previous errors
      setCurrentStep("review");
      toast.success("AI analysis complete! Review the suggestions below.");
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to analyze manuscript";
      setAnalysisError(errorMessage);
      toast.error(errorMessage);
      setCurrentStep("upload");
    },
  });

  const generateMoreTitles = trpc.manuscriptAnalysis.generateMoreTitles.useMutation({
    onSuccess: (newTitles) => {
      if (aiAnalysis) {
        setAIAnalysis({
          ...aiAnalysis,
          suggestedTitles: [...aiAnalysis.suggestedTitles, ...newTitles],
        });
      }
      toast.success("Generated 5 more title options!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate more titles");
    },
  });

  const generateCovers = trpc.covers.generateVariations.useMutation({
    onSuccess: (covers) => {
      setGeneratedCovers(covers);
      toast.success("Generated 3 cover designs! Select your favorite.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate covers");
    },
  });

  const generateExportBundle = trpc.export.generateBundle.useMutation({
    onSuccess: (result) => {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = result.zipUrl;
      link.download = result.zipKey.split('/').pop() || 'publishing-package.zip';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Publishing package ready! Download started.");
      
      // Show KDP upload guide after download
      setTimeout(() => {
        setShowKDPGuide(true);
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate package. Please try again.");
    },
  });

  const generateManuscriptFile = trpc.export.generateManuscriptFile.useMutation({
    onSuccess: (result) => {
      setManuscriptUrl(result.url);
    },
    onError: (error) => {
      console.error("Failed to generate manuscript file:", error);
    },
  });

  const generateKeywords = trpc.amazon.optimizeKeywords.useMutation({
    onSuccess: (data: any) => {
      setGeneratedKeywords(data.keywords);
      toast.success("Keywords generated! Ready for Amazon KDP.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate keywords");
    },
  });

  const generateKindleKeywords = trpc.amazon.optimizeKeywords.useMutation({
    onSuccess: (data: any) => {
      setKindleKeywords(data.keywords);
      toast.success("💡 Kindle keywords generated! Low-competition keywords ready.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate Kindle keywords");
    },
  });

  const generatePaperbackKeywords = trpc.amazon.optimizeKeywords.useMutation({
    onSuccess: (data: any) => {
      setPaperbackKeywords(data.keywords);
      toast.success("💡 Paperback keywords generated! Low-competition keywords ready.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate Paperback keywords");
    },
  });

  const researchKindleCategories = trpc.amazon.researchCategories.useMutation({
    onSuccess: (data: any) => {
      setRecommendedKindleCategories(data.categories);
      
      // Auto-select top 3 categories (sorted by competitivenessScore, higher = easier to rank)
      const top3 = data.categories
        .sort((a: any, b: any) => b.competitivenessScore - a.competitivenessScore)
        .slice(0, 3)
        .map((cat: any) => cat.category);
      setSelectedKindleCategories(top3);
      
      toast.success("Kindle categories analyzed! Top 3 low-competition categories auto-selected.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze Kindle categories");
    },
  });

  const researchPaperbackCategories = trpc.amazon.researchCategories.useMutation({
    onSuccess: (data: any) => {
      setRecommendedPaperbackCategories(data.categories);
      
      // Auto-select top 3 categories (sorted by competitivenessScore, higher = easier to rank)
      const top3 = data.categories
        .sort((a: any, b: any) => b.competitivenessScore - a.competitivenessScore)
        .slice(0, 3)
        .map((cat: any) => cat.category);
      setSelectedPaperbackCategories(top3);
      
      toast.success("Paperback categories analyzed! Top 3 low-competition categories auto-selected.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to analyze Paperback categories");
    },
  });

  const regenerateCover = trpc.covers.regenerate.useMutation({
    onSuccess: (newCover: any) => {
      // Replace the selected cover with the regenerated one
      setGeneratedCovers(covers => covers.map(c => 
        c.imageUrl === selectedCover ? newCover : c
      ));
      setSelectedCover(newCover.imageUrl);
      toast.success("Cover regenerated! Check out the updated design.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to regenerate cover");
    },
  });

  const extractText = trpc.manuscriptAnalysis.extractTextFromFile.useMutation();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[handleFileUpload] Starting upload:', { name: file.name, type: file.type, size: file.size });
    setIsUploading(true);
    try {
      // For PDF and DOCX files, use backend extraction
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        console.log('[handleFileUpload] Detected PDF/DOCX file, using backend extraction');
        
        // Read file as base64
        const reader = new FileReader();
        const fileData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1]; // Remove data:...;base64, prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        // Extract text using backend
        console.log('[handleFileUpload] Calling extractText mutation...');
        const result = await extractText.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData,
        });
        console.log('[handleFileUpload] Extraction complete:', { textLength: result.text.length, wordCount: result.wordCount });
        
        setManuscript(result.text);
        setWordCount(result.wordCount);
        console.log('[handleFileUpload] State updated, manuscript length:', result.text.length);
        
        toast.success(`Manuscript uploaded! ${result.wordCount.toLocaleString()} words detected.`);
      } else {
        // For TXT files, read directly
        const text = await file.text();
        const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        setManuscript(text);
        setWordCount(count);
        
        toast.success(`Manuscript uploaded! ${count.toLocaleString()} words detected.`);
      }
      
      // Reset startingFresh flag when user uploads new content
      if (startingFresh) {
        setStartingFresh(false);
      }
    } catch (error: any) {
      console.error('[handleFileUpload] Error:', error);
      toast.error(error.message || "Failed to read file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleManuscriptPaste = (text: string) => {
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    console.log('[Paste] Text length:', text.length, 'Word count:', count, 'startingFresh:', startingFresh);
    setManuscript(text);
    setWordCount(count);
    // Reset startingFresh flag when user uploads new content
    if (startingFresh && text.length > 0) {
      console.log('[Paste] Resetting startingFresh flag');
      setStartingFresh(false);
    }
  };

  const handleCustomCoverUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("Image file must be under 10MB");
      return;
    }
    
    try {
      toast.info("Uploading your cover image...");
      
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedCoverUrl(dataUrl);
        setSelectedCover(dataUrl);
        toast.success("Custom cover uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Cover upload failed:", error);
      toast.error("Failed to upload cover. Please try again.");
    }
  };

  const handleAnalyzeManuscript = () => {
    if (!manuscript || manuscript.length < 100) {
      toast.error("Please upload a manuscript with at least 100 characters");
      return;
    }
    
    setAnalysisError(null); // Clear previous errors
    setCurrentStep("analyzing");
    analyzeManuscript.mutate({ manuscript, wordCount, initialTitle: initialTitle.trim() || undefined });
  };

  const handleGenerateMoreTitles = () => {
    if (!aiAnalysis) return;
    generateMoreTitles.mutate({
      manuscript,
      currentTitles: aiAnalysis.suggestedTitles,
    });
  };

  const finalTitle = customTitle || selectedTitle;
  const finalSubtitle = customSubtitle || selectedSubtitle;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              AI-Powered Publishing
            </h1>
            <p className="text-muted-foreground mt-2">
              Upload your manuscript and let our AI publisher optimize everything for Amazon KDP success
            </p>
          </div>
          {bookId && existingBook && existingBook.status !== 'published' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCurrentBook()}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Book
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="pt-6">
            {/* Step Counter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Step {currentStep === "upload" ? "1" : currentStep === "analyzing" ? "2" : currentStep === "review" ? "3" : currentStep === "profile-check" ? "4" : currentStep === "cover" ? "5" : currentStep === "wrap" ? "6" : currentStep === "amazon" ? "7" : currentStep === "export" ? "8" : "9"} of 9
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {currentStep === "upload" ? "Upload Manuscript" : 
                 currentStep === "analyzing" ? "AI Analysis" : 
                 currentStep === "review" ? "Review & Edit" : 
                 currentStep === "profile-check" ? "Author Profile" : 
                 currentStep === "cover" ? "Cover Design" : 
                 currentStep === "wrap" ? "Book Wrap (Optional)" : 
                 currentStep === "amazon" ? "Amazon KDP" : 
                 currentStep === "export" ? "Export" :
                 "Author Central"}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              {/* Step 1: Upload */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "upload" || currentStep === "analyzing"
                  ? "bg-blue-600 text-white"
                  : ["review", "profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["review", "profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Upload</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 2: AI Analysis */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "analyzing"
                  ? "bg-blue-600 text-white animate-pulse"
                  : ["review", "profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["review", "profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Analysis</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 3: Review */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "review"
                  ? "bg-blue-600 text-white"
                  : ["profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["profile-check", "cover", "amazon", "wrap", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Edit3 className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Review</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 4: Profile */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "profile-check"
                  ? "bg-blue-600 text-white"
                  : ["cover", "amazon", "wrap", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["cover", "amazon", "wrap", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Profile</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 5: Cover */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "cover"
                  ? "bg-blue-600 text-white"
                  : ["amazon", "wrap", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["amazon", "wrap", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Cover</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 6: Book Wrap */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "wrap"
                  ? "bg-blue-600 text-white"
                  : ["amazon", "export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["amazon", "export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <BookOpen className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Wrap</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 7: Amazon KDP */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "amazon"
                  ? "bg-blue-600 text-white"
                  : ["export", "author-central"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {["export", "author-central"].includes(currentStep) ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Amazon</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 8: Export */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "export"
                  ? "bg-blue-600 text-white"
                  : currentStep === "author-central"
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                {currentStep === "author-central" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
                <span className="text-xs font-medium text-center">Export</span>
              </div>

              <div className="h-0.5 flex-1 bg-border" />

              {/* Step 9: Author Central */}
              <div className="flex flex-col items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === "author-central"
                  ? "bg-blue-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}>
                <User className="w-5 h-5" />
              </div>
                <span className="text-xs font-medium text-center">Author Central</span>
              </div>
            </div>

            {/* Save Progress Button - Moved inside card for visibility */}
            {bookId && (
              <div className="flex justify-center pt-4 border-t">
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleSaveProgress}
                    disabled={saveProgressMutation.isPending}
                    size="lg"
                  >
                    {saveProgressMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Progress Now
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    Auto-saves when you move to next step
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume Progress Dialog */}
        <Dialog open={showResumePrompt} onOpenChange={setShowResumePrompt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Resume Where You Left Off?
              </DialogTitle>
              <DialogDescription>
                We found saved progress for this manuscript. You were working on the{" "}
                <strong>
                  {existingBook?.workflowStep === "review" && "Review & Edit"}
                  {existingBook?.workflowStep === "cover" && "Cover Design"}
                  {existingBook?.workflowStep === "wrap" && "Book Wrap Design"}
                  {existingBook?.workflowStep === "amazon" && "Amazon Optimization"}
                  {existingBook?.workflowStep === "export" && "Export & Download"}
                </strong>{" "}
                step.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Saved Progress Includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {existingBook?.aiAnalysis && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      AI analysis and suggestions
                    </li>
                  )}
                  {existingBook?.selectedTitle && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Selected title: {existingBook.selectedTitle}
                    </li>
                  )}
                  {existingBook?.generatedCovers && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Generated cover designs
                    </li>
                  )}
                  {existingBook?.selectedCoverUrl && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Selected cover design
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleStartFresh}
                className="w-full sm:w-auto"
              >
                Start Fresh
              </Button>
              <Button
                onClick={handleResumeProgress}
                className="w-full sm:w-auto"
              >
                <Clock className="w-4 h-4 mr-2" />
                Resume Progress
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Step Content */}
        {/* Step 1: Upload Manuscript */}
        {currentStep === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your Manuscript
                </CardTitle>
                <CardDescription>
                  Our AI will analyze your book like a New York Times publisher and optimize everything for Amazon success
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Show existing manuscript loaded message */}
                {existingManuscriptLoaded && existingBook && bookId && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 text-lg mb-2">
                          ✓ Manuscript Loaded: {existingBook.title}
                        </h3>
                        <p className="text-green-800 mb-3">
                          Your existing manuscript has been automatically loaded. 
                          You can proceed directly to AI analysis or upload a different manuscript below.
                        </p>
                        <Button
                          onClick={handleAnalyzeManuscript}
                          size="lg"
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Sparkles className="w-5 h-5" />
                          Use This Manuscript & Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="initialTitle" className="text-base font-semibold flex items-center gap-2">
                    Book Title <span className="text-muted-foreground font-normal">(Draft)</span>
                    {isSavingTitle && bookId && (
                      <span className="text-xs text-muted-foreground font-normal">Saving...</span>
                    )}
                  </Label>
                  <Input
                    id="initialTitle"
                    placeholder="Enter a working title for your book"
                    value={initialTitle}
                    onChange={(e) => setInitialTitle(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a draft title now, or let our AI suggest optimized titles after analyzing your manuscript. You can change it anytime.
                  </p>
                </div>

                <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "paste" | "file")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    <TabsTrigger value="file">Upload File</TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="space-y-4">
                    {!manuscript ? (
                      <div className="space-y-2">
                        <Label htmlFor="manuscript">Manuscript Content</Label>
                        <Textarea
                          id="manuscript"
                          placeholder="Paste your complete manuscript here..."
                          value={manuscript}
                          onChange={(e) => handleManuscriptPaste(e.target.value)}
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-900">Manuscript Loaded</p>
                            <p className="text-sm text-green-700">Ready for analysis</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setManuscript(""); setWordCount(0); }}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Clear & Upload Different Manuscript
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-12 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Upload Manuscript File</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports DOCX, PDF, and TXT files
                        </p>
                        <Input
                          type="file"
                          accept=".docx,.pdf,.txt"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                      {isUploading && (
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing file...</span>
                        </div>
                      )}
                      {wordCount > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-900">
                          <CheckCircle2 className="w-5 h-5 mx-auto mb-2" />
                          <p className="font-medium">File uploaded successfully!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Error Alert with Retry */}
                {analysisError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900 mb-1">Analysis Failed</p>
                        <p className="text-sm text-red-800 mb-3">{analysisError}</p>
                        <Button
                          onClick={handleAnalyzeManuscript}
                          disabled={analyzeManuscript.isPending}
                          variant="outline"
                          size="sm"
                          className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
                        >
                          {analyzeManuscript.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Retry Analysis
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                {!analysisError && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-medium mb-1">What happens next?</p>
                        <p>
                          Our AI will analyze your manuscript with the expertise of a senior New York Times publisher, 
                          suggesting bestseller-worthy titles, optimized descriptions, and market positioning strategies.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleAnalyzeManuscript}
                    disabled={!manuscript || manuscript.length < 100 || analyzeManuscript.isPending}
                    size="lg"
                    className="gap-2"
                  >
                    {analyzeManuscript.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze with AI Publisher
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: AI Analyzing */}
          {currentStep === "analyzing" && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">AI Publisher Analyzing Your Book</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Our AI is reading your manuscript with the expertise of a New York Times bestselling publisher, 
                      analyzing market trends, and crafting optimization strategies...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>This usually takes 30-60 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Chat with Publisher AI */}
          {currentStep === "review" && aiAnalysis && (
            <>
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={handleBackNavigation}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Upload
            </Button>
            <PublisherChat
              manuscript={manuscript}
              initialAnalysis={{
                suggestedTitles: aiAnalysis.suggestedTitles,
                suggestedSubtitles: aiAnalysis.suggestedSubtitles,
                bookDescription: aiAnalysis.bookDescription,
                detectedGenre: aiAnalysis.detectedGenre,
                targetAudience: aiAnalysis.targetAudience,
                themes: aiAnalysis.themes || [],
                keyBenefits: aiAnalysis.keyBenefits || [],
              }}
              onComplete={() => setCurrentStep("profile-check")}
            />
            </>
          )}

          {/* Step 4: Author Profile Check */}
          {currentStep === "profile-check" && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Review
              </Button>
              <AuthorProfilePrompt
                authorProfile={authorProfile || null}
                onContinue={() => setCurrentStep("cover")}
              />
            </div>
          )}

          {/* Step 5: AI Cover Generation */}
          {currentStep === "cover" && aiAnalysis && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Author Profile
              </Button>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Cover Design
                  </CardTitle>
                  <CardDescription>
                    Generate AI covers or upload your own pre-designed cover
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs defaultValue="ai-generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ai-generate">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your Own
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-generate" className="space-y-6 mt-6">

              {generatedCovers.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                          <Sparkles className="w-10 h-10 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Create Your Cover?</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          AI will analyze your manuscript themes and generate 3 distinct cover styles:
                          Minimalist, Bold, and Artistic
                        </p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button
                          size="lg"
                          onClick={() => {
                            if (!aiAnalysis) return;
                            generateCovers.mutate({
                              bookTitle: finalTitle,
                              authorName: "Author", // TODO: Get from user profile
                              genre: aiAnalysis.detectedGenre,
                              themes: aiAnalysis.themes,
                              targetAudience: aiAnalysis.targetAudience,
                              count: 3,
                            });
                          }}
                          disabled={generateCovers.isPending}
                        >
                          {generateCovers.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generating Covers...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5 mr-2" />
                              Generate 3 Cover Designs
                            </>
                          )}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => setCurrentStep("amazon")}
                        >
                          Skip for Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Your Cover</CardTitle>
                    <CardDescription>
                      Choose your favorite or request modifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      {generatedCovers.map((cover, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCover(cover)}
                          className={`cursor-pointer rounded-lg border-2 transition-all ${
                            selectedCover === cover
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <img
                            src={cover.imageUrl}
                            alt={`Cover ${idx + 1}`}
                            className="w-full aspect-[2/3] object-cover rounded-t-lg"
                          />
                          <div className="p-3 space-y-2">
                            <Badge>{cover.style}</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomizingCover(cover.imageUrl);
                              }}
                            >
                              <Palette className="w-3 h-3 mr-1" />
                              Customize
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Want to modify the selected cover?</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., make it darker, add more color, more professional..."
                            value={coverFeedback}
                            onChange={(e) => setCoverFeedback(e.target.value)}
                          />
                          <Button
                            onClick={() => {
                              if (!selectedCover || !coverFeedback.trim() || !aiAnalysis) {
                                toast.error("Please select a cover and provide modification feedback");
                                return;
                              }
                              
                              if (!bookId) {
                                toast.error("Please save your book first before regenerating covers");
                                return;
                              }
                              
                              // Find the selected cover's prompt
                              const selectedCoverData = generatedCovers.find(c => c.imageUrl === selectedCover);
                              if (!selectedCoverData) {
                                toast.error("Could not find cover data");
                                return;
                              }
                              
                              toast.info("Regenerating cover with your feedback...");
                              
                              // Call the regenerate mutation
                              regenerateCover.mutate({
                                bookId,
                                bookTitle: selectedTitle || aiAnalysis.suggestedTitles[0] || "Untitled",
                                authorName: "Author", // Will be fetched from user profile in backend
                                genre: aiAnalysis.detectedGenre || "General",
                                basePrompt: selectedCoverData.prompt,
                                modifications: coverFeedback,
                              });
                            }}
                            disabled={!selectedCover || !coverFeedback.trim() || regenerateCover.isPending || !bookId}
                          >
                            {regenerateCover.isPending ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Regenerating...</>
                            ) : (
                              <><RefreshCw className="w-4 h-4 mr-2" />Regenerate</>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Or upload your own cover</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCustomCoverUpload(file);
                            }
                          }}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="lg"
                        onClick={() => setCurrentStep("wrap")}
                        disabled={!selectedCover && !uploadedCoverUrl}
                      >
                        Continue to Book Wrap Designer
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-6 mt-6">
                  <CoverUpload
                    onUploadComplete={(url) => {
                      setSelectedCover(url);
                      toast.success("Cover uploaded! You can now continue to the next step.");
                    }}
                    currentCoverUrl={selectedCover}
                  />

                  {selectedCover && (
                    <div className="flex justify-end">
                      <Button
                        size="lg"
                        onClick={() => setCurrentStep("wrap")}
                      >
                        Continue to Book Wrap Designer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 6: Amazon Optimization */}
          {currentStep === "amazon" && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Book Wrap
              </Button>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Amazon KDP Optimization
                  </CardTitle>
                  <CardDescription>
                    AI analyzes your book against Amazon's algorithm to recommend optimal categories, keywords, and pricing
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Kindle eBook Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>📱 Kindle eBook Categories</CardTitle>
                  <CardDescription>
                    Select up to 3 categories for your Kindle eBook (Amazon's limit)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {researchKindleCategories.isPending || recommendedKindleCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Analyzing Kindle categories...</p>
                      <p className="text-sm text-muted-foreground mt-2">Finding low-competition categories where you can rank #1</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedKindleCategories.map((cat: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedKindleCategories.includes(cat.category)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            if (selectedKindleCategories.includes(cat.category)) {
                              setSelectedKindleCategories(selectedKindleCategories.filter(c => c !== cat.category));
                            } else if (selectedKindleCategories.length < 3) {
                              setSelectedKindleCategories([...selectedKindleCategories, cat.category]);
                            } else {
                              toast.error("You can only select up to 3 Kindle categories");
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{cat.category}</p>
                              <p className="text-sm text-muted-foreground mt-1">{cat.reasoning}</p>
                              <div className="mt-3 space-y-1">
                                {cat.currentLeaderBSR && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Current #1 BSR:</span> {cat.currentLeaderBSR}
                                  </div>
                                )}
                                {cat.minimumSalesTarget && (
                                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                    <span className="font-medium">Minimum target:</span> {cat.minimumSalesTarget}
                                  </div>
                                )}
                                {cat.saferSalesTarget && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    <span className="font-medium">Safer target:</span> {cat.saferSalesTarget}
                                  </div>
                                )}
                                <div className="text-xs font-medium text-primary">
                                  To hit #1: {cat.topSellerRequirement || cat.saferSalesTarget || 'See targets above'}
                                </div>
                              </div>
                            </div>
                            {selectedKindleCategories.includes(cat.category) && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Selected: {selectedKindleCategories.length}/3 Kindle categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Paperback Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>📖 Paperback Categories</CardTitle>
                  <CardDescription>
                    Select up to 3 categories for your Paperback edition (Amazon's limit)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {researchPaperbackCategories.isPending || recommendedPaperbackCategories.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Analyzing Paperback categories...</p>
                      <p className="text-sm text-muted-foreground mt-2">Finding low-competition categories where you can rank #1</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedPaperbackCategories.map((cat: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPaperbackCategories.includes(cat.category)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            if (selectedPaperbackCategories.includes(cat.category)) {
                              setSelectedPaperbackCategories(selectedPaperbackCategories.filter(c => c !== cat.category));
                            } else if (selectedPaperbackCategories.length < 3) {
                              setSelectedPaperbackCategories([...selectedPaperbackCategories, cat.category]);
                            } else {
                              toast.error("You can only select up to 3 Paperback categories");
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{cat.category}</p>
                              <p className="text-sm text-muted-foreground mt-1">{cat.reasoning}</p>
                              <div className="mt-3 space-y-1">
                                {cat.currentLeaderBSR && (
                                  <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Current #1 BSR:</span> {cat.currentLeaderBSR}
                                  </div>
                                )}
                                {cat.minimumSalesTarget && (
                                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                    <span className="font-medium">Minimum target:</span> {cat.minimumSalesTarget}
                                  </div>
                                )}
                                {cat.saferSalesTarget && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400">
                                    <span className="font-medium">Safer target:</span> {cat.saferSalesTarget}
                                  </div>
                                )}
                                <div className="text-xs font-medium text-primary">
                                  To hit #1: {cat.topSellerRequirement || cat.saferSalesTarget || 'See targets above'}
                                </div>
                              </div>
                            </div>
                            {selectedPaperbackCategories.includes(cat.category) && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Selected: {selectedPaperbackCategories.length}/3 Paperback categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kindle Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>📱 Kindle eBook Keywords</CardTitle>
                  <CardDescription>
                    AI-generated low-competition keywords for Kindle eBook (7 keywords max)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generateKindleKeywords.isPending || kindleKeywords.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Generating Kindle keywords...</p>
                      <p className="text-sm text-muted-foreground mt-2">Creating ultra-targeted keywords based on your selected categories</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {kindleKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        💡 These low-competition keywords help you rank #1 in your Kindle categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Paperback Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle>📖 Paperback Keywords</CardTitle>
                  <CardDescription>
                    AI-generated low-competition keywords for Paperback edition (7 keywords max)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatePaperbackKeywords.isPending || paperbackKeywords.length === 0 ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Generating Paperback keywords...</p>
                      <p className="text-sm text-muted-foreground mt-2">Creating ultra-targeted keywords based on your selected categories</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {paperbackKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="px-3 py-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        💡 These low-competition keywords help you rank #1 in your Paperback categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing Intelligence</CardTitle>
                  <CardDescription>
                    AI recommends optimal price based on genre and competition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!suggestedPrice ? (
                    <div className="text-center py-8">
                      <Button
                        onClick={() => {
                          if (!aiAnalysis) return;
                          
                          // Launch strategy pricing
                          setSuggestedPrice("Kindle: $0.99 | Paperback: $8.99");
                          toast.success("Launch pricing strategy ready!");
                        }}
                        disabled={!aiAnalysis}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Optimal Pricing
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2">Kindle eBook</p>
                          <p className="text-4xl font-bold text-primary">$0.99</p>
                          <p className="text-xs text-muted-foreground mt-2">Launch Price</p>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                          <p className="text-sm text-muted-foreground mb-2">Paperback</p>
                          <p className="text-4xl font-bold text-primary">$8.99</p>
                          <p className="text-xs text-muted-foreground mt-2">Print Edition</p>
                        </div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Launch Strategy</p>
                        <p className="text-sm text-muted-foreground">
                          Start with $0.99 Kindle to maximize sales velocity and rank #1 in your low-competition categories quickly. Once you achieve Amazon Bestseller status, increase the Kindle price to $9.99-$14.99. The bestseller badge becomes your marketing asset. Paperback at $8.99 covers printing costs and provides reasonable margin.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowInteriorPreview(true)}
                  disabled={!manuscript}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Preview Pages
                </Button>
                <Button
                  size="lg"
                  onClick={() => setCurrentStep("export")}
                >
                  Continue to Export & Download
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Interior Preview Dialog */}
          <Dialog open={showInteriorPreview} onOpenChange={setShowInteriorPreview}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Interior Preview</DialogTitle>
                <DialogDescription>
                  Review how your manuscript will look when formatted for print
                </DialogDescription>
              </DialogHeader>
              {manuscript && (
                <InteriorPreview
                  manuscript={manuscript}
                  bookTitle={finalTitle || aiAnalysis?.suggestedTitles[0] || "Untitled"}
                  authorName={authorProfile?.penName || "Author"}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Cover Customizer Dialog */}
          <Dialog open={!!customizingCover} onOpenChange={(open) => !open && setCustomizingCover(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Customize Cover</DialogTitle>
                <DialogDescription>
                  Adjust fonts, colors, and positioning to match your vision
                </DialogDescription>
              </DialogHeader>
              {customizingCover && aiAnalysis && (
                <CoverCustomizer
                  coverUrl={customizingCover}
                  bookTitle={finalTitle || aiAnalysis.suggestedTitles[0]}
                  authorName={authorProfile?.penName || "Author"}
                  genre={aiAnalysis.detectedGenre}
                  onCustomizationComplete={(newCoverUrl) => {
                    // Replace the cover in generatedCovers array
                    const updatedCovers = generatedCovers.map((cover) =>
                      cover.imageUrl === customizingCover
                        ? { ...cover, imageUrl: newCoverUrl }
                        : cover
                    );
                    setGeneratedCovers(updatedCovers);
                    setSelectedCover(newCoverUrl);
                    setCustomizingCover(null);
                    toast.success("Cover updated with your customizations!");
                  }}
                  onCancel={() => setCustomizingCover(null)}
                />
              )}
            </DialogContent>
          </Dialog>

          {/* KDP Upload Guide Dialog */}
          <Dialog open={showKDPGuide} onOpenChange={setShowKDPGuide}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>How to Upload to Amazon KDP</DialogTitle>
                <DialogDescription>
                  Step-by-step instructions to publish your book on Amazon
                </DialogDescription>
              </DialogHeader>
              <KDPUploadGuide onClose={() => setShowKDPGuide(false)} />
            </DialogContent>
          </Dialog>

          {/* Manuscript Preview Modal */}
          <ManuscriptPreviewModal
            open={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            pdfUrl={previewPdfUrl}
            onDownload={() => {
              // Trigger the full export download
              if (!manuscript || !aiAnalysis || !selectedCover) {
                toast.error("Missing required data. Please complete all steps.");
                return;
              }
              
              toast.info("Generating your publishing package...");
              
              generateExportBundle.mutate({
                bookTitle: finalTitle || aiAnalysis.suggestedTitles[0],
                authorName: authorProfile?.penName || "Author",
                manuscriptContent: manuscript,
                coverImageUrl: selectedCover,
                metadata: {
                  title: finalTitle || aiAnalysis.suggestedTitles[0],
                  subtitle: finalSubtitle || aiAnalysis.suggestedSubtitles[0],
                  description: editedDescription || aiAnalysis.bookDescription,
                  categories: [...selectedKindleCategories, ...selectedPaperbackCategories],
                  keywords: generatedKeywords,
                  price: suggestedPrice,
                  genre: aiAnalysis.detectedGenre,
                },
                copyrightPage: undefined,
              });
              
              setPreviewModalOpen(false);
            }}
            isLoading={isGeneratingPreview}
          />

          {/* Missing AI Analysis Error for Amazon Step */}
          {currentStep === "amazon" && !aiAnalysis && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Missing Analysis Data
                </CardTitle>
                <CardDescription>
                  AI analysis data is required to continue. Please go back to the Review step.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("review")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Review
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Book Wrap Designer */}
          {currentStep === "wrap" && aiAnalysis && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cover Design
              </Button>
              {/* Author Profile Check */}
              {(!authorProfile?.avatarUrl || !authorProfile?.bio) ? (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-amber-900 dark:text-amber-100 mb-2">
                          Complete Your Author Profile First
                        </CardTitle>
                        <CardDescription className="text-amber-700 dark:text-amber-300 mb-4">
                          The Book Wrap Designer needs your author photo and bio to create a professional back cover. Please complete your profile to continue.
                        </CardDescription>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => window.open("/profile", "_blank")}
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Complete Profile
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep("cover")}
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <>
                  <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 mb-6">
                    <CardHeader>
                      <CardTitle className="text-blue-900 dark:text-blue-100">📖 Book Wrap for Paperback (Optional)</CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        The book wrap is only needed for paperback printing. If you're publishing Kindle eBook only, or prefer to design your complete book wrap externally in Canva or with a designer, you can skip this step.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            toast.info("Skipping book wrap. Moving to Amazon KDP setup.");
                            setCurrentStep("amazon");
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Skip - I'll Design Externally
                        </Button>
                        <Button
                          onClick={() => {
                            // Scroll to specifications below
                            document.getElementById('book-wrap-specs')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex-1"
                        >
                          Get Specifications for Canva
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div id="book-wrap-specs">
                    <BookWrapSpecifications
                      bookId={bookId || 0}
                      bookTitle={selectedTitle || customTitle || aiAnalysis.suggestedTitles[0] || ""}
                      bookSubtitle={selectedSubtitle || customSubtitle}
                      authorName={authorProfile?.penName || ""}
                      bookDescription={editedDescription || aiAnalysis.bookDescription}
                      authorBio={authorProfile?.bio || ""}
                      isbn={isbnNumber || undefined}
                      pageCount={Math.ceil(wordCount / 250)}
                      onUploadComplete={(wrapUrl) => {
                        toast.success("Book wrap uploaded! Moving to Amazon KDP setup.");
                        setCurrentStep("amazon");
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 8: Export Bundle */}
          {currentStep === "export" && aiAnalysis && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Previous Step
              </Button>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Download Publishing Package
                  </CardTitle>
                  <CardDescription>
                    Everything you need to publish on Amazon KDP in one ZIP file
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Amazon Account Setup Checklist */}
              {!accountChecklistComplete && (
                <AmazonAccountChecklist onComplete={() => setAccountChecklistComplete(true)} />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Your Publishing Package Includes:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Manuscript (DOCX & PDF)</p>
                        <p className="text-sm text-muted-foreground">Formatted and ready for upload</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Book Cover (PNG)</p>
                        <p className="text-sm text-muted-foreground">High-resolution cover image</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">KDP Metadata (TXT)</p>
                        <p className="text-sm text-muted-foreground">Categories, keywords, description, pricing</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">ISBN Information</p>
                        <p className="text-sm text-muted-foreground">ISBN details and registration info</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="text-center">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          if (!manuscript || !aiAnalysis) {
                            toast.error("Missing required data. Please complete all steps.");
                            return;
                          }
                          setPreviewModalOpen(true);
                          setIsGeneratingPreview(true);
                          
                          // Generate preview PDF
                          setTimeout(() => {
                            // In a real implementation, this would call the backend
                            // For now, we'll simulate it
                            setPreviewPdfUrl("/api/preview-pdf");
                            setIsGeneratingPreview(false);
                          }, 1500);
                        }}
                        disabled={!manuscript || !aiAnalysis}
                        className="mr-4"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Preview Manuscript
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => {
                        if (!manuscript || !aiAnalysis || !selectedCover) {
                          toast.error("Missing required data. Please complete all steps.");
                          return;
                        }
                        
                        if (!accountChecklistComplete) {
                          toast.error("Please complete the Amazon account setup checklist first.");
                          return;
                        }
                        
                        toast.info("Generating your publishing package...");
                        
                        generateExportBundle.mutate({
                          bookTitle: finalTitle || aiAnalysis.suggestedTitles[0],
                          authorName: authorProfile?.penName || "Author",
                          manuscriptContent: manuscript,
                          coverImageUrl: selectedCover,
                          metadata: {
                            title: finalTitle || aiAnalysis.suggestedTitles[0],
                            subtitle: finalSubtitle || aiAnalysis.suggestedSubtitles[0],
                            description: editedDescription || aiAnalysis.bookDescription,
                            categories: [...selectedKindleCategories, ...selectedPaperbackCategories],
                            keywords: generatedKeywords,
                            price: suggestedPrice,
                            genre: aiAnalysis.detectedGenre,
                          },
                          copyrightPage: undefined, // TODO: Add copyright page generation
                        });
                      }}
                      disabled={!manuscript || !aiAnalysis || !selectedCover || !accountChecklistComplete}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      {accountChecklistComplete ? "Download Complete Package (ZIP)" : "Complete Account Setup First"}
                    </Button>
                    {accountChecklistComplete && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Ready to upload to Amazon KDP!
                      </p>
                    )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KDP Publishing Assistant */}
              <KDPPublishingAssistant
                bookData={{
                  title: selectedTitle || customTitle || aiAnalysis.suggestedTitles[0] || "",
                  subtitle: selectedSubtitle || customSubtitle,
                  author: authorProfile?.penName || "",
                  description: editedDescription || aiAnalysis.bookDescription,
                  keywords: [...kindleKeywords, ...paperbackKeywords],
                  categories: [...selectedKindleCategories, ...selectedPaperbackCategories],
                  language: "English",
                  publishingRights: "i-own-rights",
                  manuscriptUrl: manuscriptUrl || undefined,
                  coverUrl: selectedCover,
                  drm: false,
                  aiGenerated: true,
                  isbn: isbnNumber,
                  kdpSelect: true,
                  territories: "worldwide",
                  primaryMarketplace: "Amazon.com",
                  pricing: {
                    "Amazon.com": { price: 4.99, royaltyRate: 70 },
                    "Amazon.co.uk": { price: 3.99, royaltyRate: 70 },
                    "Amazon.de": { price: 4.49, royaltyRate: 70 },
                    "Amazon.fr": { price: 4.49, royaltyRate: 70 },
                    "Amazon.es": { price: 4.49, royaltyRate: 70 },
                    "Amazon.it": { price: 4.49, royaltyRate: 70 },
                    "Amazon.ca": { price: 5.99, royaltyRate: 70 },
                    "Amazon.com.au": { price: 6.99, royaltyRate: 70 },
                  },
                }}
              />

              <Card className="border-blue-500/50 bg-blue-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900 mb-2">Next: Set Up Amazon Author Central</h3>
                      <p className="text-blue-800 mb-4">
                        After publishing your book on Amazon KDP, set up your Author Central profile to connect with readers and track sales.
                      </p>
                      <Button 
                        size="lg" 
                        onClick={() => setCurrentStep("author-central")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Continue to Author Central Setup →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 9: Author Central Setup */}
          {currentStep === "author-central" && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={handleBackNavigation}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Export
              </Button>

              {/* Important Notice */}
              <Card className="border-amber-500/50 bg-amber-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-2">⚠️ Important: Complete This AFTER Publishing</h3>
                      <p className="text-amber-800 mb-3">
                        Amazon Author Central can only be set up AFTER your book is published and live on Amazon. 
                        Complete Steps 1-8, publish your book on Amazon KDP, then return here to set up your author profile.
                      </p>
                      <p className="text-sm text-amber-700">
                        Bookmark this page or save your progress to return after publishing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Set Up Amazon Author Central
                  </CardTitle>
                  <CardDescription>
                    Create your professional author profile to connect with readers and track book sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">
                      Amazon Author Central lets you manage your author page, connect with readers, and track book sales. 
                      Use the profile information you've created here to set up your account.
                    </p>
                  </div>

                  {/* Profile Summary */}
                  {authorProfile && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Your Author Profile Information:</h3>
                      <div className="grid gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Pen Name</p>
                          <p className="font-medium">{authorProfile.penName}</p>
                        </div>
                        {authorProfile.bio && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Biography</p>
                            <p className="text-sm">{authorProfile.bio}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">How to Set Up Author Central:</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                      <li>Publish your book on Amazon KDP first (complete Steps 1-8)</li>
                      <li>Wait 24-48 hours for your book to appear on Amazon</li>
                      <li>Visit Amazon Author Central and create your account</li>
                      <li>Claim your author page by verifying your published books</li>
                      <li>Add your biography, photo, and social media links</li>
                      <li>Track your book sales and reader reviews</li>
                    </ol>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3 pt-4">
                    <Button size="lg" variant="outline" asChild>
                      <a href="https://authorcentral.amazon.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Go to Amazon Author Central
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Card */}
              <Card className="border-green-500/50 bg-green-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900 mb-2">🎉 Congratulations! You're All Set!</h3>
                      <p className="text-green-800 mb-4">
                        You've completed the entire AI-powered publishing workflow. Your book is ready to become a bestseller!
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setCurrentStep("upload")}>
                          Start New Book
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="/books">
                            View My Books
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for remaining steps */}
          {false && (
            <Card>
              <CardHeader>
                <CardTitle>Step Under Development</CardTitle>
                <CardDescription>
                  This step is being built. The AI-agentic flow continues here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCurrentStep("upload")}>
                  Start Over
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </DashboardLayout>
  );
}
