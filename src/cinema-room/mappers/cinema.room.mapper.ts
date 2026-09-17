import type { CinemaRoomResponse, SeatResponse } from "../contracts/cinema-room.schema.js";

type PrismaSeat = {
    id?: number;
    row: string;
    number: number;
    positionX: number;
    positionY: number;
    price: any;
    isActive: boolean;
    type: string;
};

type PrismaCinemaRoomWithSeats = {
    idPublic: string;
    name: string;
    capacity: number;
    seats: PrismaSeat[];
};

export class CinemaRoomMapper {
    static toResponse(room: PrismaCinemaRoomWithSeats): CinemaRoomResponse {
        return {
            idPublic: room.idPublic,
            name: room.name,
            capacity: room.capacity,
            seats: room.seats.map((seat): SeatResponse => ({
                id: seat.id,
                row: seat.row,
                number: seat.number,
                positionX: seat.positionX,
                positionY: seat.positionY,
                price: Number(seat.price),
                isActive: seat.isActive,
                type: seat.type as SeatResponse["type"],
            })),
        };
    }
}