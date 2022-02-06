import { ApiProperty } from '@nestjs/swagger';
import { DataResponseSkeleton } from 'src/common/http/response-builders/data';
import { UserShippingAddress } from '../classes';

export class UserShippingAddressResponseDto extends DataResponseSkeleton<
  UserShippingAddress
> {
  @ApiProperty({ example: 200 })
  readonly statusCode: number;
  @ApiProperty({ example: 'User Details' })
  readonly message: string;
  @ApiProperty({ example: UserShippingAddress })
  readonly data: UserShippingAddress;
}
