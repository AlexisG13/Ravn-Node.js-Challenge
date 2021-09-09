import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from '../dtos/sign-up.dto';
import * as mailgun from 'mailgun-js';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto, req: Request): Promise<void> {
    const { email, password, username, name } = signUpDto;
    const existingUser = await this.prisma.user.findMany({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser.length !== 0) {
      throw new ConflictException('User with email or username already exists');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword: string = await bcrypt.hash(password, salt);
    const newUser = await this.prisma.user.create({
      data: {
        email,
        username,
        name,
        userSettings: {
          create: {
            showEmail: false,
            showName: false,
          },
        },
        userAuth: {
          create: {
            email,
            password: hashedPassword,
            isVerified: false,
          },
        },
      },
    });
    this.sendVerificationEmail(newUser, req);
  }

  private async sendVerificationEmail(user: User, req: Request): Promise<void> {
    const template = await this.getEmailTemplate('verification');
    const htmlMessage = template({
      verificationLink: `${req.protocol}://${req.hostname}/auth/verify?user=${user.id}`,
    });
    const email = this.createEmail(user.email, htmlMessage);
    const mg = mailgun({
      apiKey: this.configService.get<string>('MAILGUN_API_KEY'),
      domain: this.configService.get<string>('MAILGUN_DOMAIN'),
    });
    try {
      mg.messages().send(email);
    } catch (err) {
      throw new InternalServerErrorException(
        'An error ocurred with the email provider',
      );
    }
  }

  private createEmail(
    userEmail: string,
    htmlMessage: string,
  ): mailgun.messages.SendData {
    return {
      from: 'microblog support <support@microblog.com>',
      subject: 'verify your microblog account!',
      to: userEmail,
      html: htmlMessage,
    };
  }

  private async getEmailTemplate(templateName: string) {
    const emailtemplatesource = await fs.readFile(
      `mail_templates/${templateName}.hbs`,
      'utf8',
    );
    return handlebars.compile(emailtemplatesource);
  }

  async verifyAccount(userId: string) {
    const updatedAccount = this.prisma.userAuth.update({
      data: { isVerified: true },
      where: { userId },
    });
    if (!updatedAccount) {
      throw new NotFoundException('User does not exist');
    }
  }
}
