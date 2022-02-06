import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserIntrosByIdRequestDto {
  @ApiProperty({
    description: `Profile Introduction`,
    example: 'Hi ~',
    required: false,
  })
  profileIntro: string;

  @ApiProperty({
    description: `Group Introduction`,
    example: 'Hi ~',
    required: false,
  })
  groupIntro: string;
}
