import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";

export interface FinalCheckpointData {
  toneVoice: string[];
  toneVoiceOther: string;
  writingStyle: string[];
  writingStyleOther: string;
  chapterLength: string[];
  specialElements: string[];
  specialElementsOther: string;
  callToAction: string[];
  callToActionOther: string;
}

interface FinalCheckpointModalProps {
  open: boolean;
  onComplete: (data: FinalCheckpointData) => void;
}

export function FinalCheckpointModal({ open, onComplete }: FinalCheckpointModalProps) {
  const [data, setData] = useState<FinalCheckpointData>({
    toneVoice: [],
    toneVoiceOther: "",
    writingStyle: [],
    writingStyleOther: "",
    chapterLength: [],
    specialElements: [],
    specialElementsOther: "",
    callToAction: [],
    callToActionOther: "",
  });

  const handleCheckboxChange = (category: keyof FinalCheckpointData, value: string, checked: boolean) => {
    setData((prev) => {
      const currentArray = prev[category] as string[];
      if (checked) {
        return { ...prev, [category]: [...currentArray, value] };
      } else {
        return { ...prev, [category]: currentArray.filter((item) => item !== value) };
      }
    });
  };

  const handleOtherChange = (category: keyof FinalCheckpointData, value: string) => {
    setData((prev) => ({ ...prev, [category]: value }));
  };

  const handleComplete = () => {
    onComplete(data);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Almost Done! Let's Finalize Your Book Details</DialogTitle>
          </div>
          <DialogDescription>
            Select all that apply. These details will help us create the perfect blueprint for your book.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-8 py-4">
            {/* Tone & Voice */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Tone & Voice</h3>
              <div className="space-y-3">
                {[
                  "Professional and authoritative",
                  "Conversational and friendly",
                  "Inspirational and motivating",
                  "Academic and research-based",
                  "Humorous and entertaining",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tone-${option}`}
                      checked={data.toneVoice.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("toneVoice", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`tone-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="tone-other"
                    checked={data.toneVoiceOther.length > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) handleOtherChange("toneVoiceOther", "");
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="tone-other" className="cursor-pointer">
                      Other (specify):
                    </Label>
                    <Input
                      placeholder="Describe your preferred tone..."
                      value={data.toneVoiceOther}
                      onChange={(e) => handleOtherChange("toneVoiceOther", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Writing Style */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Writing Style</h3>
              <div className="space-y-3">
                {[
                  "Academic with data and research citations",
                  "Story-driven with real-world examples",
                  "Step-by-step instructional",
                  "Question-and-answer format",
                  "Narrative with personal anecdotes",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`style-${option}`}
                      checked={data.writingStyle.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("writingStyle", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`style-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="style-other"
                    checked={data.writingStyleOther.length > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) handleOtherChange("writingStyleOther", "");
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="style-other" className="cursor-pointer">
                      Other (specify):
                    </Label>
                    <Input
                      placeholder="Describe your preferred writing style..."
                      value={data.writingStyleOther}
                      onChange={(e) => handleOtherChange("writingStyleOther", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Length */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Chapter Length</h3>
              <div className="space-y-3">
                {[
                  "Short chapters (1,500-2,000 words)",
                  "Medium chapters (2,500-3,500 words)",
                  "Long chapters (4,000+ words)",
                  "Variable length based on content",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`length-${option}`}
                      checked={data.chapterLength.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("chapterLength", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`length-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Elements */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Special Elements</h3>
              <div className="space-y-3">
                {[
                  "Case studies and real-world examples",
                  "Exercises and worksheets",
                  "Charts, graphs, and data visualizations",
                  "Checklists and action items",
                  "Key takeaways and summaries",
                  "Quotes and testimonials",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`element-${option}`}
                      checked={data.specialElements.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("specialElements", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`element-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="element-other"
                    checked={data.specialElementsOther.length > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) handleOtherChange("specialElementsOther", "");
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="element-other" className="cursor-pointer">
                      Other (specify):
                    </Label>
                    <Input
                      placeholder="Describe other elements you'd like..."
                      value={data.specialElementsOther}
                      onChange={(e) => handleOtherChange("specialElementsOther", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Call-to-Action */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Call-to-Action</h3>
              <div className="space-y-3">
                {[
                  "Newsletter signup",
                  "Course or coaching offer",
                  "Community or forum invitation",
                  "Free resource or tool",
                  "Social media follow",
                  "None",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cta-${option}`}
                      checked={data.callToAction.includes(option)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("callToAction", option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`cta-${option}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="cta-other"
                    checked={data.callToActionOther.length > 0}
                    onCheckedChange={(checked) => {
                      if (!checked) handleOtherChange("callToActionOther", "");
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="cta-other" className="cursor-pointer">
                      Other (specify):
                    </Label>
                    <Input
                      placeholder="Describe your call-to-action..."
                      value={data.callToActionOther}
                      onChange={(e) => handleOtherChange("callToActionOther", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleComplete} size="lg" className="w-full">
            <Sparkles className="h-5 w-5 mr-2" />
            Complete Blueprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
