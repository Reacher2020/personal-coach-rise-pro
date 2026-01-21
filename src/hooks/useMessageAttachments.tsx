import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface AttachmentData {
  url: string;
  name: string;
  type: string;
}

export const useMessageAttachments = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadAttachment = async (file: File): Promise<AttachmentData | null> => {
    if (!user) {
      toast.error('Musisz być zalogowany');
      return null;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Plik jest zbyt duży (max 10MB)');
      return null;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Nie udało się przesłać pliku');
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        name: file.name,
        type: file.type,
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Nie udało się przesłać pliku');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const isImageType = (type: string) => {
    return type.startsWith('image/');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('document')) return 'doc';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'spreadsheet';
    return 'file';
  };

  return {
    uploadAttachment,
    uploading,
    isImageType,
    getFileIcon,
  };
};
