import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

interface ProfileCompletionIndicatorProps {
  penName: string;
  bio: string;
  avatarUrl: string;
  website: string;
  accomplishments: string;
}

export function ProfileCompletionIndicator({
  penName,
  bio,
  avatarUrl,
  website,
  accomplishments,
}: ProfileCompletionIndicatorProps) {
  const fields = [
    { name: "Profile Photo", value: avatarUrl, required: true },
    { name: "Pen Name", value: penName, required: true },
    { name: "Bio", value: bio, required: true },
    { name: "Website", value: website, required: false },
    { name: "Accomplishments", value: accomplishments, required: false },
  ];

  const completedFields = fields.filter(f => f.value && f.value.trim().length > 0);
  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);
  const isComplete = completionPercentage === 100;
  const requiredComplete = fields.filter(f => f.required).every(f => f.value && f.value.trim().length > 0);

  return (
    <Card className={isComplete ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-primary/50 bg-primary/5"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isComplete ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Profile Complete!
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-primary" />
              Profile Completion
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completedFields.length} of {fields.length} fields complete
            </span>
            <span className="text-muted-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {fields.map((field) => {
            const isCompleted = field.value && field.value.trim().length > 0;
            return (
              <div key={field.name} className="flex items-center gap-2 text-sm">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={isCompleted ? "text-foreground" : "text-muted-foreground"}>
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status Message */}
        <div className="pt-2 border-t">
          {isComplete ? (
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              ✨ Your profile is ready! You can now use the Book Wrap Designer.
            </p>
          ) : requiredComplete ? (
            <p className="text-sm text-muted-foreground">
              Great start! Complete optional fields to make your author profile stand out.
            </p>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Complete required fields (*) to unlock the Book Wrap Designer.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
