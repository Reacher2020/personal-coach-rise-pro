import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: 'Imię jest wymagane' })
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' }),
  email: z.string()
    .trim()
    .max(255, { message: 'Email nie może przekraczać 255 znaków' })
    .email({ message: 'Nieprawidłowy adres email' })
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .max(20, { message: 'Telefon nie może przekraczać 20 znaków' })
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(1000, { message: 'Notatki nie mogą przekraczać 1000 znaków' })
    .optional()
    .or(z.literal('')),
  status: z.enum(['new', 'active', 'inactive']).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Workout plan validation schema
export const workoutPlanSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: 'Nazwa planu jest wymagana' })
    .max(100, { message: 'Nazwa nie może przekraczać 100 znaków' }),
  description: z.string()
    .max(1000, { message: 'Opis nie może przekraczać 1000 znaków' })
    .optional()
    .or(z.literal(''))
    .nullable(),
  duration_minutes: z.number()
    .min(1, { message: 'Czas trwania musi być większy od 0' })
    .max(600, { message: 'Czas trwania nie może przekraczać 600 minut' })
    .optional()
    .nullable(),
  difficulty: z.string()
    .max(50, { message: 'Poziom trudności nie może przekraczać 50 znaków' })
    .optional()
    .nullable(),
  category: z.string()
    .max(50, { message: 'Kategoria nie może przekraczać 50 znaków' })
    .optional()
    .nullable(),
  exercises_count: z.number()
    .min(0, { message: 'Liczba ćwiczeń nie może być ujemna' })
    .max(100, { message: 'Liczba ćwiczeń nie może przekraczać 100' })
    .optional()
    .nullable(),
});

export type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;

// Profile validation schema
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .max(100, { message: 'Imię nie może przekraczać 100 znaków' })
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .max(20, { message: 'Telefon nie może przekraczać 20 znaków' })
    .optional()
    .or(z.literal('')),
  bio: z.string()
    .max(1000, { message: 'Bio nie może przekraczać 1000 znaków' })
    .optional()
    .or(z.literal('')),
  specialization: z.string()
    .max(100, { message: 'Specjalizacja nie może przekraczać 100 znaków' })
    .optional()
    .or(z.literal('')),
  experience_years: z.number()
    .min(0, { message: 'Lata doświadczenia nie mogą być ujemne' })
    .max(100, { message: 'Lata doświadczenia nie mogą przekraczać 100' })
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Invitation validation schema
export const invitationSchema = z.object({
  email: z.string()
    .trim()
    .min(1, { message: 'Email jest wymagany' })
    .max(255, { message: 'Email nie może przekraczać 255 znaków' })
    .email({ message: 'Nieprawidłowy adres email' }),
  role: z.enum(['coach', 'client'], { message: 'Nieprawidłowa rola' }),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;

// Helper function to format zod errors for toast
export const formatZodErrors = (error: z.ZodError): string => {
  return error.errors.map(e => e.message).join(', ');
};
