import { ApiProperty } from '@nestjs/swagger';
import { userRoles } from '../enums';

export class InsertOneUserRequestDto {
  @ApiProperty({
    description: `User's first name`,
    example: 'Patrick',
    required: true,
  })
  firstName: string;

  @ApiProperty({
    description: `User's last name`,
    example: 'Bateman',
  })
  lastName: string;

  @ApiProperty({
    description: `User's Email ID`,
    example: 'patrick.bateman@yopmail.com',
    required: true,
  })
  public email: string;

  @ApiProperty({
    description: `Phone number`,
    example: '+9199345345345',
    required: true,
  })
  public phoneNumber: string;

  @ApiProperty({
    description: 'Role of the User.',
    example: 'participant',
    enum: userRoles,
    required: true,
  })
  public role: string;

  @ApiProperty({
    description: `User's Password`,
    example: '12345678',
  })
  public password: string;

  @ApiProperty({
    description: `User's profile image URL`,
    example: 'https://example.com/profile.png',
  })
  public profileImage: string;
}
