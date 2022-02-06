import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailRequestDto {
  @ApiProperty({
    description: 'Email of the User.',
    required: true,
    example: 'test@yopmail.com',
  })
  public email: string;

  @ApiProperty({
    description: 'JWT token to perform email Verification.',
    type: 'string',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
    required: true,
  })
  public emailVerifyToken: string;
}
