import { User } from "../../generated/prisma/browser.js";
import { LoginResponseDTO } from "../dto/LoginResponseDTO.js";

export type UserProfile = LoginResponseDTO['user'];

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

    /** Respuesta completa de login — incluye accessToken + perfil */
    static toLoginResponse(user: User, accessToken: string): LoginResponseDTO {
        return new LoginResponseDTO(accessToken, UserMapper.toProfile(user));
    }
}