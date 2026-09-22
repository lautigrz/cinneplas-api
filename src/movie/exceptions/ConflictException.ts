import { ApiException } from "../../common/base/ApiException.js";
import { HttpStatus } from "@nestjs/common";

export class MovieConflictException extends ApiException {
    constructor() {
        super("La película ya existe", HttpStatus.CONFLICT, "MOVIE_CONFLICT");
    }
}