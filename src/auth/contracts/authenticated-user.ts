/**
 * Tipo interno de dominio que representa al usuario que fue validado
 * por Passport LocalStrategy. Este tipo NO es una respuesta HTTP.
 *
 * Vive aquí (contracts) porque es compartido entre:
 *   - LocalStrategy (lo produce en validate())
 *   - AuthController (lo recibe en req.user)
 *   - AuthService (lo recibe en login())
 */
export interface AuthenticatedUser {
    userPublicId: string;
    name: string;
    email: string;
    role: string;
}
