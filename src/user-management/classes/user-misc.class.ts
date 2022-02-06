import { ApiProperty } from '@nestjs/swagger';

export class UserMiscFields {
  id: string;

  @ApiProperty({
    description: `Designation`,
    example: 'Therapist',
  })
  designation: string;

  @ApiProperty({
    description: `Hosipital Name`,
    example: 'Fortis',
  })
  hospitalName: string;

  @ApiProperty({
    description: 'Hospital Address',
    type: 'string',
    example: 'Bangalore',
  })
  hospitalAddress: string;

  @ApiProperty({
    description: 'Profile Introduction',
    type: 'string',
    example: 'Hi ~',
  })
  profileIntro: string;

  @ApiProperty({
    description: 'Group Introduction',
    type: 'string',
    example: 'Hello ~',
  })
  groupIntro: string;
}
