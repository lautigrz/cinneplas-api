import { HttpStatus } from "@nestjs/common";
import { ApiException } from "../../common/base/ApiException.js";

export class CinemaRoomNotFoundException extends ApiException {
    constructor(idPublic: string) {
        super(
            `La sala con ID ${idPublic} no existe.`,
            HttpStatus.NOT_FOUND,
            "CINEMA_ROOM_NOT_FOUND"
        );
    }
}
