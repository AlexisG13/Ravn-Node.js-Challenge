import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile, UserSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dtos/update-settings.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(userId: string) {
    const userSettings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userSettings || !user) {
      throw new NotFoundException('User does not exist');
    }
    if (userSettings.showEmail === false) {
      user.email = null;
    }
    if (userSettings.showName === false) {
      user.name = null;
    }
    return user;
  }

  async updateSettings(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<UserSettings> {
    return this.prisma.userSettings.update({
      where: { userId },
      data: updateSettingsDto,
    });
  }

}
