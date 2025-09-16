-- Create appointment_notifications table
CREATE TABLE public.appointment_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'confirmation', 'cancellation', 'reschedule')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_appointment_notifications_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointment_notifications_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their notifications" 
ON public.appointment_notifications 
FOR SELECT 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "System can create notifications" 
ON public.appointment_notifications 
FOR INSERT 
WITH CHECK (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their notifications" 
ON public.appointment_notifications 
FOR UPDATE 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their notifications" 
ON public.appointment_notifications 
FOR DELETE 
USING (user_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Add trigger for updated_at
CREATE TRIGGER update_appointment_notifications_updated_at
  BEFORE UPDATE ON public.appointment_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();