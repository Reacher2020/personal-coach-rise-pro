import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  fallbackText: string;
  onAvatarChange: (url: string | null) => void;
}

export const AvatarUpload = ({
  userId,
  currentAvatarUrl,
  fallbackText,
  onAvatarChange,
}: AvatarUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Błąd",
        description: "Proszę wybrać plik graficzny (JPG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Błąd",
        description: "Plik jest za duży. Maksymalny rozmiar to 2MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onAvatarChange(publicUrl);
      setPreviewUrl(null);
      
      toast({
        title: "Zdjęcie zaktualizowane",
        description: "Twoje zdjęcie profilowe zostało zmienione.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setPreviewUrl(null);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać zdjęcia. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;
    
    setUploading(true);
    
    try {
      // Extract file path from URL
      const path = currentAvatarUrl.split("/avatars/")[1];
      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      if (error) throw error;

      onAvatarChange(null);
      setPreviewUrl(null);
      
      toast({
        title: "Zdjęcie usunięte",
        description: "Twoje zdjęcie profilowe zostało usunięte.",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć zdjęcia.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={displayUrl || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-xl font-medium">
            {fallbackText}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            {currentAvatarUrl ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
          </Button>
          {currentAvatarUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">JPG, PNG lub GIF. Max 2MB.</p>
      </div>
    </div>
  );
};
