import { ApiProperty } from '@nestjs/swagger';

import { UsersWithCount } from '../classes';
import { DataResponseSkeleton } from 'src/common/http/response-builders/data';

export class UsersWithCountResponseDto extends DataResponseSkeleton<
  UsersWithCount
> {
  @ApiProperty({ example: 200 })
  readonly statusCode: number;

  @ApiProperty({ example: UsersWithCount })
  readonly data: UsersWithCount;

  @ApiProperty({ example: 'List of users' })
  readonly message: string;
}
