
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Solicitud } from '../entities/solicitud.entity.js';

@Injectable()
export class SolicitudesDao {
  constructor(
    @InjectRepository(Solicitud)
    private readonly repository: Repository<Solicitud>,
  ) {}

  async create(data: Partial<Solicitud>): Promise<Solicitud> {
    const solicitud = this.repository.create(data);
    return this.repository.save(solicitud);
  }

  async findAll(): Promise<Solicitud[]> {
    return this.repository.find({
      order: { creadaEn: 'DESC' },
    });
  }

  async findAllByAsesor(asesor: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: { asesor },
      order: { creadaEn: 'DESC' },
    });
  }

  async findById(id: number): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async save(solicitud: Solicitud): Promise<Solicitud> {
    return this.repository.save(solicitud);
  }
}