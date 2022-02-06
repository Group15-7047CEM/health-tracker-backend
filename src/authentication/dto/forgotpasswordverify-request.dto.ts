import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordVerifyRequestDto {
  @ApiProperty({
    description: 'Email of the User.',
    example: 'test@yopmail.com',
    required: true,
  })
  public email: string;
}
