import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ example: 201 })
  readonly statusCode: number;
  @ApiProperty({ example: 'User logged out successfully' })
  readonly message: string;
  @ApiProperty({ example: {} })
  readonly data: any;
}
