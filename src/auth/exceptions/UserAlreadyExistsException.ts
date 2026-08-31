import { HttpStatus } from "@nestjs/common";
import { ApiException } from "../../common/base/ApiException.js";

export class UserAlreadyExistsException extends ApiException {
    constructor(email: string) {
        super(
            `El usuario con el email ${email} ya existe.`,
            HttpStatus.CONFLICT,
            "AUTH_USER_ALREADY_EXISTS"
        );
    }
}