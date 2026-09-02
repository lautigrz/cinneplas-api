import type { User } from "../../generated/prisma/client.js";
import type { RegisterInput } from "../contracts/auth.schemas.js";

export interface IAuthRepository {
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterInput): Promise<User>;
    findById(userPublicId: string): Promise<User | null>;
}

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");
