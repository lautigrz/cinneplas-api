import { Module } from '@nestjs/common';
import { AuthRepository } from './AuthRepository.js';
import { AuthService } from './AuthService.js';
import { AuthController } from './AuthController.js';
import { JwtModule } from '@nestjs/jwt';
import "dotenv/config";
import { JwtStrategy } from './strategies/JwtStrategies.js';
import { PassportModule } from "@nestjs/passport";
import { RolesGuard } from './guards/RolesGuard.js';
import { AUTH_REPOSITORY } from './interfaces/auth.repository.js';
import { AUTH_SERVICE } from './interfaces/auth.service.interface.js';
import { LocalStrategy } from './strategies/LocalAuthStrategies.js';
@Module({
    imports: [
        PassportModule.register({
            global: true,
        }),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "15m" },
        }),
    ],
    controllers: [AuthController],
    providers: [
        { provide: AUTH_REPOSITORY, useClass: AuthRepository },
        { provide: AUTH_SERVICE, useClass: AuthService },
        JwtStrategy, RolesGuard, LocalStrategy],
    exports: [JwtStrategy, RolesGuard],
})
export class AuthModule { }