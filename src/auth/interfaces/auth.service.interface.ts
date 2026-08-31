import { LoginInput } from "../schemas/LoginSchema.js";
import { RegisterInput } from "../schemas/RegisterSchema.js";

export interface IAuthService {
    register(data: RegisterInput): Promise<any>;
    login(data: LoginInput): Promise<any>;
}