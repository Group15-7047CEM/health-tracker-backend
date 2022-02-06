import { ApiProperty } from '@nestjs/swagger';
import { userRoles, userStatuses } from '../enums';

export class UserManagementRequestDto {
  @ApiProperty({
    description: `User's first name`,
    example: 'Patrick',
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
  })
  public email: string;

  @ApiProperty({
    description: `Phone number`,
    example: '+9199345345345',
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
    description: `User's Last Login timestamp`,
    example: '',
  })
  public lastLoginAt: Date;

  @ApiProperty({
    description: `User's Password`,
    example: '12345678',
  })
  public password: string;

  @ApiProperty({
    description: `User's Mobile Number Verification`,
    example: false,
  })
  public mobileVerified: boolean;

  @ApiProperty({
    description: 'Project IDs',
    type: 'string',
    format: 'hex',
    example: ['123e4567-e89b-12d3-a456-426655440000'],
    isArray: true,
    required: false,
  })
  projectIds: string[];

  @ApiProperty({
    description: 'Creator Id',
    type: 'string',
    format: 'hex',
    example: '123e4567-e89b-12d3-a456-426655440000',
    required: false,
  })
  creatorId?: string;

  @ApiProperty({
    description: 'Therapist Id',
    type: 'string',
    format: 'hex',
    example: '123e4567-e89b-12d3-a456-426655440000',
    required: false,
  })
  therapistId?: string;

  @ApiProperty({
    description: 'Status of the User.',
    example: 'active',
    enum: userStatuses,
    required: false,
  })
  public status: string;

  @ApiProperty({
    description: `User's Email Verification`,
    example: false,
  })
  public emailVerified: boolean;

  @ApiProperty({
    description: 'JWT token to perform email Verification.',
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
  })
  public emailVerifyToken: string;

  @ApiProperty({
    description: `User's personal meeting link`,
    example: 'https:/zoom.us/join/hkkhf662lkhhkaa',
  })
  meetingLink?: string;
}
