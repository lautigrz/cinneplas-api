import { z } from "zod";
import { createZodDto } from "nestjs-zod";

// ─── Input Schemas ────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
    email: z.string().email("El email no es válido"),
    password: z.string().min(2, "La contraseña debe tener al menos 2 caracteres"),
});

export const RegisterSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().email("El email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// ─── Output Schemas ───────────────────────────────────────────────────────────

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

// ─── Inferred Types ───────────────────────────────────────────────────────────

/** Cuerpo de la petición POST /auth/login */
export type LoginInput = z.infer<typeof LoginSchema>;

/** Cuerpo de la petición POST /auth/register */
export type RegisterInput = z.infer<typeof RegisterSchema>;

/** Perfil público del usuario (respuesta de GET /auth/me y POST /auth/register) */
export type UserProfile = z.infer<typeof UserProfileSchema>;

/** Respuesta de POST /auth/login */
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ─── NestJS DTOs (solo para validación de cuerpos HTTP de entrada) ────────────

/** DTO para el cuerpo de POST /auth/login — valida y parsea con Zod via nestjs-zod */
export class LoginDto extends createZodDto(LoginSchema) {}

/** DTO para el cuerpo de POST /auth/register — valida y parsea con Zod via nestjs-zod */
export class RegisterDto extends createZodDto(RegisterSchema) {}
