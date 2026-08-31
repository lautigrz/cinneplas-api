import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./AuthService.js";
import { RegisterDto } from "./dto/RegisterDto.js";
import { LoginDto } from "./dto/LoginDto.js";
import { JwtAuthGuard } from "./guards/JwtAuthGuard.js";
import { RolesGuard } from "./guards/RolesGuard.js";
import { Roles } from "./decorators/Roles.js";
import { CurrentUser } from "./decorators/CurrentUser.js";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(201)
    async register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() data: LoginDto) {
        return this.authService.login(data);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('profile')
    @Roles("user")
    @HttpCode(200)
    getProfile(@CurrentUser("sub") user: any) {
        return { "texto": "protegido", user };
    }
}