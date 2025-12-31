-- Create profiles table for coach data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  specialization TEXT,
  experience_years INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('active', 'inactive', 'new')),
  notes TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Clients policies
CREATE POLICY "Coaches can view their own clients" 
ON public.clients FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own clients" 
ON public.clients FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own clients" 
ON public.clients FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own clients" 
ON public.clients FOR DELETE 
USING (auth.uid() = coach_id);

-- Create sessions/training table
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on training_sessions
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Training sessions policies
CREATE POLICY "Coaches can view their own sessions" 
ON public.training_sessions FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own sessions" 
ON public.training_sessions FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own sessions" 
ON public.training_sessions FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own sessions" 
ON public.training_sessions FOR DELETE 
USING (auth.uid() = coach_id);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  description TEXT,
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Coaches can view their own payments" 
ON public.payments FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own payments" 
ON public.payments FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own payments" 
ON public.payments FOR UPDATE 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own payments" 
ON public.payments FOR DELETE 
USING (auth.uid() = coach_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_from_coach BOOLEAN NOT NULL DEFAULT true,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Coaches can view their own messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own messages" 
ON public.messages FOR UPDATE 
USING (auth.uid() = coach_id);

-- Create settings table
CREATE TABLE public.coach_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'pl',
  theme TEXT DEFAULT 'system',
  currency TEXT DEFAULT 'PLN',
  default_session_duration INTEGER DEFAULT 60,
  reminder_time INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coach_settings
ALTER TABLE public.coach_settings ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Users can view their own settings" 
ON public.coach_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.coach_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.coach_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_sessions_updated_at
BEFORE UPDATE ON public.training_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_settings_updated_at
BEFORE UPDATE ON public.coach_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.coach_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile and settings on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();