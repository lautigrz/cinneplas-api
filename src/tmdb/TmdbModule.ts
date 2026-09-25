import { Module } from "@nestjs/common";
import { TmdbService } from "./ITmdbService.js";
import { TMDB_SERVICE } from "./interfaces/TmdbService.js";

@Module({
    imports: [
    ],
    providers: [
        { provide: TMDB_SERVICE, useClass: TmdbService }
    ],
    exports: [
        { provide: TMDB_SERVICE, useClass: TmdbService }
    ]
})
export class TmdbModule { }