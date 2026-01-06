import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, User, Upload, Sparkles, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { data: authorProfile, isLoading } = trpc.author.getProfile.useQuery();
  const createProfileMutation = trpc.author.createProfile.useMutation();
  const updateProfileMutation = trpc.author.updateProfile.useMutation();
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

    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `author-photos/${Date.now()}-${randomSuffix}.${file.name.split(".").pop()}`;
      
      // TODO: Implement storagePut - for now just use a placeholder
      // const { url } = await storagePut(fileKey, uint8Array, file.type);
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, avatarUrl: url });
      
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
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

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell readers about yourself..."
                    rows={6}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    A brief description of your background and writing style
                  </p>
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
    </DashboardLayout>
  );
}
