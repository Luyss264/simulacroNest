import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Solicitud } from './solicitud.entity.js';

export enum TipoEventoSolicitud {
  CREACION = 'CREACION',
  ESTADO = 'ESTADO',
  ASIGNACION = 'ASIGNACION',
}

@Entity('solicitud_historial')
export class SolicitudHistorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  solicitudId: number;

  @ManyToOne(() => Solicitud, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'solicitudId' })
  solicitud: Solicitud;

  @Column({ type: 'enum', enum: TipoEventoSolicitud })
  tipoEvento: TipoEventoSolicitud;

  @Column({ type: 'varchar', nullable: true })
  valorAnterior: string | null;

  @Column({ type: 'varchar', nullable: true })
  valorNuevo: string | null;

  @Column()
  usuarioActor: string;

  @CreateDateColumn({ type: 'timestamptz' })
  fechaEvento: Date;
}
