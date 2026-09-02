import { Injectable } from "@nestjs/common";
import { RegisterInput } from "./contracts/auth.schemas.js";
import { IAuthRepository } from "./interfaces/auth.repository.js";
import { PrismaService } from "../prisma/PrismaService.js";
import { User } from "../generated/prisma/client.js";

@Injectable()
export class AuthRepository implements IAuthRepository {

    constructor(private readonly prisma: PrismaService) { }

    async findById(userPublicId: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { userPublicId },
        });
    }

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