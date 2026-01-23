import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { mfaEnabled?: boolean; mfa?: boolean } | undefined;

    if (!user) {
      throw new ForbiddenException('MFA validation required');
    }

    if (user.mfaEnabled && !user.mfa) {
      throw new ForbiddenException('MFA validation required');
    }

    return true;
  }
}
