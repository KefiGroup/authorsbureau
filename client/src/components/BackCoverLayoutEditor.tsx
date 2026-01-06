import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2 } from "lucide-react";
import type { BackCoverLayout, BackCoverElement, LayoutPreset } from "../../../shared/back-cover-types";
import { LAYOUT_PRESETS } from "../../../shared/back-cover-types";

interface BackCoverLayoutEditorProps {
  layout: BackCoverLayout;
  onChange: (layout: BackCoverLayout) => void;
}

export function BackCoverLayoutEditor({ layout, onChange }: BackCoverLayoutEditorProps) {
  const [selectedPreset, setSelectedPreset] = useState<LayoutPreset>(layout.preset);

  const handlePresetChange = (preset: LayoutPreset) => {
    setSelectedPreset(preset);
    const presetConfig = LAYOUT_PRESETS[preset];
    onChange({
      ...layout,
      preset,
      elements: presetConfig.elements || [],
    });
  };

  const toggleElement = (elementId: string) => {
    const updatedElements = layout.elements.map((el) =>
      el.id === elementId ? { ...el, enabled: !el.enabled } : el
    );
    onChange({ ...layout, elements: updatedElements });
  };

  const updateElementContent = (elementId: string, content: string) => {
    const updatedElements = layout.elements.map((el) =>
      el.id === elementId ? { ...el, content } : el
    );
    onChange({ ...layout, elements: updatedElements });
  };

  const addCustomElement = (type: BackCoverElement["type"]) => {
    const newElement: BackCoverElement = {
      id: `${type}-${Date.now()}`,
      type,
      enabled: true,
      content: "",
      position: { x: 10, y: 10 },
      size: { width: 80, height: 20 },
    };
    onChange({ ...layout, elements: [...layout.elements, newElement] });
  };

  const removeElement = (elementId: string) => {
    const updatedElements = layout.elements.filter((el) => el.id !== elementId);
    onChange({ ...layout, elements: updatedElements });
  };

  const getElementLabel = (type: BackCoverElement["type"]): string => {
    const labels: Record<BackCoverElement["type"], string> = {
      photo: "Author Photo",
      bio: "Author Bio",
      description: "Book Description",
      isbn: "ISBN",
      foreword: "Foreword",
      testimonial: "Testimonial",
      awards: "Awards & Recognition",
      series_info: "Series Information",
      custom_text: "Custom Text",
    };
    return labels[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Back Cover Layout</CardTitle>
        <CardDescription>
          Choose a layout preset or customize your back cover design
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Layout Preset Selector */}
        <div className="space-y-2">
          <Label>Layout Preset</Label>
          <Select value={selectedPreset} onValueChange={(value) => handlePresetChange(value as LayoutPreset)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic - Photo + Bio + Description</SelectItem>
              <SelectItem value="modern">Modern - Description First</SelectItem>
              <SelectItem value="minimal">Minimal - Description Only</SelectItem>
              <SelectItem value="bold">Bold - Large Photo Centered</SelectItem>
              <SelectItem value="custom">Custom - Build Your Own</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Element Toggles */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Elements</Label>
          <Accordion type="multiple" className="w-full">
            {layout.elements.map((element) => (
              <AccordionItem key={element.id} value={element.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={element.enabled}
                        onCheckedChange={() => toggleElement(element.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={!element.enabled ? "text-muted-foreground" : ""}>
                        {getElementLabel(element.type)}
                      </span>
                    </div>
                    {(element.type === "foreword" ||
                      element.type === "testimonial" ||
                      element.type === "awards" ||
                      element.type === "series_info" ||
                      element.type === "custom_text") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(element.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {(element.type === "foreword" ||
                    element.type === "testimonial" ||
                    element.type === "awards" ||
                    element.type === "series_info" ||
                    element.type === "custom_text") && (
                    <div className="space-y-2 pt-2">
                      <Label>Content</Label>
                      <Textarea
                        value={element.content || ""}
                        onChange={(e) => updateElementContent(element.id, e.target.value)}
                        placeholder={`Enter ${getElementLabel(element.type).toLowerCase()}...`}
                        rows={4}
                      />
                    </div>
                  )}
                  {element.type === "photo" && (
                    <p className="text-sm text-muted-foreground pt-2">
                      Your author photo from your profile will be used
                    </p>
                  )}
                  {element.type === "bio" && (
                    <p className="text-sm text-muted-foreground pt-2">
                      Your author bio from your profile will be used
                    </p>
                  )}
                  {element.type === "description" && (
                    <p className="text-sm text-muted-foreground pt-2">
                      Your book description from AI analysis will be used
                    </p>
                  )}
                  {element.type === "isbn" && (
                    <p className="text-sm text-muted-foreground pt-2">
                      ISBN will be generated or you can enter your own
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Add Optional Elements */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Add Optional Elements</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomElement("foreword")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Foreword
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomElement("testimonial")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Testimonial
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomElement("awards")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Awards
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomElement("series_info")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Series Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCustomElement("custom_text")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Custom Text
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
