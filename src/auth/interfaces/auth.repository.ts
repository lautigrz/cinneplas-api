import type { User } from "../../generated/prisma/client.js";
import { RegisterInput } from "../schemas/RegisterSchema.js";

export interface IAuthRepository {
    findByEmail(email: string): Promise<User | null>;
    create(data: RegisterInput): Promise<User>;
}
