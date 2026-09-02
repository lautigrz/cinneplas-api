import { z } from "zod";
import { createZodDto } from "nestjs-zod";


export const CreateCinemaSchema = z.object({
    name: z.string().min(5, "El nombre del cine debe tener al menos 5 caracteres"),
    address: z.string().min(10, "La dirección del cine debe tener al menos 10 caracteres"),
});



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

export type CreateCinemaInput = z.infer<typeof CreateCinemaSchema>;


export type CinemaRoomResponse = z.infer<typeof CinemaRoomResponseSchema>;


export type CinemaResponse = z.infer<typeof CinemaResponseSchema>;

export class CreateCinemaDto extends createZodDto(CreateCinemaSchema) { }
