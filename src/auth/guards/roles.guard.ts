import { CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator.js'
import { UserRole } from '../auth.types.js'

/**este guard verifica que los roles sean validos, aun no si pertenecen a ese usuario
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector){}
    
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        
        // si el endpoint no declara roles especificos cualquier usuario ya validado puede continuar
        if ( !requiredRoles || requiredRoles.length === 0){
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user || !requiredRoles.includes(user.role)){
            throw new ForbiddenException('no tienes permisos para realizar esta operación')
        }

        return true

    }

}