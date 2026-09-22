import { Module } from "@nestjs/common";
import { ITmdbService } from "./ITmdbService.js";
import { TMDB_SERVICE } from "./interfaces/TmdbService.js";

@Module({
    imports: [
    ],
    providers: [
        { provide: TMDB_SERVICE, useClass: ITmdbService }
    ],
    exports: [
        { provide: TMDB_SERVICE, useClass: ITmdbService }
    ]
})
export class TmdbModule { }