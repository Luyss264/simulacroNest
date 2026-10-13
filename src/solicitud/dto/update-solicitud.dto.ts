import { IsEnum } from 'class-validator';
import { EstadoSolicitud } from '../entities/solicitud.entity.js';

export class UpdateEstadoDto {
  @IsEnum(EstadoSolicitud, {
    message:
      'El estado debe ser PENDIENTE, EN_GESTION o RESUELTA',
  })
  estado: EstadoSolicitud;
}
