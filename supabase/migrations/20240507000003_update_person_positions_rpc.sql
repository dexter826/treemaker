-- Create a function to update multiple person positions at once safely
CREATE OR REPLACE FUNCTION public.update_person_positions(updates JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE public.persons
    SET 
      position_x = (item->>'position_x')::FLOAT,
      position_y = (item->>'position_y')::FLOAT,
      updated_at = NOW()
    WHERE id = (item->>'id')::UUID;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
