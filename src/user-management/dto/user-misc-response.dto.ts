import { ApiProperty } from '@nestjs/swagger';
import { DataResponseSkeleton } from 'src/common/http/response-builders/data';
import { UserMiscFields } from '../classes';

export class UserMiscFieldsResponseDto extends DataResponseSkeleton<
  UserMiscFields
> {
  @ApiProperty({ example: 200 })
  readonly statusCode: number;
  @ApiProperty({ example: 'User misc details' })
  readonly message: string;
  @ApiProperty({ example: UserMiscFields })
  readonly data: UserMiscFields;
}
