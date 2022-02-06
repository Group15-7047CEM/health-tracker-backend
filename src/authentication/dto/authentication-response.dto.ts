import { ApiProperty } from '@nestjs/swagger';

import { DataResponseSkeleton } from '../../common/http/response-builders/data';
import { Authentication } from '../classes';

export class AuthenticationResponseDto extends DataResponseSkeleton<
  Authentication
> {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: Authentication })
  readonly data: Authentication;
}
