
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Solicitud } from '../entities/solicitud.entity.js';
import {
  SolicitudHistorial,
  TipoEventoSolicitud,
} from '../entities/solicitud-historial.entity.js';
import { QuerySolicitudesDto } from '../dto/query-solicitudes.dto.js';

@Injectable()
export class SolicitudesDao {
  constructor(
    @InjectRepository(Solicitud)
    private readonly repository: Repository<Solicitud>,
  ) {}

  async create(
    data: Partial<Solicitud>,
    usuarioActor: string,
  ): Promise<Solicitud> {
    return this.repository.manager.transaction(async (manager) => {
      const solicitud = await manager.save(this.repository.create(data));

      await manager.getRepository(SolicitudHistorial).save({
        solicitudId: solicitud.id,
        tipoEvento: TipoEventoSolicitud.CREACION,
        valorAnterior: null,
        valorNuevo: solicitud.estado,
        usuarioActor,
      });

      return solicitud;
    });
  }

  async findAll(
    filtros: QuerySolicitudesDto,
  ): Promise<{ data: Solicitud[]; total: number }> {
    const consulta = this.repository
      .createQueryBuilder('solicitud')
      .orderBy('solicitud.creadaEn', 'DESC')
      .skip((filtros.page - 1) * filtros.limit)
      .take(filtros.limit);

    if (filtros.estado) {
      consulta.andWhere('solicitud.estado = :estado', {
        estado: filtros.estado,
      });
    }

    if (filtros.asesor) {
      consulta.andWhere('solicitud.asesor = :asesor', {
        asesor: filtros.asesor,
      });
    }

    if (filtros.cliente) {
      consulta.andWhere('LOWER(solicitud.cliente) LIKE LOWER(:cliente)', {
        cliente: `%${filtros.cliente}%`,
      });
    }

    if (filtros.desde) {
      consulta.andWhere('solicitud.creadaEn >= :desde', {
        desde: filtros.desde,
      });
    }

    if (filtros.hasta) {
      consulta.andWhere('solicitud.creadaEn <= :hasta', {
        hasta: filtros.hasta,
      });
    }

    const [data, total] = await consulta.getManyAndCount();
    return { data, total };
  }

  async findById(id: number): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async save(solicitud: Solicitud): Promise<Solicitud> {
    return this.repository.save(solicitud);
  }

  async actualizarEstadoConHistorial(
    solicitud: Solicitud,
    estadoAnterior: string,
    usuarioActor: string,
  ): Promise<Solicitud> {
    return this.repository.manager.transaction(async (manager) => {
      const actualizada = await manager.save(solicitud);
      await manager.getRepository(SolicitudHistorial).save({
        solicitudId: solicitud.id,
        tipoEvento: TipoEventoSolicitud.ESTADO,
        valorAnterior: estadoAnterior,
        valorNuevo: solicitud.estado,
        usuarioActor,
      });
      return actualizada;
    });
  }

  async reasignarAsesor(
    solicitud: Solicitud,
    asesor: string,
    usuarioActor: string,
  ): Promise<Solicitud> {
    
    const asesorAnterior = solicitud.asesor;
    solicitud.asesor = asesor;

    return this.repository.manager.transaction(async (manager) => {
      const actualizada = await manager.save(solicitud);
      await manager.getRepository(SolicitudHistorial).save({
        solicitudId: solicitud.id,
        tipoEvento: TipoEventoSolicitud.ASIGNACION,
        valorAnterior: asesorAnterior,
        valorNuevo: asesor,
        usuarioActor,
      });
      return actualizada;
    });
  }

  async findHistorialBySolicitudId(
    solicitudId: number,
  ): Promise<SolicitudHistorial[]> {
    return this.repository.manager.getRepository(SolicitudHistorial).find({
      where: { solicitudId },
      order: { fechaEvento: 'DESC' },
    });
  }
}
