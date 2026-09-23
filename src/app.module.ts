import { Module } from '@nestjs/common';
import { AuthModule } from './auth/AuthModule.js';
import { PrismaModule } from './prisma/PrismaModule.js';
import { CinemaModule } from './cinema/CinemaModule.js';
import { CinemaRoomModule } from './cinema-room/CinemaRoomModule.js';
import { AwsModule } from './aws/AwsModule.js';
import { MovieModule } from './movie/MovieModule.js';
import { TmdbModule } from './tmdb/TmdbModule.js';
import { ShowtimeModule } from './showtime/ShowtimeModule.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CinemaModule,
    CinemaRoomModule,
    AwsModule,
    MovieModule,
    TmdbModule,
    ShowtimeModule]
})
export class AppModule { }

