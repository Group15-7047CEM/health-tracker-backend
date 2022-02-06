import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user-management/classes';

export class ForgotPasswordVerifyResponseDto {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'Reset link has been sent to the email' })
  readonly message: string;
  @ApiProperty({ example: User })
  readonly data: User;
}
