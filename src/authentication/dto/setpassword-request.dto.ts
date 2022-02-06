import { ApiProperty } from '@nestjs/swagger';

export class SetPasswordRequestDto {
  @ApiProperty({
    description: 'Password of the User.',
    example: '12345678',
    required: true,
  })
  public password: string;

  @ApiProperty({
    description: 'JWT token to perform Authentication.',
    type: 'string',
    required: true,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVjZDI5OGRlZjFjZWMyNjExZmJlYWI3ZiIsImVtYWlsIjoic29tZWVtYWlsQGVtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTU1NzQ4Njk2M30.ahXntlivGSHKd1lSW_HLdcZDE6IbIhKLjCeXPJIwqqU',
  })
  public token: string;
}
