import { ApiProperty } from '@nestjs/swagger';
import { userRoles, userStatuses } from 'src/user-management/enums';

export class Authentication {
  @ApiProperty({
    description: 'Unique identifier for the User.',
    type: 'string',
    format: 'hex',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  id: string;

  @ApiProperty({
    description: 'JWT token to perform Authentication.',
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
  })
  token: string;

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
    description: 'Unique identifier for the Participant.',
    type: 'string',
    format: 'hex',
    example: '123e4567-e89b-12d3-a456-426655440000',
  })
  participantId: string;

  @ApiProperty({
    description: 'Profile Image of the User.',
    type: 'string',
    example: 'image.png',
  })
  profileImage: string;

  @ApiProperty({
    description: 'Status of the User.',
    type: 'string',
    example: 'active',
    enum: userStatuses,
  })
  status: string;

  @ApiProperty({
    description:
      'Whether user is onboarded or not. If not, show onboarding tasks',
    type: 'boolean',
    example: true,
  })
  isOnboarded: boolean;

  @ApiProperty({
    description:
      'Whether user has signed consent or not. If not, show consent screens',
    type: 'boolean',
    example: true,
  })
  isConsentSigned: boolean;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
