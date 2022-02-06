import { ApiProperty } from '@nestjs/swagger';
import { userRoles } from 'src/user-management/enums';

export class UserCache {
  @ApiProperty({
    description: 'Email of the User.',
    type: 'string',
    example: 'patrick.bateman@yopmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Phone number of the User.',
    type: 'string',
    example: '+9193345345345',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'First name of the User.',
    type: 'string',
    example: 'Patrick',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the User.',
    type: 'string',
    example: 'Bateman',
  })
  lastName: string;

  @ApiProperty({
    description: 'Role of the User.',
    type: 'string',
    example: 'participant',
    enum: userRoles,
  })
  role: string;

  @ApiProperty({
    description: `User's Email Verification`,
    type: 'string',
    example: false,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'JWT token to perform email Verification.',
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
  })
  emailVerifyToken: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
