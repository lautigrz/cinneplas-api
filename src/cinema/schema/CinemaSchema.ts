import { z } from "zod";

export const CreateCinemaSchema = z.object({
    name: z.string().min(5, "El nombre del cine debe tener al menos 5 caracteres"),
    address: z.string().min(10, "La direccion del cine debe tener al menos 10 caracteres")
})

export type CreateCinemaInput = z.infer<typeof CreateCinemaSchema>