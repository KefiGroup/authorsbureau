import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, User, Upload, Sparkles, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageCropper } from "@/components/ImageCropper";
import { ProfileCompletionIndicator } from "@/components/ProfileCompletionIndicator";

export default function Profile() {
  const { data: authorProfile, isLoading } = trpc.author.getProfile.useQuery();
  const createProfileMutation = trpc.author.createProfile.useMutation();
  const updateProfileMutation = trpc.author.updateProfile.useMutation();
  const uploadPhotoMutation = trpc.author.uploadProfilePhoto.useMutation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    penName: "",
    bio: "",
    website: "",
    linkedInUrl: "",
    avatarUrl: "",
    booksAuthored: "",
    accomplishments: "",
    education: "",
  });

  const [additionalInfo, setAdditionalInfo] = useState("");
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long">("medium");
  const [isUploading, setIsUploading] = useState(false);
  const [bioWordCount, setBioWordCount] = useState(0);
  const [bioCharCount, setBioCharCount] = useState(0);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const generateBio = trpc.author.generateAuthorBio.useMutation();

  useEffect(() => {
    if (authorProfile) {
      setFormData({
        penName: authorProfile.penName || "",
        bio: authorProfile.bio || "",
        website: authorProfile.website || "",
        linkedInUrl: authorProfile.linkedInUrl || "",
        avatarUrl: authorProfile.avatarUrl || "",
        booksAuthored: authorProfile.booksAuthored || "",
        accomplishments: authorProfile.accomplishments || "",
        education: authorProfile.education || "",
      });
    }
  }, [authorProfile]);

  // Update bio stats
  useEffect(() => {
    const words = formData.bio.trim().split(/\s+/).filter(w => w.length > 0).length;
    setBioWordCount(words);
    setBioCharCount(formData.bio.length);
  }, [formData.bio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authorProfile) {
        await updateProfileMutation.mutateAsync(formData);
        toast.success("Profile updated successfully!");
      } else {
        await createProfileMutation.mutateAsync(formData);
        toast.success("Profile created successfully!");
      }
      utils.author.getProfile.invalidate();
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const isSaving = createProfileMutation.isPending || updateProfileMutation.isPending;
  const isProfileComplete = !!(formData.penName && formData.bio && formData.avatarUrl);
  const bioWithinLimit = bioCharCount <= 2000;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload an image smaller than 5MB");
      return;
    }

    // Show cropper with selected image
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(croppedBlob);
      await new Promise((resolve) => { reader.onloadend = resolve; });
      const base64Data = reader.result as string;
      
      // Upload to S3 via tRPC
      const { url } = await uploadPhotoMutation.mutateAsync({
        imageData: base64Data,
        mimeType: "image/jpeg",
      });
      
      setFormData({ ...formData, avatarUrl: url });
      setImageToCrop(null);
      
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
  };

  const handleGenerateBio = async () => {
    if (!formData.booksAuthored && !formData.accomplishments && !formData.education && !additionalInfo) {
      toast.error("Please fill in at least one field to generate a bio");
      return;
    }

    try {
      const result = await generateBio.mutateAsync({
        booksAuthored: formData.booksAuthored,
        accomplishments: formData.accomplishments,
        education: formData.education,
        additionalInfo,
        targetLength,
      });

      setFormData({ ...formData, bio: result.bio });
      toast.success(`Bio generated! ${result.wordCount} words (${result.charCount} characters)`);
    } catch (error) {
      console.error("Bio generation error:", error);
      toast.error("Failed to generate bio. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Author Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your author information and public profile
          </p>
        </div>

        {/* Profile Completion Indicator */}
        {!isLoading && (
          <ProfileCompletionIndicator
            penName={formData.penName}
            bio={formData.bio}
            avatarUrl={formData.avatarUrl}
            website={formData.website}
            accomplishments={formData.accomplishments}
          />
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your author details that will be displayed publicly
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo */}
                <div className="space-y-2">
                  <Label>Profile Photo *</Label>
                  <div className="flex items-start gap-6">
                    {formData.avatarUrl && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={formData.avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors">
                          <div className="flex flex-col items-center gap-2">
                            {isUploading ? (
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            ) : (
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            )}
                            <p className="text-sm font-medium">
                              {isUploading ? "Uploading..." : "Click to upload photo"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Min 300x300px, max 5MB (JPG, PNG, GIF)
                            </p>
                          </div>
                        </div>
                        <Input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Professional photo for book covers and Amazon Author Central (required)
                  </p>
                </div>

                {/* Pen Name */}
                <div className="space-y-2">
                  <Label htmlFor="penName">Pen Name</Label>
                  <Input
                    id="penName"
                    placeholder="Your author name"
                    value={formData.penName}
                    onChange={(e) => setFormData({ ...formData, penName: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    The name you publish under (can be different from your account name)
                  </p>
                </div>

                {/* AI Bio Generator Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Bio Generator</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Provide your information and let AI create a professional author bio
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="booksAuthored">Books You've Authored</Label>
                      <Textarea
                        id="booksAuthored"
                        placeholder="e.g., The Digital Marketing Handbook (2022), Social Media Mastery (2020)"
                        rows={2}
                        value={formData.booksAuthored}
                        onChange={(e) => setFormData({ ...formData, booksAuthored: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accomplishments">Accomplishments & Awards</Label>
                      <Textarea
                        id="accomplishments"
                        placeholder="e.g., Featured in Forbes, TEDx Speaker, 10+ years marketing experience"
                        rows={2}
                        value={formData.accomplishments}
                        onChange={(e) => setFormData({ ...formData, accomplishments: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="education">Education Background</Label>
                      <Textarea
                        id="education"
                        placeholder="e.g., MBA from Stanford University, BA in Marketing"
                        rows={2}
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea
                        id="additionalInfo"
                        placeholder="Any other relevant information you'd like to include"
                        rows={2}
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleGenerateBio}
                      disabled={generateBio.isPending}
                      className="w-full"
                      variant="outline"
                    >
                      {generateBio.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Bio...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Professional Bio
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Write your author bio in third person... or use the AI generator above"
                    rows={8}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={!bioWithinLimit ? "border-red-500" : ""}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {bioWordCount} words, {bioCharCount} characters
                    </span>
                    <span className={bioCharCount > 2000 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                      {bioCharCount}/2000 characters (Amazon Author Central limit)
                    </span>
                  </div>
                  {!bioWithinLimit && (
                    <p className="text-sm text-red-500">
                      Bio exceeds Amazon Author Central's 2,000 character limit
                    </p>
                  )}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your personal website or author page
                  </p>
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profile (Optional)</Label>
                  <Input
                    id="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedInUrl}
                    onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Your LinkedIn profile URL
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion Status */}
        {!isProfileComplete && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete your profile (pen name, bio, and photo) to use the Book Wrap Designer and export your books
            </AlertDescription>
          </Alert>
        )}

        {isProfileComplete && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Profile complete! Your information will be used for book covers and Amazon Author Central
            </AlertDescription>
          </Alert>
        )}

        {/* Amazon Author Central Guide */}
        {isProfileComplete && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Next Step: Setup Amazon Author Central
              </CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Use your profile information to create your Amazon Author Central account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Amazon Author Central lets you manage your author page, connect with readers, and track book sales. 
                Use the profile information you've created here to set up your account.
              </p>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900"
                onClick={() => window.open("https://author.amazon.com/", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Amazon Author Central
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Preview */}
        {authorProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>How your profile appears to readers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {formData.penName || "Your Pen Name"}
                  </h3>
                  {formData.website && (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {formData.website}
                    </a>
                  )}
                </div>
                {formData.bio && (
                  <p className="text-muted-foreground whitespace-pre-wrap">{formData.bio}</p>
                )}
                {!formData.bio && (
                  <p className="text-muted-foreground italic">No biography added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Cropper Dialog */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
        />
      )}
    </DashboardLayout>
  );
}
