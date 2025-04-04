import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { GetMessageDTO } from './dto/get-message.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('message')
  async getMessage(@Body() body: GetMessageDTO) {
    return this.authService.getMessage(body.address);
  }

  @Post('verify')
  async verify(@Body() body: VerifySignatureDto) {
    return this.authService.verifySignature(body.address, body.signature);
  }
}
