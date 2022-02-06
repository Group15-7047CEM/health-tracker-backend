import { ApiProperty } from '@nestjs/swagger';
import { userRoles } from 'src/user-management/enums';

export class SignupRequestDto {
  @ApiProperty({
    description: 'First name of the User.',
    example: 'Patrick',
  })
  public firstName: string;

  @ApiProperty({
    description: 'Last name of the User.',
    example: 'Bateman',
  })
  public lastName: string;

  @ApiProperty({
    description: 'Email Id of the User.',
    example: 'patrick.bateman@yopmail.com',
  })
  public email: string;

  @ApiProperty({
    description: 'Phone number of the User With Country Code.',
    example: '+9192344534534',
  })
  public phoneNumber: string;

  @ApiProperty({
    description: 'Role of the User.',
    example: 'participant',
    required: true,
    enum: userRoles,
  })
  public role: string;

  @ApiProperty({
    description: 'Password of the User.',
    example: '12345678',
  })
  public password: string;
}
