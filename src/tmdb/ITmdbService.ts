import { TmdbMovieNotFoundException, TmdbServiceUnavailableException } from "./exceptions/TmdbExceptions.js";

export class ITmdbService {
    constructor() { }

    async findMovieById(id: number): Promise<any> {
        try {
            const url = `${process.env.TMDB_URL}/movie/${id}?${process.env.TMDB_LENGUAGE}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                },
            });

            if (response.status === 404) {
                throw new TmdbMovieNotFoundException(id);
            }

            if (!response.ok) {
                throw new TmdbServiceUnavailableException();
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (
                error instanceof TmdbMovieNotFoundException ||
                error instanceof TmdbServiceUnavailableException
            ) {
                throw error;
            }
            console.error("Error al buscar la película en TMDB:", error);
            throw new TmdbServiceUnavailableException();
        }

    }
}