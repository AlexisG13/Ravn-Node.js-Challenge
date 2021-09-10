import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsService } from '../reactions/reactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsService } from './comments.service';

const mockPrismaService = () => ({
  post: {
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  reactionReference: { findUnique: jest.fn() },
  reaction: { create: jest.fn() },
  comment: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
});

const mockReactionService = () => ({
  createReaction: jest.fn(),
  getReaction: jest.fn(),
});

const mockSinglePost = {
  id: '789',
  title: 'My test post',
  content: 'Such test much wow',
  authorId: '456',
  isLive: true,
  reactable: {
    resourceId: '789',
    resourceType: '1',
  },
};

const mockComment = {
  id: '123',
  content: 'Hey Im a comment!',
  postId: '789',
  authorId: '456',
  isLive: true,
  resourceType: 2,
};

const mockDeleteMany = {
  deletedElements: [mockComment],
  get count() {
    return this.deletedElements.length;
  },
};
const mockDeleteManyFail = {
  deletedElements: [],
  get count() {
    return this.deletedElements.length;
  },
};

const mockPostCommentDto = {
  content: 'Im a comment',
  isLive: true,
};

const mockDraftedComment = {
  content: 'I want to be a draft',
  isLive: false,
};

const mockReaction = {
  userId: '123',
  postId: '789',
  reactableId: '7891',
};

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;
  let reactionService: ReactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
        {
          provide: ReactionsService,
          useFactory: mockReactionService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
    reactionService = module.get<ReactionsService>(ReactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
    expect(reactionService).toBeDefined();
  });

  describe('getPostComments', () => {
    it('should throw not found exception when the post does not exist', () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      expect(service.getPostComments('000')).rejects.toThrow(NotFoundException);
    });

    it('should throw not found exception when the post has no comments', () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      expect(service.getPostComments('789')).rejects.toThrow(NotFoundException);
    });

    it('should get all comments from a post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComment]);
      const result = await service.getPostComments('789');
      expect(result).toEqual([mockComment]);
    });
  });

  describe('deleteComment', () => {
    it('should throw not found if the comment does not exist', () => {
      (prisma.comment.deleteMany as jest.Mock).mockResolvedValue(
        mockDeleteManyFail,
      );
      expect(service.deleteComment('789', '456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete a comment', async () => {
      (prisma.comment.deleteMany as jest.Mock).mockResolvedValue(
        mockDeleteMany,
      );
      const result = await service.deleteComment('123', '456');
      expect(result).toEqual(undefined);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      (prisma.comment.update as jest.Mock).mockResolvedValue(mockComment);
      const result = await service.updateComment(
        mockPostCommentDto,
        '123',
        '456',
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw when the comment does not exist', () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(undefined);
      expect(
        service.updateComment(mockPostCommentDto, '000', '456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when the user does not own the comment', () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      expect(
        service.updateComment(mockPostCommentDto, '000', '111'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when trying to make a live comment a draft', () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      expect(
        service.updateComment(mockDraftedComment, '000', '456'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('reactToPost', () => {
    it('should throw bad request exception when the reaction does not exist', () => {
      (reactionService.createReaction as jest.Mock).mockRejectedValue(
        new NotFoundException('Reaction does not exist'),
      );
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      expect(
        service.reactToComment({ reactionId: '1' }, '123', '789'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw not found exception when the post does not exist', () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(undefined);
      expect(
        service.reactToComment({ reactionId: '1' }, '123', '789'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should create a new reaction by the given user on the post', async () => {
      (reactionService.createReaction as jest.Mock).mockResolvedValue(
        mockReaction,
      );
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(mockComment);
      const result = await service.reactToComment(
        { reactionId: '1' },
        '123',
        '789',
      );
      expect(result).toEqual(mockReaction);
    });
  });

  describe('getUserComments', () => {
    it('should throw when the user has no comments', () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      expect(service.getUserComments('123')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should get all comments from an user', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([mockComment]);
      const result = await service.getUserComments('123');
      expect(result).toEqual([mockComment]);
    });
  });
});
