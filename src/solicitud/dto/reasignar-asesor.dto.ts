import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { Users } from '../../auth/users.js';

const asesoresValidos = Object.values(Users)
  .filter((user) => user.role === 'asesor')
  .map((user) => user.username);

export class ReasignarAsesorDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(asesoresValidos, {
    message: 'El asesor debe ser un usuario válido con rol de asesor.',
  })
  asesor: string;
}
