-- Create professional_availability table for managing work schedules
CREATE TABLE public.professional_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_professional_availability_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Professionals can manage their availability" 
ON public.professional_availability 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = professional_availability.professional_id 
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Everyone can view professional availability" 
ON public.professional_availability 
FOR SELECT 
USING (is_available = true);

-- Create time_slots table for blocked specific times
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_time_slots_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS for time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for time_slots
CREATE POLICY "Professionals can manage their time slots" 
ON public.time_slots 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = time_slots.professional_id 
  AND profiles.user_id = auth.uid()
));

CREATE POLICY "Everyone can view non-blocked time slots" 
ON public.time_slots 
FOR SELECT 
USING (is_blocked = false);

-- Add triggers for updated_at
CREATE TRIGGER update_professional_availability_updated_at
  BEFORE UPDATE ON public.professional_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add appointment_confirmation column to appointments
ALTER TABLE public.appointments 
ADD COLUMN appointment_confirmation TEXT DEFAULT 'pending' CHECK (appointment_confirmation IN ('pending', 'confirmed', 'cancelled', 'no_show'));