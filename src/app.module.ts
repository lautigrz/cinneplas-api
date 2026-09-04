import { Module } from '@nestjs/common';
import { AuthModule } from './auth/AuthModule.js';
import { PrismaModule } from './prisma/PrismaModule.js';
import { CinemaModule } from './cinema/CinemaModule.js';

@Module({
  imports: [PrismaModule, AuthModule, CinemaModule]
})
export class AppModule { }
