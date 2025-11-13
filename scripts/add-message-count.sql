-- Add message_count column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
