import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  mfaConfirmSchema,
  mfaDisableSchema,
  mfaVerifySchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
} from './dto/auth.schemas';
import {
  ForgotPasswordInput,
  LoginInput,
  LogoutInput,
  MfaConfirmInput,
  MfaDisableInput,
  MfaVerifyInput,
  RefreshInput,
  RegisterInput,
  ResetPasswordInput,
} from './dto/auth.schemas';
import { AuthService } from './auth.service';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Req() req: Request, @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.authService.register(body, {
      userId: 'system',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.authService.getProfile(user.sub);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  login(@Req() req: Request, @Body(new ZodValidationPipe(loginSchema)) body: LoginInput) {
    return this.authService.login(body, {
      userId: 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ medium: { limit: 20, ttl: 60000 } })
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput) {
    return this.authService.refresh(body);
  }

  @Post('logout')
  logout(@Req() req: Request, @Body(new ZodValidationPipe(logoutSchema)) body: LogoutInput) {
    const user = req.user as JwtPayload | undefined;
    return this.authService.logout(body, {
      userId: user?.sub ?? 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput,
  ) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ) {
    return this.authService.resetPassword(body);
  }

  @Post('mfa/verify')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  verifyMfa(@Req() req: Request, @Body(new ZodValidationPipe(mfaVerifySchema)) body: MfaVerifyInput) {
    return this.authService.verifyMfa(body, {
      userId: 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  enableMfa(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.authService.enableMfa(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/confirm')
  confirmMfa(@Req() req: Request, @Body(new ZodValidationPipe(mfaConfirmSchema)) body: MfaConfirmInput) {
    const user = req.user as JwtPayload;
    return this.authService.confirmMfa(user.sub, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  disableMfa(@Req() req: Request, @Body(new ZodValidationPipe(mfaDisableSchema)) body: MfaDisableInput) {
    const user = req.user as JwtPayload;
    return this.authService.disableMfa(user.sub, body);
  }
}
