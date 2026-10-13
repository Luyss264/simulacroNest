
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { SolicitudesDao } from './dao/solicitud.dao.js';
import { Solicitud, EstadoSolicitud } from './entities/solicitud.entity.js';
import { CreateSolicitudDto } from './dto/create-solicitud.dto.js';
import { UpdateEstadoDto } from './dto/update-solicitud.dto.js';
import { AuthUser } from '../auth/auth.types.js';

@Injectable()
export class SolicitudService {
  constructor(
    private readonly solicitudesDao: SolicitudesDao,
  ) {}

  async create(
    dto: CreateSolicitudDto,
    user: AuthUser,
  ): Promise<Solicitud> {
    // Un asesor solo puede crear solicitudes a su nombre.
    if (user.role === 'asesor') {
      if (dto.asesor && dto.asesor !== user.username) {
        throw new ForbiddenException(
          'Un asesor solo puede crear solicitudes a su nombre',
        );
      }
    }

    // Supervisor y administrador pueden asignar un asesor.
    const asesor =
      user.role === 'asesor'
        ? user.username
        : dto.asesor || user.username;

    return this.solicitudesDao.create({
      cliente: dto.cliente,
      descripcion: dto.descripcion,
      asesor,
      estado: EstadoSolicitud.PENDIENTE,
    });
  }

  async findAll(user: AuthUser): Promise<Solicitud[]> {
    // Los asesores solo consultan sus propias solicitudes.
    if (user.role === 'asesor') {
      return this.solicitudesDao.findAllByAsesor(user.username);
    }

    // Administradores y supervisores consultan todas.
    return this.solicitudesDao.findAll();
  }

  async findOne(
    id: number,
    user: AuthUser,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudesDao.findById(id);

    if (!solicitud) {
      throw new NotFoundException(
        `No existe la solicitud con ID ${id}`,
      );
    }

    // Un asesor no puede consultar solicitudes ajenas.
    if (
      user.role === 'asesor' &&
      solicitud.asesor !== user.username
    ) {
      throw new ForbiddenException(
        'No tienes permiso para consultar esta solicitud',
      );
    }

    return solicitud;
  }

  async updateEstado(
    id: number,
    dto: UpdateEstadoDto,
    user: AuthUser,
  ): Promise<Solicitud> {
    const solicitud = await this.findOne(id, user);

    // Solo se permiten estas transiciones.
    const transicionesPermitidas: Record<string, string> = {
      [EstadoSolicitud.PENDIENTE]:
        EstadoSolicitud.EN_GESTION,
      [EstadoSolicitud.EN_GESTION]:
        EstadoSolicitud.RESUELTA,
    };

    const siguienteEstado =
      transicionesPermitidas[solicitud.estado];

    if (dto.estado !== siguienteEstado) {
      throw new BadRequestException(
        `Transición de estado no permitida: ${solicitud.estado} -> ${dto.estado}`,
      );
    }

    solicitud.estado = dto.estado;

    return this.solicitudesDao.save(solicitud);
  }
}