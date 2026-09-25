import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthRepository } from "../AuthRepository.js";
import type { OAuthUser, RegisterInput } from "../contracts/auth.schemas.js";

const USER_UUID = "00000000-0000-0000-0000-000000000001";

describe("AuthRepository", () => {
    let repository: AuthRepository;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = {
            oauthAccounts: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
        };

        repository = new AuthRepository(mockPrisma as any);
    });

    describe("upsertOAuthUser", () => {
        const oAuthData: OAuthUser = {
            provider: "google",
            providerAccountId: "google-12345",
            email: "test@example.com",
            name: "John Doe",
        };

        it("should return user if oauth account already exists", async () => {
            const existingUser = {
                userId: 1,
                userPublicId: USER_UUID,
                email: "test@example.com",
                name: "John Doe",
            };
            mockPrisma.oauthAccounts.findUnique.mockResolvedValue({
                id: 10,
                user: existingUser,
            });

            const result = await repository.upsertOAuthUser(oAuthData);

            expect(mockPrisma.oauthAccounts.findUnique).toHaveBeenCalledWith({
                where: {
                    provider_providerAccountId: {
                        provider: "google",
                        providerAccountId: "google-12345",
                    },
                },
                include: { user: true },
            });
            expect(result).toEqual(existingUser);
            expect(mockPrisma.user.create).not.toHaveBeenCalled();
            expect(mockPrisma.oauthAccounts.create).not.toHaveBeenCalled();
        });

        it("should link to existing user and create oauth account if user exists by email", async () => {
            mockPrisma.oauthAccounts.findUnique.mockResolvedValue(null);
            const existingUser = {
                userId: 2,
                userPublicId: USER_UUID,
                email: "test@example.com",
                name: "John Doe",
            };
            mockPrisma.user.findUnique.mockResolvedValue(existingUser);

            const result = await repository.upsertOAuthUser(oAuthData);

            expect(mockPrisma.user.create).not.toHaveBeenCalled();
            expect(mockPrisma.oauthAccounts.create).toHaveBeenCalledWith({
                data: {
                    provider: "google",
                    providerAccountId: "google-12345",
                    userId: 2,
                },
            });
            expect(result).toEqual(existingUser);
        });

        it("should create new user with null password and oauth account if user does not exist", async () => {
            mockPrisma.oauthAccounts.findUnique.mockResolvedValue(null);
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const newUser = {
                userId: 3,
                userPublicId: USER_UUID,
                email: "test@example.com",
                name: "John Doe",
                password: null,
            };
            mockPrisma.user.create.mockResolvedValue(newUser);

            const result = await repository.upsertOAuthUser(oAuthData);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: "John Doe",
                    email: "test@example.com",
                    password: null,
                },
            });
            expect(mockPrisma.oauthAccounts.create).toHaveBeenCalledWith({
                data: {
                    provider: "google",
                    providerAccountId: "google-12345",
                    userId: 3,
                },
            });
            expect(result).toEqual(newUser);
        });
    });

    describe("findById", () => {
        it("should return user by userPublicId", async () => {
            const user = { userId: 1, userPublicId: USER_UUID, email: "a@b.com" };
            mockPrisma.user.findUnique.mockResolvedValue(user);

            const result = await repository.findById(USER_UUID);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { userPublicId: USER_UUID },
            });
            expect(result).toEqual(user);
        });

        it("should return null if user not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await repository.findById("non-existent");

            expect(result).toBeNull();
        });
    });

    describe("findByEmail", () => {
        it("should return user by email", async () => {
            const user = { userId: 1, email: "user@domain.com" };
            mockPrisma.user.findUnique.mockResolvedValue(user);

            const result = await repository.findByEmail("user@domain.com");

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "user@domain.com" },
            });
            expect(result).toEqual(user);
        });

        it("should return null if email not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const result = await repository.findByEmail("notfound@domain.com");

            expect(result).toBeNull();
        });
    });

    describe("create", () => {
        it("should create user with registered credentials", async () => {
            const input: RegisterInput = {
                name: "Alice",
                email: "alice@example.com",
                password: "hashed_password",
            };
            const created = { userId: 1, userPublicId: USER_UUID, ...input };
            mockPrisma.user.create.mockResolvedValue(created);

            const result = await repository.create(input);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: "Alice",
                    email: "alice@example.com",
                    password: "hashed_password",
                },
            });
            expect(result).toEqual(created);
        });
    });
});
