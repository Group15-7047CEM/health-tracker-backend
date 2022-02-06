import { ApiProperty } from '@nestjs/swagger';
import { DataResponseSkeleton } from 'src/common/http/response-builders/data';
import { User } from '../classes';

export class UserManagementResponseDto extends DataResponseSkeleton<User> {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'User Details' })
  readonly message: string;
  @ApiProperty({ example: User })
  readonly data: User;
}
