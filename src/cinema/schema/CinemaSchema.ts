import { z } from "zod";

export const CreateCinemaSchema = z.object({
    name: z.string(),
    address: z.string()
})

export type CreateCinemaInput = z.infer<typeof CreateCinemaSchema>