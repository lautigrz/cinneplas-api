import { createZodDto } from "nestjs-zod";
import { RegisterSchema } from "../schemas/RegisterSchema.js";

export class RegisterDto extends createZodDto(RegisterSchema) { }