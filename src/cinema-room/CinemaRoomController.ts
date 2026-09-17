import { Body, Controller, Get, HttpCode, Inject, NotFoundException, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CINEMA_ROOM_SERVICE, type ICinemaRoomService } from "./interfaces/cinema-room.service.js";
import { JwtAuthGuard } from "../auth/guards/JwtAuthGuard.js";
import { RolesGuard } from "../auth/guards/RolesGuard.js";
import { Roles } from "../auth/decorators/Roles.js";
import { CreateCinemaRoomDto, PatchCinemaRoomDto } from "./contracts/cinema-room.schema.js";

@Controller({ path: "/api/cinema-rooms" })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CinemaRoomController {
    constructor(
        @Inject(CINEMA_ROOM_SERVICE)
        private readonly cinemaRoomService: ICinemaRoomService
    ) { }

    @Post()
    @Roles("ADMIN")
    @HttpCode(201)
    async create(@Body() data: CreateCinemaRoomDto) {
        return this.cinemaRoomService.createRoomWithSeats(data);
    }

    @Get(":id")
    @HttpCode(200)
    async getById(@Param("id") id: string) {
        const room = await this.cinemaRoomService.getRoomByIdPublic(id);
        if (!room) {
            throw new NotFoundException(`Sala con ID ${id} no encontrada.`);
        }
        return room;
    }

    @Patch(":id")
    @Roles("ADMIN")
    @HttpCode(200)
    async update(@Param("id") id: string, @Body() data: PatchCinemaRoomDto) {
        return this.cinemaRoomService.updateRoom(id, data);
    }
}
