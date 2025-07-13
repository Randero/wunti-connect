-- Add caption column to campaign_gallery table
ALTER TABLE campaign_gallery 
ADD COLUMN caption TEXT;

-- Update existing records with default caption
UPDATE campaign_gallery 
SET caption = 'Join us in supporting Engr. Aliyu Muhammed Cambat for positive change! #AliyuCambat #Vote2024' 
WHERE caption IS NULL;