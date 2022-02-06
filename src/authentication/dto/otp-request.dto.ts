import { ApiProperty } from '@nestjs/swagger';

export class OtpRequestDto {
  @ApiProperty({
    description: 'Otp sent to the User.',
    required: true,
    example: 9876543210,
  })
  public otp: number;

  @ApiProperty({
    description: 'Phone Numer of the User.',
    required: true,
    example: '9876543210',
  })
  public phoneNumber: string;
}
