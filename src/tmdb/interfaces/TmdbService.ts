export interface ITmdbService {
    findMovieById(id: number): Promise<any>
}

export const TMDB_SERVICE = Symbol("TMDB_SERVICE");