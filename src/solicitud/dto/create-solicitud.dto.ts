import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Users } from '../../auth/users.js'

const validAsesores = Object.keys(Users).filter(key => Users[key].role === 'asesor');

export class CreateSolicitudDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  cliente: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  // campo opcional para supervisores y administradores.
  // si quien registra es asesor, el servicio ignora este valor.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  // @IsIn es un decorador que viene por defecto en la librería class-validator y sirve para validar que el valor de una propiedad exista dentro de una lista específica de opciones permitidas (un arreglo).
  @IsIn(validAsesores, { message: 'El asesor debe ser un usuario válido con rol de asesor.' })
  asesor?: string;
}