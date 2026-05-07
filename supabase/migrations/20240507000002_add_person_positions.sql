-- Add position columns to persons table
ALTER TABLE public.persons 
ADD COLUMN IF NOT EXISTS position_x FLOAT,
ADD COLUMN IF NOT EXISTS position_y FLOAT;

-- Update existing records to have a default position if needed (optional, keeping them NULL for now)
-- Comment: Vị trí NULL sẽ được coi là chưa sắp xếp và sẽ dùng Dagre để tính lần đầu.
