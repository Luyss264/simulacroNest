import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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
  asesor?: string;
}