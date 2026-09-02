import { Module } from "@nestjs/common";
import { CinemaController } from "./CinemaController.js";
import { CinemaService } from "./CinemaService.js";
import { CinemaRepository } from "./CinemaRepository.js";
import { AuthModule } from "../auth/AuthModule.js";
import { CINEMA_SERVICE } from "./interfaces/cinema.service.js";
import { CINEMA_REPOSITORY } from "./interfaces/cinema.repository.js";

@Module({
    imports: [AuthModule],
    controllers: [CinemaController],
    providers: [
        { provide: CINEMA_SERVICE, useClass: CinemaService },
        { provide: CINEMA_REPOSITORY, useClass: CinemaRepository }],
    exports: [],
})

export class CinemaModule { }