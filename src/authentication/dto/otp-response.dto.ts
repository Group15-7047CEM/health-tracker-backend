import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user-management/classes';

export class OtpResponseDto {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'Otp has been sent to phone number' })
  readonly message: string;
  @ApiProperty({ example: User })
  readonly data: User;
}
