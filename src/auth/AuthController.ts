import { Controller, Get, HttpCode, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { RegisterDto } from "./dto/RegisterDto.js";
import { JwtAuthGuard } from "./guards/JwtAuthGuard.js";
import { RolesGuard } from "./guards/RolesGuard.js";
import { Roles } from "./decorators/Roles.js";
import { CurrentUser } from "./decorators/CurrentUser.js";
import { AUTH_SERVICE, type IAuthService } from "./interfaces/auth.service.interface.js";
import { LocalAuthGuard } from "./guards/LocalAuthGuard.js";
import type { AuthenticatedUser } from "./dto/AuthenticatedUser.js";
import type { Request } from "express";

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
    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    async login(@Req() req: Request & { user: AuthenticatedUser }) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('me')
    @Roles("ADMIN")
    @HttpCode(200)
    getProfile(@CurrentUser() user: any) {
        return this.authService.getMe(user.sub);
    }
}