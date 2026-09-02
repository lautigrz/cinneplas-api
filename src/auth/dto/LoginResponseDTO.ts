export class LoginResponseDTO {
    constructor(
        public readonly accessToken: string,
        public readonly user: {
            userId: string,
            name: string,
            email: string,
            role: string
        }
    ) { }
}