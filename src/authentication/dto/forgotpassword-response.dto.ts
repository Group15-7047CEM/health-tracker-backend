import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user-management/classes';

export class ForgotPasswordResponseDto {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'Password was updated successfully' })
  readonly message: string;
  @ApiProperty({ example: User })
  readonly data: User;
}
