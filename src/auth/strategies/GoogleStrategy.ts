import dotenv from "dotenv";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { VerifiedCallback } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { OAuthUser } from "../contracts/auth.schemas.js";

dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {

    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['email', 'profile'],
        });
    }

    validate(acessToken: string, refreshToken: string, profile: any, done: VerifiedCallback): void {
        console.log("access token: ", acessToken);
        console.log("refresh token: ", refreshToken);
        console.log("profile: ", profile);

        const { _json: { email }, provider, id, displayName } = profile;
        const name = displayName || profile._json?.name || profile._json?.given_name || 'Google User';
        const user: OAuthUser = {
            email,
            name,
            provider,
            providerAccountId: id,
        };

        done(null, user);
    }
}