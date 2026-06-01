import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';

class LoginDto {
  @ApiProperty()
  email!: string;

  @ApiProperty()
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'ログイン' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}