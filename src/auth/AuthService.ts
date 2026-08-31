import { Injectable } from "@nestjs/common";
import { AuthRepository } from "./AuthRepository.js";
import { RegisterInput } from "./schemas/RegisterSchema.js";
import { LoginInput } from "./schemas/LoginSchema.js";
import bcrypt from 'bcrypt';
import type { IAuthService } from "./interfaces/auth.service.interface.js";
import { UserMapper } from "./mappers/user.mapper.js";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService implements IAuthService {
    constructor(private readonly authRepository: AuthRepository, private jwtService: JwtService) { }

    async register(data: RegisterInput): Promise<any> {

        const user = await this.authRepository.findByEmail(data.email);
        if (user) {
            throw new Error("User already exists");
        }

        const password = this.hashPassword(data.password);

        const userCreated = await this.authRepository.create({ ...data, password });

        return {
            userId: userCreated.userId,
            name: userCreated.name,
            email: userCreated.email,
            role: userCreated.role,
        };
    }

    async login(data: LoginInput): Promise<any> {
        const user = await this.authRepository.findByEmail(data.email);
        if (!user) {
            throw new Error("User not found");
        }
        const password = this.comparePassword(data.password, user.password);
        if (!password) {
            throw new Error("Invalid password");
        }

        const payload = {
            sub: user.userId,
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