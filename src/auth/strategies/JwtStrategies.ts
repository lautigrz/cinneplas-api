import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { type RequestUser, JwtPayloadSchema } from "../contracts/auth.schemas.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET!,
        });
    }

    async validate(payload: unknown): Promise<RequestUser> {
        const { sub, role } = JwtPayloadSchema.parse(payload);
        return {
            userId: sub,
            role,
        };
    }
}