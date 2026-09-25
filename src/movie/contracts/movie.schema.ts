import z from "zod";

export const MovieRequestSchema = z.object({
    id: z.number(),
})

export const MovieSchema = z.object({
    original_title: z.string().min(1, "El título es requerido"),
    overview: z.string().min(1, "La descripción es requerida"),
    poster_path: z.string().min(1, "La ruta de la imagen es requerida"),
    backdrop_path: z.string().min(1, "La ruta de la imagen es requerida"),
    runtime: z.number().int().positive("La duración debe ser un número positivo"),
    release_date: z.string(),
})

export const MoviePosterSchema = z.object({
    id: z.uuid(),
    title: z.string().min(1, "El título es requerido"),
    posterUrl: z.string().min(1, "La ruta de la imagen es requerida"),

})

export const CreateMovieSchema = MovieRequestSchema.extend({
})

export const ListMoviePostersRequestSchema = MovieSchema.extend({
    id: z.uuid(),
    cinemaId: z.uuid(),
    page: z.number().optional(),
    limit: z.number().optional(),
})


export type MovieRequestInput = z.infer<typeof MovieRequestSchema>;
export type MovieInput = z.infer<typeof MovieSchema>;
export type CreateMovieInput = z.infer<typeof CreateMovieSchema>;
export type ListMoviePostersRequestInput = z.infer<typeof ListMoviePostersRequestSchema>;
export type MoviePoster = z.infer<typeof MoviePosterSchema>;