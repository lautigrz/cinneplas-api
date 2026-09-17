import { HttpStatus } from "@nestjs/common";
import { ApiException } from "../../common/base/ApiException.js";

export class CinemaNotFoundException extends ApiException {
    constructor(idPublic: string) {
        super(
            `El cine con ID ${idPublic} no existe.`,
            HttpStatus.NOT_FOUND,
            "CINEMA_NOT_FOUND"
        );
    }
}
