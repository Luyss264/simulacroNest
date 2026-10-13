import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';

import { CreateSolicitudDto } from './dto/create-solicitud.dto.js';
import { UpdateEstadoDto } from './dto/update-solicitud.dto.js';
import { SolicitudService } from './solicitud.service.js';

@ApiTags('Solicitudes')
@ApiSecurity('api-key')
@ApiHeader({
  name: 'x-user',
  description: 'Usuario de prueba: admin1, supervisor1, asesor1 o asesor2',
  required: true,
})
@Controller('solicitudes')
export class SolicitudesController {
  constructor(
    private readonly solicitudesService: SolicitudService,
  ) {}

  @Post()
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({ summary: 'Registrar una solicitud comercial' })
  @ApiResponse({ status: 201, description: 'Solicitud registrada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @Body() dto: CreateSolicitudDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.solicitudesService.create(dto, user);
  }

  @Get()
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({
    summary: 'Listar solicitudes según los permisos del usuario',
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  findAll(@CurrentUser() user: AuthUser) {
    return this.solicitudesService.findAll(user);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({ summary: 'Consultar una solicitud individual' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitud inexistente' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.solicitudesService.findOne(id, user);
  }

  @Patch(':id/estado')
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({ summary: 'Cambiar el estado de una solicitud' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado no permitida',
  })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.solicitudesService.updateEstado(id, dto, user);
  }
}