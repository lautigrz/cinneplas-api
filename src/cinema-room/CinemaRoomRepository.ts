import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/PrismaService.js";
import type { CinemaRoomRepository as ICinemaRoomRepositoryInterface } from "./interfaces/cinema-room.repository.js";
import type { CreateCinemaRoomInput, PatchCinemaRoomInput } from "./contracts/cinema-room.schema.js";

@Injectable()
export class CinemaRoomRepository implements ICinemaRoomRepositoryInterface {
    constructor(private readonly prisma: PrismaService) { }

    async findRoomByIdPublic(idPublicRoom: string, idPublicCinema: string): Promise<{ id: number; } | null> {

        const room = await this.prisma.cinemaRoom.findFirst({
            where: {
                idPublic: idPublicRoom,
                cinema: {
                    idPublic: idPublicCinema
                }
            },
            select: {
                id: true
            }
        })
        return room;
    }

    async findCinemaByIdPublic(idPublic: string): Promise<{ id: number } | null> {
        return this.prisma.cinema.findUnique({
            where: { idPublic },
            select: { id: true }
        });
    }

    async createWithSeats(cinemaId: number, data: CreateCinemaRoomInput): Promise<any> {
        return this.prisma.cinemaRoom.create({
            data: {
                cinemaId,
                name: data.name,
                capacity: data.capacity,
                seats: {
                    create: data.seats.map((seat) => ({
                        row: seat.row,
                        number: seat.number,
                        positionX: seat.positionX,
                        positionY: seat.positionY,
                        price: seat.price,
                        isActive: seat.isActive ?? false,
                        type: seat.type,
                    })),
                },
            },
            include: {
                seats: true,
            },
        });
    }

    async findByIdPublic(idPublic: string): Promise<any | null> {
        return this.prisma.cinemaRoom.findUnique({
            where: { idPublic },
            include: {
                seats: true,
            },
        });
    }

    async updateRoom(idPublic: string, data: PatchCinemaRoomInput): Promise<any> {

        return this.prisma.$transaction(async (tx) => {
            const roomData: Record<string, any> = {};
            if (data.name !== undefined) roomData.name = data.name;
            if (data.capacity !== undefined) roomData.capacity = data.capacity;

            if (Object.keys(roomData).length > 0) {
                await tx.cinemaRoom.update({
                    where: { idPublic },
                    data: roomData,
                });
            }
            if (data.seats && data.seats.length > 0) {
                await Promise.all(
                    data.seats.map((seat) => {
                        const seatData: Record<string, any> = {};
                        if (seat.row !== undefined) seatData.row = seat.row;
                        if (seat.number !== undefined) seatData.number = seat.number;
                        if (seat.positionX !== undefined) seatData.positionX = seat.positionX;
                        if (seat.positionY !== undefined) seatData.positionY = seat.positionY;
                        if (seat.price !== undefined) seatData.price = seat.price;
                        if (seat.isActive !== undefined) seatData.isActive = seat.isActive;
                        if (seat.type !== undefined) seatData.type = seat.type;

                        return tx.seats.update({
                            where: { id: seat.id },
                            data: seatData,
                        });
                    })
                );
            }
            return tx.cinemaRoom.findUnique({
                where: { idPublic },
                include: { seats: true },
            });
        });
    }
}
