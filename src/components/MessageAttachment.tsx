import { FileText, Image, Film, Music, File, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageAttachmentProps {
  url: string;
  name: string;
  type: string;
  isOwn?: boolean;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const MessageAttachment = ({
  url,
  name,
  type,
  isOwn = false,
  onRemove,
  showRemove = false,
}: MessageAttachmentProps) => {
  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');

  const getIcon = () => {
    if (isImage) return <Image className="h-4 w-4" />;
    if (isVideo) return <Film className="h-4 w-4" />;
    if (isAudio) return <Music className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  if (isImage) {
    return (
      <div className="relative group">
        {showRemove && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 z-10"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={name}
            className="max-w-[250px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative group">
        {showRemove && onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 z-10"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <video
          src={url}
          controls
          className="max-w-[250px] max-h-[200px] rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-lg border",
      isOwn ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-muted/50 border-border"
    )}>
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      <div className={cn(
        "p-2 rounded",
        isOwn ? "bg-primary-foreground/20" : "bg-muted"
      )}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isOwn ? "text-primary-foreground" : "text-foreground"
        )}>
          {name}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-8 w-8"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Preview component for attachment before sending
interface AttachmentPreviewProps {
  file: File;
  previewUrl?: string;
  onRemove: () => void;
}

export const AttachmentPreview = ({ file, previewUrl, onRemove }: AttachmentPreviewProps) => {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="relative inline-block">
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 z-10"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="h-20 w-20 rounded-lg object-cover"
        />
      ) : (
        <div className="h-20 w-20 rounded-lg bg-muted flex flex-col items-center justify-center p-2">
          <File className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs text-muted-foreground truncate w-full text-center mt-1">
            {file.name.split('.').pop()?.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};
