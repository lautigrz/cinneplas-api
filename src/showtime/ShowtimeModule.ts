import { Module } from "@nestjs/common";
import { MovieModule } from "../movie/MovieModule.js";
import { SHOWTIME_SERVICE } from "./interfaces/ShowtimeService.js";
import { SHOWTIME_REPOSITORY } from "./interfaces/ShowtimeRepository.js";
import { ShowtimeRepository } from "./IShowtimeRepository.js";
import { ShowtimeService } from "./IShowtimeService.js";
import { ShowtimeController } from "./ShowtimeController.js";
import { CinemaRoomModule } from "../cinema-room/CinemaRoomModule.js";

@Module({
    imports: [MovieModule, CinemaRoomModule],
    controllers: [ShowtimeController],
    providers: [
        { provide: SHOWTIME_SERVICE, useClass: ShowtimeService },
        { provide: SHOWTIME_REPOSITORY, useClass: ShowtimeRepository },
    ],
    exports: [
        { provide: SHOWTIME_SERVICE, useClass: ShowtimeService },
    ]
})
export class ShowtimeModule { }