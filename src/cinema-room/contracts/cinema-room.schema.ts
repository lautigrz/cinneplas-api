import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const SeatTypeSchema = z.enum(["STANDARD", "VIP", "PREMIUM"]);

export const SeatSchema = z.object({
    row: z.string().min(1, "La fila es obligatoria"),
    number: z.number().int().positive("El número de asiento debe ser positivo"),
    positionX: z.number().int().min(0, "La posición X no puede ser negativa"),
    positionY: z.number().int().min(0, "La posición Y no puede ser negativa"),
    price: z.number().positive("El precio debe ser un número positivo"),
    isActive: z.boolean().optional().default(false),
    type: SeatTypeSchema.optional().default("STANDARD"),
});

export const CreateCinemaRoomSchema = z.object({
    cinemaIdPublic: z.string().uuid("ID de cine inválido"),
    name: z.string().min(2, "El nombre de la sala debe tener al menos 2 caracteres"),
    capacity: z.number().int().positive("La capacidad debe ser un número positivo"),
    seats: z.array(SeatSchema).min(1, "Debe incluir al menos un asiento"),
});

// Seat patch: el id es obligatorio (para identificar cuál actualizar), resto opcional
export const PatchSeatSchema = z.object({
    id: z.number().int().positive("El ID del asiento es obligatorio para actualizarlo"),
    row: z.string().min(1).optional(),
    number: z.number().int().positive().optional(),
    positionX: z.number().int().min(0).optional(),
    positionY: z.number().int().min(0).optional(),
    price: z.number().positive().optional(),
    isActive: z.boolean().optional(),
    type: SeatTypeSchema.optional(),
});

// PATCH schema: todos los campos de la sala son opcionales
// seats es una lista de asientos a parchear (identificados por id)
export const PatchCinemaRoomSchema = z.object({
    name: z.string().min(2, "El nombre de la sala debe tener al menos 2 caracteres").optional(),
    capacity: z.number().int().positive("La capacidad debe ser un número positivo").optional(),
    seats: z.array(PatchSeatSchema).optional(),
}).refine(
    (data) => data.name !== undefined || data.capacity !== undefined || (data.seats && data.seats.length > 0),
    { message: "Debe enviar al menos un campo para actualizar." }
);

export const SeatResponseSchema = z.object({
    id: z.number().optional(),
    row: z.string(),
    number: z.number(),
    positionX: z.number(),
    positionY: z.number(),
    price: z.number(),
    isActive: z.boolean(),
    type: SeatTypeSchema,
});

export const CinemaRoomResponseSchema = z.object({
    idPublic: z.string().uuid(),
    name: z.string(),
    capacity: z.number(),
    seats: z.array(SeatResponseSchema),
});

export type SeatInput = z.infer<typeof SeatSchema>;
export type PatchSeatInput = z.infer<typeof PatchSeatSchema>;
export type CreateCinemaRoomInput = z.infer<typeof CreateCinemaRoomSchema>;
export type PatchCinemaRoomInput = z.infer<typeof PatchCinemaRoomSchema>;
export type SeatResponse = z.infer<typeof SeatResponseSchema>;
export type CinemaRoomResponse = z.infer<typeof CinemaRoomResponseSchema>;

export class CreateCinemaRoomDto extends createZodDto(CreateCinemaRoomSchema) { }
export class PatchCinemaRoomDto extends createZodDto(PatchCinemaRoomSchema) { }
