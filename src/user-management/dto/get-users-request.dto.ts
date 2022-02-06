import { ApiProperty } from '@nestjs/swagger';
import { userRoles, userStatuses } from '../enums';


export class GetUsersRequestDto {
  @ApiProperty({
    description: 'Page number',
    type: 'integer',
    example: 1,
    required: false,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    type: 'integer',
    example: 10,
    required: false,
  })
  size: number;

  @ApiProperty({
    description: 'Search keyword (first name, last name)',
    type: 'string',
    required: false,
    example: 'Name',
  })
  search: string;

  @ApiProperty({
    description: 'Role of the user.',
    type: 'string',
    enum: userRoles,
    enumName: 'userRoles',
    example: 'participant',
    required: false,
  })
  role: string;

  @ApiProperty({
    description: 'Status of the User.',
    example: 'active',
    enum: userStatuses,
    required: false,
  })
  public status: string;

  @ApiProperty({
    description: 'Unique identifer of the therapist.',
    example: 'b09db2ca-36ff-4adb-9b20-66fa9ffcff12',
    required: false,
  })
  therapistId: string;

  @ApiProperty({
    description: 'Order by of the user.',
    type: 'string',
    enum: ['asc', 'desc'],
    enumName: 'usersOrderBy',
    example: 'asc',
    required: false,
  })
  orderBy: string;

  @ApiProperty({
    description: 'Sort by of the user.',
    type: 'string',
    enum: ['firstName'],
    enumName: 'usersSortBy',
    example: 'firstName',
    required: false,
  })
  sortBy: string;
}
