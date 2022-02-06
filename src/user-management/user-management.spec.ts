import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';

describe('UserManagement', () => {
  let provider: UserManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserManagementService],
    }).compile();

    provider = module.get<UserManagementService>(UserManagementService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
