
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ApiKeyGuard implements CanActivate{
    constructor( private readonly configService: ConfigService){}

    canActivate(ctx: ExecutionContext): boolean {
        const request = ctx.switchToHttp().getRequest();

        const apikey = request.headers['x-api-key'];
        const configuredKeys = this.configService
            .get<string>('API_KEYS', '')
            .split(',')
            .map((key) => key.trim())
            .filter(Boolean);
        
        if (typeof apikey !== 'string' || !configuredKeys.includes(apikey)) {
            throw new UnauthorizedException( 'x-api-key ausente o invalida' )
        }

        return true

    }
}