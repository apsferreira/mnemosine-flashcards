import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

/**
 * NestJS concept: Guard
 *
 * Guards decide whether a request should be handled by the route handler.
 * They implement CanActivate and return true (allow) or false/throw (deny).
 *
 * This guard validates the Bearer JWT in the Authorization header.
 * It's applied with @UseGuards(JwtAuthGuard) on controllers or methods.
 *
 * TODO (aprenda): adicione um decorator @Public() para marcar rotas que
 * não precisam de autenticação (ex: GET /health), usando Reflector.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);

    if (!token) throw new UnauthorizedException('Token não fornecido');

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Attach user payload to request for downstream use
      (request as Request & { user: unknown }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
