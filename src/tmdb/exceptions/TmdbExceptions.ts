import { ApiException } from "../../common/base/ApiException.js";
import { HttpStatus } from "@nestjs/common";

export class TmdbMovieNotFoundException extends ApiException {
    constructor(id: number) {
        super(
            `Película con id ${id} no encontrada en TMDB`,
            HttpStatus.NOT_FOUND,
            "TMDB_MOVIE_NOT_FOUND"
        );
    }
}

export class TmdbServiceUnavailableException extends ApiException {
    constructor() {
        super(
            "El servicio de TMDB no está disponible en este momento",
            HttpStatus.SERVICE_UNAVAILABLE,
            "TMDB_SERVICE_UNAVAILABLE"
        );
    }
}
