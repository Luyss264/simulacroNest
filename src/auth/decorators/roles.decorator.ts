import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../auth.types.js';

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
/**
 * aqui le estoy diciendo a nest que cree un decorador llamado
 * roles, que se podrá usar en los controladores,
 * funciona así:
 * el decorador recibe un arreglo de roles, y los guarda en la metadata,
 * luego en el guard se puede acceder a esa metadata y verificar si el usuario tiene el rol
 * SetMetadata guarda con la clave ROLES_KEY y el valor roles, que es un arreglo de roles
 */



