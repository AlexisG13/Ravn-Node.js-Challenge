import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { Request } from 'express';
import { SignInDto } from './dtos/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { SignInGuard } from './guards/sign-in.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto, @Req() req: Request) {
    return this.authService.signUp(signUpDto, req);
  }

  @Get('verify')
  verifyAccount(@Query('user') userId: string) {
    return this.authService.verifyAccount(userId);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('sign-out')
  @UseGuards(AuthGuard(), SignInGuard)
  signOut(@Req() req: Request) {
    console.log('signin out');
    return this.authService.signOut(req);
  }
}
