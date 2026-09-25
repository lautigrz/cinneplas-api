import z from "zod";

export const createShowtimeSchema = z.object({
    dateTime: z.string().min(1, "Date time is required"),
    cinemaId: z.uuid("Cinema id is required"),
    roomId: z.uuid("Room id is required"),
    movieId: z.uuid("Movie id is required"),
});

export const showtimeRequestSchema = z.object({
    cinemaId: z.uuid("Cinema id is required"),
    movieId: z.uuid("Movie id is required"),
})

export const dateTimeSchema = z.object({
    id: z.uuid("Id is required"),
    dateTime: z.string().min(1, "Date time is required"),
})

export const showTimeMovieSchema = z.object({
    id: z.uuid("Id is required"),
    title: z.string("Title is required"),
    posterUrl: z.string("Poster url is required")
})

export const showTimeMovieDetailSchema = z.object({
    id: z.uuid("Id is required"),
    title: z.string().min(1, "El título es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    posterUrl: z.string().min(1, "La ruta de la imagen es requerida"),
    runtime: z.number().int().positive("La duración debe ser un número positivo"),
    releaseDate: z.string(),
    dateTime: z.array(dateTimeSchema)
})


export const showtimeListRequest = z.object({
    cinemaId: z.uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
})

export type CreateShowtimeInput = z.infer<typeof createShowtimeSchema>;
export type ShowtimeRequestInput = z.infer<typeof showtimeRequestSchema>;
export type ShowTimeMovieInput = z.infer<typeof showTimeMovieSchema>;
export type ShowTimeMovieDetailOutput = z.infer<typeof showTimeMovieDetailSchema>;
export type ShowtimeListRequestInput = z.infer<typeof showtimeListRequest>;


export interface GetListShowTimeMovieResponse {
    movies: ShowTimeMovieInput[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    }
}