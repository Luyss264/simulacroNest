
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { Users } from '../users.js';


/**este guard busca en nuestros datos si el usuario que viene existe en nuestra base, si lo encuentra
 * entonces edita su request y pone sus mismos datos, ya que si vino un rol que no es al actualizarlo
 * lo autenticará con el rol que es
 */
@Injectable()
export class UserGuard implements CanActivate{
    canActivate(ctx: ExecutionContext): boolean {
        const request = ctx.switchToHttp().getRequest();
        const username = request.headers['x-user'];

        if (typeof username !== 'string' || !Users[username]) {
            throw new UnauthorizedException('Usuario inexistente o no válido en x-user');
        }

        // el rol procede del servidor, nunca de la petición pues 
        request.user = Users[username];

        return true
        
    }
}