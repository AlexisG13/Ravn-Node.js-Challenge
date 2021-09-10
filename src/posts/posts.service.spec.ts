import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PostsService } from './posts.service';

const mockPrismaService = () => ({
  post: {
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  reactionReference: { findUnique: jest.fn() },
  reaction: { create: jest.fn() },
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

const mockFindMany = {
  posts: [mockSinglePost],
  get count() {
    return this.posts.length;
  },
};

const mockUpdatedPost = {
  id: '9be9c1c6-731c-4ff3-ac58-a60b59b0a900',
  title: 'My new test post',
  content: 'Such test much wow',
  authorId: '456',
  isLive: true,
};

const updatePostDto = {
  title: 'My new test post',
  content: 'Such test much wow',
  isDraft: false,
};

const failUpdatePostDto = {
  title: 'My test post',
  content: 'Such test much wow',
  isDraft: true,
};

const mockDeleteMany = {
  deletedElements: [mockSinglePost],
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

const mockReactionReference = {
  id: 1,
  name: 'like',
};

const mockReaction = {
  userId: '123',
  postId: '789',
  reactableId: '7891',
};

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useFactory: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getPost', () => {
    it('should get a post with the provided id', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      const result = await service.getPost('123');
      expect(result).toEqual(mockSinglePost);
    });

    it('should throw not found exception when the post was not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      expect(service.getPost('456')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('deletePost', () => {
    it('should deletea a post', async () => {
      (prisma.post.deleteMany as jest.Mock).mockResolvedValue(mockDeleteMany);
      const result = await service.deletePost('456', '123');
      expect(result).toEqual(undefined);
    });

    it('should throw not found exception when the post does not exist', async () => {
      (prisma.post.deleteMany as jest.Mock).mockResolvedValue(
        mockDeleteManyFail,
      );
      expect(service.deletePost('456', '789')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('getUserPosts', () => {
    it('should get all posts from an user', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockFindMany);
      const result = await service.getUserPosts('789');
      expect(result).toEqual(mockFindMany);
    });

    it('should throw not found exception if the user has no posts', () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      expect(service.getUserPosts('000')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updatePost', () => {
    it('should throw not found exception when the post does not exist', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      expect(
        service.updatePost(updatePostDto, '789', '456'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw not found exception when the user does not own the post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      expect(
        service.updatePost(updatePostDto, '789', '123'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw conflict exception when the post is already live', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      expect(
        service.updatePost(failUpdatePostDto, '789', '456'),
      ).rejects.toThrowError(ConflictException);
    });

    it('should return an updated post', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      (prisma.post.update as jest.Mock).mockResolvedValue(mockUpdatedPost);
      const result = await service.updatePost(updatePostDto, '789', '456');
      expect(result).toEqual(mockUpdatedPost);
    });
  });
  describe('reactToPost', () => {
    it('should throw bad request exception when the reaction does not exist', () => {
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        undefined,
      );
      expect(
        service.reactToPost({ reactionId: '1' }, '123', '789'),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should throw not found exception when the post does not exist', () => {
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        mockReactionReference,
      );
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(undefined);
      expect(
        service.reactToPost({ reactionId: '1' }, '123', '789'),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should create a new reaction by the given user on the post', async () => {
      (prisma.reactionReference.findUnique as jest.Mock).mockResolvedValue(
        mockReactionReference,
      );
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockSinglePost);
      (prisma.reaction.create as jest.Mock).mockResolvedValue(mockReaction);
      const result = await service.reactToPost(
        { reactionId: '1' },
        '123',
        '789',
      );
      expect(result).toEqual(mockReaction);
    });
  });
});
