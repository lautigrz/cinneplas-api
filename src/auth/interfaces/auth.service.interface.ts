import type { RegisterInput, LoginResponse, UserProfile } from "../contracts/auth.schemas.js";
import type { AuthenticatedUser } from "../contracts/authenticated-user.js";
import type { OAuthUser } from "../contracts/auth.schemas.js";

export interface IAuthService {
    register(data: RegisterInput): Promise<UserProfile>;
    validateUser(email: string, plainPassword: string): Promise<AuthenticatedUser | null>;
    login(authenticatedUser: AuthenticatedUser): Promise<LoginResponse>;
    getMe(userPublicId: string): Promise<UserProfile>;
    oauthLogin(data: OAuthUser): Promise<LoginResponse>;
}

export const AUTH_SERVICE = Symbol("AUTH_SERVICE");