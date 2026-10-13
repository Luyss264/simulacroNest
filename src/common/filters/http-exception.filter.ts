import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttp ? exception.getResponse() : 'Error interno del servidor';

    const message = this.extractMessage(exceptionResponse);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractMessage(response: string | object): string | string[] {
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const val = (response as { message: unknown }).message;
      return typeof val === 'string' || Array.isArray(val) ? (val as string | string[]) : 'Error en la solicitud';
    }
    return typeof response === 'string' ? response : 'Error interno del servidor';
  }
}