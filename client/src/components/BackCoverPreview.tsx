import type { BackCoverLayout, BackCoverElement } from "../../../shared/back-cover-types";

interface BackCoverPreviewProps {
  layout: BackCoverLayout;
  authorPhoto?: string;
  authorBio?: string;
  bookDescription?: string;
  isbn?: string;
}

export function BackCoverPreview({
  layout,
  authorPhoto,
  authorBio,
  bookDescription,
  isbn,
}: BackCoverPreviewProps) {
  const renderElement = (element: BackCoverElement) => {
    if (!element.enabled) return null;

    const style: React.CSSProperties = {
      position: "absolute",
      left: `${element.position.x}%`,
      top: `${element.position.y}%`,
      width: `${element.size.width}%`,
      height: `${element.size.height}%`,
      fontSize: element.style?.fontSize || 14,
      fontFamily: element.style?.fontFamily || "inherit",
      textAlign: element.style?.textAlign || "left",
      color: element.style?.color || "inherit",
      overflow: "hidden",
    };

    switch (element.type) {
      case "photo":
        return (
          <div key={element.id} style={style} className="flex items-center justify-center">
            {authorPhoto ? (
              <img
                src={authorPhoto}
                alt="Author"
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                Photo
              </div>
            )}
          </div>
        );

      case "bio":
        return (
          <div key={element.id} style={style} className="text-sm leading-relaxed">
            {authorBio || <span className="text-gray-400 italic">Author bio will appear here</span>}
          </div>
        );

      case "description":
        return (
          <div key={element.id} style={style} className="text-base leading-relaxed">
            {bookDescription || (
              <span className="text-gray-400 italic">Book description will appear here</span>
            )}
          </div>
        );

      case "isbn":
        return (
          <div key={element.id} style={style} className="text-xs font-mono">
            {isbn || "ISBN: 000-0-00-000000-0"}
          </div>
        );

      case "foreword":
      case "testimonial":
      case "awards":
      case "series_info":
      case "custom_text":
        return (
          <div key={element.id} style={style} className="text-sm leading-relaxed italic">
            {element.content || (
              <span className="text-gray-400">
                {element.type === "foreword" && "Foreword text will appear here"}
                {element.type === "testimonial" && "Testimonial will appear here"}
                {element.type === "awards" && "Awards & recognition will appear here"}
                {element.type === "series_info" && "Series information will appear here"}
                {element.type === "custom_text" && "Custom text will appear here"}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full aspect-[2/3] bg-white border-2 border-gray-300 rounded-lg shadow-lg relative overflow-hidden">
      {/* Background */}
      {layout.backgroundColor && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: layout.backgroundColor }}
        />
      )}
      {layout.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${layout.backgroundImage})` }}
        />
      )}

      {/* Elements */}
      <div className="absolute inset-0 p-6">
        {layout.elements.map((element) => renderElement(element))}
      </div>

      {/* Preview Label */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Preview
      </div>
    </div>
  );
}
