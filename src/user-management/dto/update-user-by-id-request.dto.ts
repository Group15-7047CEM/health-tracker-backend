import { ApiProperty } from '@nestjs/swagger';
import { userStatuses } from '../enums';

export class UpdateUserByIdRequestDto {
  @ApiProperty({
    description: `User's first name`,
    example: 'Patrick',
    required: false,
  })
  firstName: string;

  @ApiProperty({
    description: `User's last name`,
    example: 'Bateman',
    required: false,
  })
  lastName: string;

  @ApiProperty({
    description: 'Status of the User.',
    type: 'string',
    example: 'active',
    enum: userStatuses,
    required: false,
  })
  status: string;

  @ApiProperty({
    description: 'Image URL for the user',
    type: 'string',
    format: 'hex',
    example: 'https://www.example.com/images/example.png',
    required: false,
  })
  profileImage: string;

  @ApiProperty({
    description: 'JWT token to perform email Verification.',
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
    required: false,
  })
  emailVerifyToken: string;

  @ApiProperty({
    description: `User's Email Verification`,
    type: 'string',
    example: false,
    required: false,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: `User's personal meeting link`,
    example: 'https:/zoom.us/join/hkkhf662lkhhkaa',
  })
  meetingLink?: string;

  @ApiProperty({
    description: `User's Designation`,
    example: 'Admin',
    required: false,
  })
  designation: string;

  @ApiProperty({
    description: `User's Hospital Name`,
    example: 'UH',
    required: false,
  })
  hospitalName: string;

  @ApiProperty({
    description: `User's Hospital Address`,
    example: 'lane 1, State',
    required: false,
  })
  hospitalAddress: string;

  @ApiProperty({
    description: `User's Age`,
    example: 23,
    required: false,
  })
  age: number;

  @ApiProperty({
    description: `User's Nickname`,
    example: 'nick_name',
    required: false,
  })
  nickname: string;
}
