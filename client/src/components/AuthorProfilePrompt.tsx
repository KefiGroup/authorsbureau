import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface AuthorProfilePromptProps {
  authorProfile: {
    penName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
  } | null;
  onContinue: () => void;
}

export function AuthorProfilePrompt({ authorProfile, onContinue }: AuthorProfilePromptProps) {
  const [, setLocation] = useLocation();
  
  const isProfileComplete = authorProfile?.penName && authorProfile?.avatarUrl && authorProfile?.bio;
  const hasPartialProfile = authorProfile && (authorProfile.penName || authorProfile.avatarUrl || authorProfile.bio);

  return (
    <Card className={isProfileComplete ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Author Profile
        </CardTitle>
        <CardDescription>
          {isProfileComplete
            ? "Your author profile is complete and ready for the Book Wrap Designer"
            : "Complete your author profile before designing your book wrap (Step 5)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Completion Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {authorProfile?.penName ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className={authorProfile?.penName ? "text-green-900" : "text-amber-900"}>
              Pen Name {authorProfile?.penName ? `(${authorProfile.penName})` : "(Required)"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {authorProfile?.avatarUrl ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className={authorProfile?.avatarUrl ? "text-green-900" : "text-amber-900"}>
              Author Photo {authorProfile?.avatarUrl ? "(Uploaded)" : "(Required for back cover)"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {authorProfile?.bio ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className={authorProfile?.bio ? "text-green-900" : "text-amber-900"}>
              Author Bio {authorProfile?.bio ? `(${authorProfile.bio.length} chars)` : "(Required for back cover)"}
            </span>
          </div>
        </div>

        {/* Why Profile is Needed */}
        {!isProfileComplete && (
          <div className="bg-white border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <strong>Why is this needed?</strong>
            <p className="mt-1">
              Your author photo and bio will appear on the back cover of your paperback book (Step 5: Book Wrap Designer).
              Complete your profile now to avoid interruptions later.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isProfileComplete ? (
            <Button onClick={onContinue} className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to Cover Design
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setLocation("/profile")}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-2" />
                {hasPartialProfile ? "Complete Profile" : "Create Profile"}
              </Button>
              <Button
                variant="ghost"
                onClick={onContinue}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </>
          )}
        </div>

        {!isProfileComplete && (
          <p className="text-xs text-muted-foreground text-center">
            You can skip this step, but you'll need to complete your profile before Step 5
          </p>
        )}
      </CardContent>
    </Card>
  );
}
