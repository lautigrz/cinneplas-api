import { Body, Controller, Get, HttpCode, Inject, Post, UseGuards } from "@nestjs/common";
import { RegisterDto } from "./dto/RegisterDto.js";
import { LoginDto } from "./dto/LoginDto.js";
import { JwtAuthGuard } from "./guards/JwtAuthGuard.js";
import { RolesGuard } from "./guards/RolesGuard.js";
import { Roles } from "./decorators/Roles.js";
import { CurrentUser } from "./decorators/CurrentUser.js";
import { AUTH_SERVICE, type IAuthService } from "./interfaces/auth.service.interface.js";

@Controller({ path: '/api/auth', version: '1' })
export class AuthController {

    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService) { }

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
    @Get('me')
    @Roles("ADMIN")
    @HttpCode(200)
    getProfile(@CurrentUser() user: any) {
        return this.authService.getMe(user.sub);
    }
}