import { Controller, Get, HttpCode, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { Body } from "@nestjs/common";
import { RegisterDto, type RequestUser } from "./contracts/auth.schemas.js";
import { JwtAuthGuard } from "./guards/JwtAuthGuard.js";
import { RolesGuard } from "./guards/RolesGuard.js";
import { Roles } from "./decorators/Roles.js";
import { CurrentUser } from "./decorators/CurrentUser.js";
import { AUTH_SERVICE, type IAuthService } from "./interfaces/auth.service.interface.js";
import { LocalAuthGuard } from "./guards/LocalAuthGuard.js";
import type { AuthenticatedUser } from "./contracts/authenticated-user.js";
import { GoogleAuthGuard } from "./guards/GoogleAuthGuard.js";

@Controller({ path: '/api/auth', version: '1' })
export class AuthController {

    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService) { }


    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(200)
    async login(@Req() req: Request & { user: AuthenticatedUser }) {
        return this.authService.login(req.user);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
        return { message: 'Google login' };
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleLoginCallback(@Req() req: any) {
        console.log(req?.user);
        //return this.authService.login(user);
    }


    @Post('register')
    @HttpCode(201)
    async register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('me')
    @Roles("ADMIN")
    @HttpCode(200)
    getProfile(@CurrentUser() user: RequestUser) {
        return this.authService.getMe(user.userId);
    }
}