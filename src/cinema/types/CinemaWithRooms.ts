import type { Prisma } from "../../generated/prisma/client.js";

export type CinemaWithRooms = Prisma.CinemaGetPayload<{
    include: {
        rooms: {
            select: {
                name: true,
                capacity: true
            }
        }
    }
}>;