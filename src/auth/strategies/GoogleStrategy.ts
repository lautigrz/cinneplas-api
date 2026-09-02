import dotenv from "dotenv";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { VerifiedCallback } from "passport-jwt";
import { Injectable } from "@nestjs/common";

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

    validate(acessToken: string, profile: any, done: VerifiedCallback): void {

        console.log("access token: ", acessToken);
        console.log("profile: ", profile);

        const { name, emails } = profile;
        const user = {
            email: emails[0].value,
            name: name.displayName,

        };

        done(null, user);
    }
}