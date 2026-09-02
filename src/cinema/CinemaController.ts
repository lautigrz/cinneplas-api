import { Body, Controller, Get, HttpCode, Inject, Post } from "@nestjs/common";
import { CINEMA_SERVICE, type ICinemaService } from "./interfaces/cinema.service.js";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/JwtAuthGuard.js";
import type { CreateCinemaInput } from "./schema/CinemaSchema.js";
import { Roles } from "../auth/decorators/Roles.js";
import { RolesGuard } from "../auth/guards/RolesGuard.js";

@Controller({ path: "/api/cinemas", version: "1" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CinemaController {
    constructor(
        @Inject(CINEMA_SERVICE)
        private readonly cinemaService: ICinemaService
    ) { }

    @Post()
    @Roles("ADMIN")
    @HttpCode(201)
    async create(@Body() data: CreateCinemaInput) {
        return this.cinemaService.create(data);
    }

    @Get()
    @Roles("ADMIN")
    @HttpCode(200)
    async getAll() {
        return this.cinemaService.findAll();
    }

}