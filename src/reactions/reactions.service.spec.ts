import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ReactionsService } from './reactions.service';

const mockPrisma = () => ({
  reaction: { create: jest.fn() },
  reactionReference: { findUnique: jest.fn() },
});

const mockResource = {
  reactable: {
    resourceId: '123',
    resourceType: '1',
  },
};

const mockReaction = {
  reactable: mockResource.reactable,
  reactionType: '1',
  userId: '456',
};

const mockReactionReference = {
  reactionType: '1',
  name: 'like',
};

describe('ReactionsService', () => {
  let service: ReactionsService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactionsService,
        { provide: PrismaService, useFactory: mockPrisma },
      ],
    }).compile();

    service = module.get<ReactionsService>(ReactionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createReaction', () => {
    it('should create a reaction', async () => {
      (prisma.reaction.create as jest.Mock).mockResolvedValue(mockReaction);
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        mockReactionReference,
      );
      const result = await service.createReaction(mockResource, '456', '789');
      expect(result).toEqual(mockReaction);
    });
  });

  describe('getReaction', () => {
    it('should get a reaction reference', async () => {
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        mockReactionReference,
      );
      const result = await service.getReaction('123');
      expect(result).toEqual(mockReactionReference);
    });

    it('should throw when the reaction does not exist', () => {
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        undefined,
      );
      expect(service.getReaction('456')).rejects.toThrow(NotFoundException);
    });
  });
});
