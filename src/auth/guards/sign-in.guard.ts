import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SignInGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    const blackListedToken = await this.prisma.jwtBlackList.findMany({
      where: { jwt: token },
    });
    if (blackListedToken.length !== 0) return false;
    return true;
  }
}
