import { z } from "zod";
import { createZodDto } from "nestjs-zod";

// ─── Input Schemas ────────────────────────────────────────────────────────────

export const CreateCinemaSchema = z.object({
    name: z.string().min(5, "El nombre del cine debe tener al menos 5 caracteres"),
    address: z.string().min(10, "La dirección del cine debe tener al menos 10 caracteres"),
});

// ─── Output Schemas ───────────────────────────────────────────────────────────

export const CinemaRoomResponseSchema = z.object({
    name: z.string(),
    capacity: z.number().int().positive(),
});

export const CinemaResponseSchema = z.object({
    idPublic: z.string().uuid(),
    name: z.string(),
    address: z.string(),
    rooms: z.array(CinemaRoomResponseSchema).optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

/** Cuerpo de la petición POST /cinemas */
export type CreateCinemaInput = z.infer<typeof CreateCinemaSchema>;

/** Sala individual en la respuesta de cine */
export type CinemaRoomResponse = z.infer<typeof CinemaRoomResponseSchema>;

/** Respuesta de GET /cinemas y POST /cinemas */
export type CinemaResponse = z.infer<typeof CinemaResponseSchema>;

// ─── NestJS DTOs (solo para validación de cuerpos HTTP de entrada) ────────────

/** DTO para el cuerpo de POST /cinemas — valida y parsea con Zod via nestjs-zod */
export class CreateCinemaDto extends createZodDto(CreateCinemaSchema) {}
