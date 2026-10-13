import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../auth.types.js';

export const CurrentUser = createParamDecorator(
    (_data:unknown, ctx: ExecutionContext): AuthUser | null => {
        const request = ctx.switchToHttp().getRequest();
        return request.user
    }
)

/** este decorador espera a la peticion antes que el metodo del controlador
 * y extrae el usuario de la request
 */

