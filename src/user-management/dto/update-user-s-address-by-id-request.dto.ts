import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserShippingAddressByIdRequestDto {
  @ApiProperty({
    description: `Address Line 1`,
    example: 'Street',
    required: true,
  })
  line_1: string;

  @ApiProperty({
    description: `Address Line 2`,
    example: 'second',
    required: false,
  })
  line_2: string;

  @ApiProperty({
    description: 'Name of the city',
    type: 'string',
    example: 'Bangalore',
    required: true,
  })
  city: string;

  @ApiProperty({
    description: 'Name of the state',
    type: 'string',
    example: 'Karnataka',
    required: true,
  })
  state: string;

  @ApiProperty({
    description: 'Area Code',
    type: 'string',
    example: '500291',
    required: true,
  })
  zipCode: string;
}
