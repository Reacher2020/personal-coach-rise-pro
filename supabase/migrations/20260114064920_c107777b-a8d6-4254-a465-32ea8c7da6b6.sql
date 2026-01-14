-- Create a new table for coach-admin messages
CREATE TABLE public.admin_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    content text NOT NULL,
    read boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Require authentication
CREATE POLICY "Require authentication for admin_messages access"
ON public.admin_messages
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Users can view messages they sent or received
CREATE POLICY "Users can view their own messages"
ON public.admin_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages (insert)
CREATE POLICY "Users can send messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
CREATE POLICY "Users can mark received messages as read"
ON public.admin_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- Users can delete their own sent messages
CREATE POLICY "Users can delete their sent messages"
ON public.admin_messages
FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for admin_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;