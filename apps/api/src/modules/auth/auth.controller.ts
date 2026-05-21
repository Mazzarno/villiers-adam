import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  changePasswordSchema,
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
  ChangePasswordInput,
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

const REFRESH_COOKIE_NAME = 'va_refresh_token';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getRefreshCookieOptions(): CookieOptions {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    };
  }

  private resolveRefreshToken(req: Request, bodyToken?: string) {
    const cookieToken =
      typeof req.cookies?.[REFRESH_COOKIE_NAME] === 'string'
        ? (req.cookies[REFRESH_COOKIE_NAME] as string)
        : undefined;
    return cookieToken ?? bodyToken;
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, this.getRefreshCookieOptions());
  }

  private clearRefreshCookie(res: Response) {
    const options = this.getRefreshCookieOptions();
    res.clearCookie(REFRESH_COOKIE_NAME, {
      ...options,
      maxAge: undefined,
    });
  }

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  register(@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.authService.getProfile(user.sub);
  }

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Patch('change-password')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  changePassword(
    @Req() req: Request,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
  ) {
    const user = req.user as JwtPayload;
    return this.authService.changePassword(user.sub, body, {
      userId: user.sub,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
  ) {
    const result = await this.authService.login(body, {
      userId: 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if ('refreshToken' in result && result.refreshToken) {
      this.setRefreshCookie(res, result.refreshToken);
      const responseBody = { ...result };
      delete (responseBody as { refreshToken?: string }).refreshToken;
      return responseBody;
    }

    return result;
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @Throttle({ medium: { limit: 20, ttl: 60000 } })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(refreshSchema)) body: RefreshInput,
  ) {
    const refreshToken = this.resolveRefreshToken(req, body.refreshToken);
    const result = await this.authService.refresh({ refreshToken });
    this.setRefreshCookie(res, result.refreshToken);

    const responseBody = { ...result };
    delete (responseBody as { refreshToken?: string }).refreshToken;
    return responseBody;
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(logoutSchema)) body: LogoutInput,
  ) {
    const refreshToken = this.resolveRefreshToken(req, body.refreshToken);
    const result = await this.authService.logout({ refreshToken }, {
      userId: (req.user as JwtPayload | undefined)?.sub ?? 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    this.clearRefreshCookie(res);

    return result;
  }

  @Post('mfa/verify')
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async verifyMfa(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body(new ZodValidationPipe(mfaVerifySchema)) body: MfaVerifyInput,
  ) {
    const result = await this.authService.verifyMfa(body, {
      userId: 'unknown',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    this.setRefreshCookie(res, result.refreshToken);
    const responseBody = { ...result };
    delete (responseBody as { refreshToken?: string }).refreshToken;

    return responseBody;
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
}
