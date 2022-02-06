import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Current Password of the User.',
    example: '12345678',
    required: true,
  })
  public currentPassword: string;

  @ApiProperty({
    description: 'New Password of the User.',
    example: '12345678',
    required: true,
  })
  public newPassword: string;
}
