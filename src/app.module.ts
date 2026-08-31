import { Module } from '@nestjs/common';
import { AuthModule } from './auth/AuthModule.js';
import { PrismaModule } from './prisma/PrismaModule.js';

@Module({
  imports: [PrismaModule, AuthModule]
})
export class AppModule { }
