import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { IAuthRepository } from "./interfaces/auth.repository.js";
import { RegisterInput } from "./schemas/RegisterSchema.js";
import bcrypt from 'bcrypt';
import type { IAuthService } from "./interfaces/auth.service.interface.js";
import { UserMapper } from "./mappers/user.mapper.js";
import type { UserProfile } from "./mappers/user.mapper.js";
import { JwtService } from "@nestjs/jwt";
import { UserAlreadyExistsException } from "./exceptions/UserAlreadyExistsException.js";
import { AUTH_REPOSITORY } from "./interfaces/auth.repository.js";
import type { LoginResponseDTO } from "./dto/LoginResponseDTO.js";
import type { AuthenticatedUser } from "./dto/AuthenticatedUser.js";


@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, plainPassword: string): Promise<AuthenticatedUser | null> {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            return null;
        }
        const isMatch = this.comparePassword(plainPassword, user.password);
        if (!isMatch) {
            return null;
        }
        return {
            userPublicId: user.userPublicId,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async login(authenticatedUser: AuthenticatedUser): Promise<LoginResponseDTO> {
        const payload = {
            sub: authenticatedUser.userPublicId,
            role: authenticatedUser.role,
        };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                userId: authenticatedUser.userPublicId,
                name: authenticatedUser.name,
                email: authenticatedUser.email,
                role: authenticatedUser.role,
            },
        };
    }

    async register(data: RegisterInput): Promise<any> {
        const existing = await this.authRepository.findByEmail(data.email);
        if (existing) {
            throw new UserAlreadyExistsException(data.email);
        }
        const password = this.hashPassword(data.password);
        const userCreated = await this.authRepository.create({ ...data, password });
        return {
            userPublicId: userCreated.userPublicId,
            name: userCreated.name,
            email: userCreated.email,
            role: userCreated.role,
        };
    }

    async getMe(userPublicId: string): Promise<UserProfile> {
        const user = await this.authRepository.findById(userPublicId);
        if (!user) {
            throw new UnauthorizedException("Credenciales inválidas");
        }
        return UserMapper.toProfile(user);
    }

    private hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    private comparePassword(plain: string, hash: string): boolean {
        return bcrypt.compareSync(plain, hash);
    }
}