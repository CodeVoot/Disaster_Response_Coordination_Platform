import { z } from 'zod';

export const CreateDisasterSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be detailed"),
  location: z.string().min(2, "Location is required"), 
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['active', 'resolved', 'investigating']).optional().default('active'),
  created_by: z.string().optional().default('anonymous'),
});

export const UpdateDisasterSchema = CreateDisasterSchema.partial();

export type CreateDisasterDTO = z.infer<typeof CreateDisasterSchema>;
export type UpdateDisasterDTO = z.infer<typeof UpdateDisasterSchema>;




export const ResourceQuerySchema = z.object({
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  radius: z.string().transform(Number),
});