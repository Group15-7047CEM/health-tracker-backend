import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: 'Email Id of the User.',
    required: true,
    example: 'patrick.bateman@yopmail.com',
  })
  public email: string;

  @ApiProperty({
    description: 'Password of the User.',
    required: true,
    example: '12345678',
  })
  public password: string;

  @ApiProperty({
    description: 'FCM token for Push notification',
    required: false,
    example: 'kttagdsdf1234234asd123124',
  })
  public fcmToken: string;
}
