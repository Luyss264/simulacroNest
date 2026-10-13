import { Module } from '@nestjs/common';
import { SolicitudService } from './solicitud.service.js';
import { SolicitudesController } from './solicitud.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity.js';
import { SolicitudHistorial } from './entities/solicitud-historial.entity.js';
import { SolicitudesDao } from './dao/solicitud.dao.js';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud, SolicitudHistorial])],
  controllers: [SolicitudesController],
  providers: [SolicitudService, SolicitudesDao],
  exports: [SolicitudService]
})
export class SolicitudModule {}
