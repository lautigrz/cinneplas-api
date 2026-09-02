import { CinemaRoomResponseDTO } from "./CinemaRoomResponseDTO.js";

export class CinemaResponseDTO {
    constructor(
        public idPublic: string,
        public name: string,
        public address: string,
        public rooms?: CinemaRoomResponseDTO[]
    ) { }
}