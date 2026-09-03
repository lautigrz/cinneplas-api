import { Injectable } from "@nestjs/common";
import { OAuthUser, RegisterInput } from "./contracts/auth.schemas.js";
import { IAuthRepository } from "./interfaces/auth.repository.js";
import { PrismaService } from "../prisma/PrismaService.js";
import { User } from "../generated/prisma/client.js";

@Injectable()
export class AuthRepository implements IAuthRepository {

    constructor(private readonly prisma: PrismaService) { }

    async upsertOAuthUser(data: OAuthUser): Promise<User> {
        const existingOAuth = await this.prisma.oauthAccounts.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: data.provider,
                    providerAccountId: data.providerAccountId,
                },
            },
            include: { user: true },
        });

        if (existingOAuth) {
            return existingOAuth.user;
        }

        let user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: null,
                },
            });
        }

        await this.prisma.oauthAccounts.create({
            data: {
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                userId: user.userId,
            },
        });

        return user;
    }

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