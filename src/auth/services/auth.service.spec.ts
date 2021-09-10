import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';
import { Request } from 'express';

const mockPrismaService = () => ({
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  userAuth: { findUnique: jest.fn() },
});
const mockConfigService = () => ({});

const mockJwtService = () => ({
  sign: jest.fn(),
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(() => true),
  genSalt: jest.fn(() => 'salt'),
  hash: jest.fn(() => 'hashedPassword'),
}));

const mockSignInDto = {
  username: 'john',
  password: '1234',
  email: 'foo@bar.com',
};

const signUpDto = {
  username: 'john',
  password: '1234',
  email: 'foo@bar.com',
  name: 'John Doe',
};

const mockUserCredentials = {
  username: 'john',
  password: '1234',
  isVerified: true,
};

const mockUnverifiedUser = {
  username: 'john',
  password: '1234',
  isVerified: false,
};

const mockUser = {
  username: 'john',
  name: 'john doe',
  email: 'foo@bar.com',
};

const mockAccessToken = {
  accessToken: 'jwtToken',
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      (prisma.userAuth.findUnique as jest.Mock).mockResolvedValue(
        mockUserCredentials,
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('jwtToken');
      const result = await service.signIn(mockSignInDto);
      expect(result).toEqual(mockAccessToken);
    });

    it('should throw when user is not verified', async () => {
      (prisma.userAuth.findUnique as jest.Mock).mockResolvedValue(
        mockUnverifiedUser,
      );
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      expect(service.signIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.signUp(signUpDto, {
        protocol: 'http',
        host: 'localhost',
      } as Request);
      expect(result).toEqual(undefined);
    });
  });
});
