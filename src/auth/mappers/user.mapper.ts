import { User } from "../../generated/prisma/browser.js";

export class UserMapper {
    static toResponse(user: User) {
        return {
            userId: user.userPublicId,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}