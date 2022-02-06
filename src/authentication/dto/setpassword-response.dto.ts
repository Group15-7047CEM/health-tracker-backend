import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user-management/classes';

export class SetPasswordResponseDto {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'Password was set successfully' })
  readonly message: string;
  @ApiProperty({ example: User })
  readonly data: User;
}
