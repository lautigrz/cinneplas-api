import { RegisterInput } from "../schemas/RegisterSchema.js";
import type { LoginResponseDTO } from "../dto/LoginResponseDTO.js";
import type { UserProfile } from "../mappers/user.mapper.js";
import type { AuthenticatedUser } from "../dto/AuthenticatedUser.js";

export interface IAuthService {
    register(data: RegisterInput): Promise<any>;
    validateUser(email: string, plainPassword: string): Promise<AuthenticatedUser | null>;
    login(authenticatedUser: AuthenticatedUser): Promise<LoginResponseDTO>;
    getMe(userPublicId: string): Promise<UserProfile>;
}

export const AUTH_SERVICE = Symbol("AUTH_SERVICE");