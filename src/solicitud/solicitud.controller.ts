import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthUser } from '../auth/auth.types.js';

import { CreateSolicitudDto } from './dto/create-solicitud.dto.js';
import { UpdateEstadoDto } from './dto/update-solicitud.dto.js';
import { ReasignarAsesorDto } from './dto/reasignar-asesor.dto.js';
import { QuerySolicitudesDto } from './dto/query-solicitudes.dto.js';
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
  @Roles('admin', 'asesor')
  @ApiOperation({
    summary: 'Create a commercial request',
    description:
      'Any user with role **admin** or **asesor** can create a request. ' +
      'If the caller is an advisor the `asesor` field is auto-filled. ' +
      'Admins may optionally assign the request to a specific advisor.',
  })
  @ApiBody({
    description: 'Payload to create a new commercial request',
    examples: {
      asesor_creates: {
        summary: 'Advisor creates their own request (no asesor field needed)',
        value: {
          cliente: 'Acme Ltd.',
          descripcion: 'Prepare a commercial proposal for Q4.',
        },
      },
      admin_assigns: {
        summary: 'Admin creates and assigns a request to a specific advisor',
        value: {
          cliente: 'Globex Corp.',
          descripcion: 'Follow up on contract renewal.',
          asesor: 'asesor1',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed — invalid fields' })
  @ApiResponse({ status: 403, description: 'Forbidden — role not allowed' })
  create(
    @Body() dto: CreateSolicitudDto,
    @CurrentUser() user: AuthUser
  ) {
    if (!dto.asesor && user.role === 'asesor'){
      dto.asesor = user.username
    }
    return this.solicitudesService.create(dto, user);
  }

  @Get()
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({
    summary: 'List commercial requests',
    description:
      'Returns requests visible to the caller based on their role. ' +
      '**Advisors** see only their own requests. ' +
      '**Supervisors** and **admins** see all requests. ' +
      'All query params are optional.',
  })
  @ApiQuery({ name: 'estado', required: false, enum: ['PENDIENTE', 'EN_GESTION', 'RESUELTA'], example: 'PENDIENTE' })
  @ApiQuery({ name: 'asesor', required: false, example: 'asesor1' })
  @ApiQuery({ name: 'cliente', required: false, example: 'Acme Ltd.' })
  @ApiQuery({ name: 'desde', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'hasta', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of requests' })
  @ApiResponse({ status: 403, description: 'Forbidden — role not allowed' })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() filtros: QuerySolicitudesDto,
  ) {
    return this.solicitudesService.findAll(user, filtros);
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'asesor')
  @ApiOperation({
    summary: 'Get a single request by ID',
    description:
      'Advisors can only retrieve their own requests. ' +
      'Supervisors and admins can access any request.',
  })
  @ApiResponse({ status: 200, description: 'Request found' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — access denied' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.solicitudesService.findOne(id, user);
  }

  @Get(':id/historial')
  @Roles('admin', 'supervisor')
  @ApiOperation({
    summary: 'Get the status-change history of a request',
    description:
      'Returns every estado transition recorded for the request. ' +
      'Only **admin** and **supervisor** roles are allowed.',
  })
  @ApiResponse({ status: 200, description: 'History entries returned' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — role not allowed' })
  findHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudesService.findHistorial(id);
  }

  @Patch(':id/estado')
  @Roles('admin', 'supervisor')
  @ApiOperation({
    summary: 'Update the status of a request',
    description:
      'Allowed transitions: **PENDIENTE → EN_GESTION → RESUELTA**. ' +
      'Only **admin** and **supervisor** roles can change the status.',
  })
  @ApiBody({
    description: 'New status for the request',
    examples: {
      en_gestion: {
        summary: 'Move from PENDIENTE to EN_GESTION',
        value: { estado: 'EN_GESTION' },
      },
      resuelta: {
        summary: 'Move from EN_GESTION to RESUELTA',
        value: { estado: 'RESUELTA' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  @ApiResponse({ status: 403, description: 'Forbidden — role not allowed' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.solicitudesService.updateEstado(id, dto, user);
  }

  @Patch(':id/asesor')
  @Roles('admin', 'supervisor')
  @ApiOperation({
    summary: 'Reassign the advisor of a request',
    description:
      'Changes the advisor assigned to a request. ' +
      'Cannot reassign a request with status **RESUELTA**. ' +
      'Valid advisors: `asesor1`, `asesor2`.',
  })
  @ApiBody({
    description: 'Username of the new advisor to assign',
    examples: {
      reassign_asesor1: {
        summary: 'Assign request to asesor1',
        value: { asesor: 'asesor1' },
      },
      reassign_asesor2: {
        summary: 'Assign request to asesor2',
        value: { asesor: 'asesor2' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Advisor reassigned successfully' })
  @ApiResponse({ status: 400, description: 'Cannot reassign a resolved request' })
  @ApiResponse({ status: 403, description: 'Forbidden — role not allowed' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  reasignarAsesor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReasignarAsesorDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.solicitudesService.reasignarAsesor(id, dto, user);
  }
}
