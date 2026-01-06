import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Palette, Type, AlignCenter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CoverCustomizerProps {
  coverUrl: string;
  bookTitle: string;
  authorName: string;
  genre: string;
  onCustomizationComplete: (newCoverUrl: string) => void;
  onCancel: () => void;
}

interface CustomizationSettings {
  titleFont: string;
  authorFont: string;
  titleColor: string;
  authorColor: string;
  backgroundColor: string;
  titlePosition: "top" | "center" | "bottom";
  titleSize: number;
  authorSize: number;
}

const BOOK_FONTS = [
  { value: "playfair", label: "Playfair Display (Elegant Serif)" },
  { value: "montserrat", label: "Montserrat (Modern Sans)" },
  { value: "merriweather", label: "Merriweather (Classic Serif)" },
  { value: "lora", label: "Lora (Readable Serif)" },
  { value: "raleway", label: "Raleway (Clean Sans)" },
  { value: "crimson", label: "Crimson Text (Traditional)" },
  { value: "oswald", label: "Oswald (Bold Sans)" },
  { value: "bitter", label: "Bitter (Strong Serif)" },
];

const COLOR_PRESETS = [
  { value: "#FFFFFF", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#FFD700", label: "Gold" },
  { value: "#C0C0C0", label: "Silver" },
  { value: "#FF6B6B", label: "Coral Red" },
  { value: "#4ECDC4", label: "Turquoise" },
  { value: "#95E1D3", label: "Mint" },
  { value: "#F38181", label: "Pink" },
];

export function CoverCustomizer({
  coverUrl,
  bookTitle,
  authorName,
  genre,
  onCustomizationComplete,
  onCancel,
}: CoverCustomizerProps) {
  const [settings, setSettings] = useState<CustomizationSettings>({
    titleFont: "playfair",
    authorFont: "montserrat",
    titleColor: "#FFFFFF",
    authorColor: "#FFFFFF",
    backgroundColor: "#000000",
    titlePosition: "center",
    titleSize: 72,
    authorSize: 36,
  });

  const customizeCover = trpc.covers.customizeCover.useMutation({
    onSuccess: (data: { coverUrl: string }) => {
      toast.success("Cover customized successfully!");
      onCustomizationComplete(data.coverUrl);
    },
    onError: (error: any) => {
      toast.error(`Customization failed: ${error.message}`);
    },
  });

  const handleApply = () => {
    customizeCover.mutate({
      bookTitle,
      authorName,
      genre,
      customization: settings,
    });
  };

  const updateSetting = <K extends keyof CustomizationSettings>(
    key: K,
    value: CustomizationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Customize Cover
          </CardTitle>
          <CardDescription>
            Adjust fonts, colors, and positioning to match your vision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Font */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Title Font
            </Label>
            <Select
              value={settings.titleFont}
              onValueChange={(value) => updateSetting("titleFont", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOK_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Author Font */}
          <div className="space-y-2">
            <Label>Author Name Font</Label>
            <Select
              value={settings.authorFont}
              onValueChange={(value) => updateSetting("authorFont", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOK_FONTS.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title Color */}
          <div className="space-y-2">
            <Label>Title Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSetting("titleColor", color.value)}
                  className={`w-full h-10 rounded border-2 transition-all ${
                    settings.titleColor === color.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <input
              type="color"
              value={settings.titleColor}
              onChange={(e) => updateSetting("titleColor", e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>

          {/* Author Color */}
          <div className="space-y-2">
            <Label>Author Name Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSetting("authorColor", color.value)}
                  className={`w-full h-10 rounded border-2 transition-all ${
                    settings.authorColor === color.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <input
              type="color"
              value={settings.authorColor}
              onChange={(e) => updateSetting("authorColor", e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>

          {/* Text Position */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlignCenter className="w-4 h-4" />
              Title Position
            </Label>
            <Select
              value={settings.titlePosition}
              onValueChange={(value: "top" | "center" | "bottom") =>
                updateSetting("titlePosition", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title Size */}
          <div className="space-y-2">
            <Label>Title Size: {settings.titleSize}px</Label>
            <Slider
              value={[settings.titleSize]}
              onValueChange={([value]) => updateSetting("titleSize", value)}
              min={36}
              max={120}
              step={4}
            />
          </div>

          {/* Author Size */}
          <div className="space-y-2">
            <Label>Author Name Size: {settings.authorSize}px</Label>
            <Slider
              value={[settings.authorSize]}
              onValueChange={([value]) => updateSetting("authorSize", value)}
              min={18}
              max={72}
              step={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleApply}
              disabled={customizeCover.isPending}
              className="flex-1"
            >
              {customizeCover.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={customizeCover.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>
            See how your customizations will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full max-w-md mx-auto">
            <img
              src={coverUrl}
              alt="Cover preview"
              className="w-full rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div
                className={`space-y-4 ${
                  settings.titlePosition === "top"
                    ? "items-start justify-start"
                    : settings.titlePosition === "bottom"
                    ? "items-end justify-end"
                    : "items-center justify-center"
                } flex flex-col h-full w-full`}
              >
                <h2
                  style={{
                    fontFamily: settings.titleFont,
                    color: settings.titleColor,
                    fontSize: `${settings.titleSize * 0.3}px`,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                  className="font-bold leading-tight"
                >
                  {bookTitle}
                </h2>
                <p
                  style={{
                    fontFamily: settings.authorFont,
                    color: settings.authorColor,
                    fontSize: `${settings.authorSize * 0.3}px`,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {authorName}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Note: This is a simplified preview. The actual cover will be generated with your
            customizations applied to the original design.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
