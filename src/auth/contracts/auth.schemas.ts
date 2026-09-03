import { z } from "zod";
import { createZodDto } from "nestjs-zod";


export const LoginSchema = z.object({
    email: z.string().email("El email no es válido"),
    password: z.string().min(2, "La contraseña debe tener al menos 2 caracteres"),
});

export const RegisterSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("El email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});


export const UserProfileSchema = z.object({
    userId: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.string(),
});

export const LoginResponseSchema = z.object({
    accessToken: z.string(),
    user: UserProfileSchema,
});

export const RegisterResponseSchema = UserProfileSchema;


export type LoginInput = z.infer<typeof LoginSchema>;


export type RegisterInput = z.infer<typeof RegisterSchema>;


export type UserProfile = z.infer<typeof UserProfileSchema>;

export const JwtPayloadSchema = z.object({
    sub: z.string(),
    role: z.string(),
});

export const RequestUserSchema = z.object({
    userId: z.string(),
    role: z.string(),
});


export type RequestUser = z.infer<typeof RequestUserSchema>;


export type JwtPayload = z.infer<typeof JwtPayloadSchema>;


export type LoginResponse = z.infer<typeof LoginResponseSchema>;


export class LoginDto extends createZodDto(LoginSchema) { }
export class RegisterDto extends createZodDto(RegisterSchema) { }

export const OAuthUserSchema = z.object({
    email: z.string().email(),
    name: z.string(),
    provider: z.string(),
    providerAccountId: z.string(),
});

export type OAuthUser = z.infer<typeof OAuthUserSchema>;