import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from './accounts.service';

const mockPrismaService = () => ({
  userSettings: { findUnique: jest.fn(), update: jest.fn() },
  user: { findUnique: jest.fn() },
  profile: { findUnique: jest.fn() },
});

const mockUpdateUserSettings = {
  showName: true,
  showEmail: true,
};

const mockProfile = {
  photo: 'mypic',
  status: 'Helloo',
  userId: '123',
};

const mockUser = {
  email: 'foo@bar.com',
  name: 'John Doe',
};

const mockDontShowEmailSettings = {
  showEmail: false,
  showName: true,
};

const mockDontShowNameSettings = {
  showEmail: true,
  showName: false,
};

describe('AccountsService', () => {
  let service: AccountsService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('updateSettings', () => {
    it('should update a user settings', async () => {
      (prisma.userSettings.update as jest.Mock).mockResolvedValue(
        mockUpdateUserSettings,
      );
      const result = await service.updateSettings(
        '123',
        mockUpdateUserSettings,
      );
      expect(result).toEqual(mockUpdateUserSettings);
    });
  });

  describe('getProfile', () => {
    it('should get a user profile', async () => {
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      const result = await service.getProfile('123');
      expect(result).toEqual(mockProfile);
    });

    it('should throw when the user does not exist', () => {
      (prisma.profile.findUnique as jest.Mock).mockResolvedValue(undefined);
      expect(service.getProfile('456')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserInfo', () => {
    it('should throw when user or settings were not found', () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(undefined);
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue(
        undefined,
      );
      expect(service.getUserInfo('123')).rejects.toThrow(NotFoundException);
    });

    it('should not show email when user settings are set not to show email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue(
        mockDontShowEmailSettings,
      );
      const result = await service.getUserInfo('123');
      expect(result).toEqual({ name: 'John Doe', email: null });
    });

    it('should not show name when user settings are set not to show name', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'foo@bar.com',
        name: 'John Doe',
      });
      (prisma.userSettings.findUnique as jest.Mock).mockResolvedValue(
        mockDontShowNameSettings,
      );
      const result = await service.getUserInfo('123');
      expect(result).toEqual({ email: 'foo@bar.com', name: null });
    });
  });
});
