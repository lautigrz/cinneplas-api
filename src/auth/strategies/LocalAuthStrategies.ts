import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AUTH_SERVICE, type IAuthService } from "../interfaces/auth.service.interface.js";
import type { AuthenticatedUser } from "../contracts/authenticated-user.js";
import { InvalidCredentialsException } from "../exceptions/InvalidCredentialsException.js";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService
    ) { super({ usernameField: "email", passwordField: "password" }) }

    async validate(email: string, password: string): Promise<AuthenticatedUser> {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new InvalidCredentialsException();
        }
        return user;
    }
}
