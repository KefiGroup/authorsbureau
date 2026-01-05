import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, User } from "lucide-react";
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
  });

  useEffect(() => {
    if (authorProfile) {
      setFormData({
        penName: authorProfile.penName || "",
        bio: authorProfile.bio || "",
        website: authorProfile.website || "",
      });
    }
  }, [authorProfile]);

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
