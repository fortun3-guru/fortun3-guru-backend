import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetMessageDTO {
  @ApiProperty({ example: '0x2aaA638A1b01D0F4632824F31cC8c81505E4259A' })
  @IsNotEmpty()
  @IsString()
  address: string;
}
