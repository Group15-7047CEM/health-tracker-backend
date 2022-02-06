import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpRequestDto {
  @ApiProperty({
    description: 'Phone Number of the User.',
    required: true,
    example: '9876543210',
  })
  public phoneNumber: string;
}
