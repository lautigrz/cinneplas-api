import { Injectable } from "@nestjs/common";
import { RegisterInput } from "./schemas/RegisterSchema.js";
import { IAuthRepository } from "./interfaces/auth.repository.js";
import { User } from "../generated/prisma/browser.js";
import { PrismaService } from "../prisma/PrismaService.js";

@Injectable()
export class AuthRepository implements IAuthRepository {

    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(data: RegisterInput): Promise<User> {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
            },
        });
    }

}