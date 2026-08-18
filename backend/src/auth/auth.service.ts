import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (exists) throw new ConflictException('Email đã được sử dụng');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: await bcrypt.hash(dto.password, 10),
        name: dto.name?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
    });
    return this.issue(user.id, user.email, user.name, user.phone, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.issue(user.id, user.email, user.name, user.phone, user.role);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });
  }

  private issue(
    id: string,
    email: string,
    name: string | null,
    phone: string | null,
    role: string,
  ) {
    const accessToken = this.jwt.sign({ sub: id, email });
    return { accessToken, user: { id, email, name, phone, role } };
  }
}
