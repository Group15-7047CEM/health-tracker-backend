import { ApiProperty } from '@nestjs/swagger';

export class LogoutRequestDto {
  @ApiProperty({
    description: 'FCM token to remove',
    required: false,
    example: 'kttagdsdf1234234asd123124',
  })
  public fcmToken: string;
}
