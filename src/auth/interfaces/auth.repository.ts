import type { User } from "../../generated/prisma/client.js";
import type { RegisterInput, OAuthUser } from "../contracts/auth.schemas.js";

export interface IAuthRepository {
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterInput): Promise<User>;
    upsertOAuthUser(data: OAuthUser): Promise<User>;
    findById(userPublicId: string): Promise<User | null>;
}

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");
