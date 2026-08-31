import { Module } from '@nestjs/common';
import { AuthRepository } from './AuthRepository.js';
import { AuthService } from './AuthService.js';
import { AuthController } from './AuthController.js';
import { JwtModule } from '@nestjs/jwt';
import "dotenv/config";
import { JwtStrategy } from './strategies/JwtStrategies.js';
import { PassportModule } from "@nestjs/passport";
import { RolesGuard } from './guards/RolesGuard.js';
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
    providers: [AuthRepository, AuthService, JwtStrategy, RolesGuard],
    exports: [AuthRepository, AuthService],
})
export class AuthModule { }