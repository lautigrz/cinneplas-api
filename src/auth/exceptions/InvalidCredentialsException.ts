import { ApiException } from "../../common/base/ApiException.js";
import { HttpStatus } from "@nestjs/common";

export class InvalidCredentialsException extends ApiException {
    constructor() {
        super(
            "Invalid credentials",
            HttpStatus.UNAUTHORIZED,
            "AUTH_INVALID_CREDENTIALS"
        );
    }
}