import { createZodDto } from "nestjs-zod";
import { LoginSchema } from "../schemas/LoginSchema.js";

export class LoginDto extends createZodDto(LoginSchema) { }