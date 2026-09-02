import { User } from "../../generated/prisma/browser.js";
import type { UserProfile } from "../contracts/auth.schemas.js";

export class UserMapper {

    /** Perfil público del usuario — usado en register y getMe */
    static toProfile(user: User): UserProfile {
        return {
            userId: user.userPublicId,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}