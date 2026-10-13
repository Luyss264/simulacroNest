import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

export enum EstadoSolicitud {
    PENDIENTE = 'PANDIENTE',
    EN_GESTION = 'EN_GESTION',
    RESUELTA = 'RESUELTA'
}

@Entity('solicitud')
export class Solicitud {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150 })
    cliente: string;

    @Column({ type: 'text' })
    descripcion: string;

    @Column({ type: 'varchar', length: 100 })
    asesor: string;

    @Column({
        type: 'enum',
        enum: EstadoSolicitud,
        default: EstadoSolicitud.PENDIENTE,
    })
    estado: EstadoSolicitud;

    @CreateDateColumn({ type: 'timestamptz' })
    creadaEn: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    actualizadaEn: Date;
}
