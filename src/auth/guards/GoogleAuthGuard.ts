import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { access } from "fs";

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    constructor() {
        super({
            accessType: 'offline',
        }
        );
    }
}