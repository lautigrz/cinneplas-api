import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/AuthModule.js";
import { CinemaRoomController } from "./CinemaRoomController.js";
import { CinemaRoomService } from "./CinemaRoomService.js";
import { CinemaRoomRepository } from "./CinemaRoomRepository.js";
import { CINEMA_ROOM_SERVICE } from "./interfaces/cinema-room.service.js";
import { CINEMA_ROOM_REPOSITORY } from "./interfaces/cinema-room.repository.js";

@Module({
    imports: [AuthModule],
    controllers: [CinemaRoomController],
    providers: [
        { provide: CINEMA_ROOM_SERVICE, useClass: CinemaRoomService },
        { provide: CINEMA_ROOM_REPOSITORY, useClass: CinemaRoomRepository },
    ],
    exports: [CINEMA_ROOM_SERVICE],
})
export class CinemaRoomModule { }
