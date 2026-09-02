import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { IAuthRepository } from "./interfaces/auth.repository.js";
import { RegisterInput } from "./schemas/RegisterSchema.js";
import { LoginInput } from "./schemas/LoginSchema.js";
import bcrypt from 'bcrypt';
import type { IAuthService } from "./interfaces/auth.service.interface.js";
import { UserMapper } from "./mappers/user.mapper.js";
import { JwtService } from "@nestjs/jwt";
import { UserAlreadyExistsException } from "./exceptions/UserAlreadyExistsException.js";
import { InvalidCredentialsException } from "./exceptions/InvalidCredentialsException.js";
import { AUTH_REPOSITORY } from "./interfaces/auth.repository.js";


@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(AUTH_REPOSITORY)
        private readonly authRepository: IAuthRepository, private jwtService: JwtService) { }

    async getMe(userPublicId: string): Promise<any> {
        const user = await this.authRepository.findById(userPublicId);
        if (!user) {
            throw new UnauthorizedException("Credenciales inválidas");
        }
        return UserMapper.toResponse(user);
    }

    async register(data: RegisterInput): Promise<any> {

        const user = await this.authRepository.findByEmail(data.email);
        if (user) {
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

    async login(data: LoginInput): Promise<any> {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user) {
            throw new InvalidCredentialsException();
        }
        const password = this.comparePassword(data.password, user.password);
        if (!password) {
            throw new InvalidCredentialsException();
        }

        const payload = {
            sub: user.userPublicId,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: UserMapper.toResponse(user),
        };
    }


    private hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }

    private comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }
}