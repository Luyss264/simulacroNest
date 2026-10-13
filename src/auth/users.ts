import { AuthUser } from './auth.types.js'

export const Users: Record<string, AuthUser> = {
    admin1: {
        username: 'admin1',
        role: 'admin',
    },
    supervisor1: {
        username: 'supervisor1',
        role: 'supervisor',
    },
    asesor1: {
        username: 'asesor1',
        role: 'asesor'
    },
    asesor2: {
        username: 'asesor2',
        role: 'asesor'
    }
}