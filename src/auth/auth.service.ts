import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';
import { hash, compare } from 'bcrypt';

export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    const Auth = await this.authRepository.create(createAuthDto);
    return this.authRepository.save(Auth);
  }

  async findAll(): Promise<Auth[]> {
    return await this.authRepository.find();
  }

  async findOne(id: string): Promise<Auth> {
    const user = await this.authRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
  async update(id: string, updateAuthDto: UpdateAuthDto): Promise<Auth> {
    const user = await this.authRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return this.authRepository.save({ ...user, ...updateAuthDto });
  }

  async remove(id: string): Promise<Auth> {
    const user = await this.authRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return this.authRepository.remove(user);
  }

  async createUser(createAuthDto: CreateAuthDto) {
    const existingUser = await this.authRepository.findOne({
      where: {
        email: createAuthDto.email,
      },
    });

    if (existingUser) {
      throw new HttpException('Email Already exist', HttpStatus.BAD_REQUEST);
    }

    const privatePassword = await this.hashPassword(createAuthDto.password);
    await this.authRepository.save({
      username: createAuthDto.username,
      password: privatePassword,
      email: createAuthDto.email,
    });
  }

  async login(loginAuthDto: LoginAuthDto): Promise<JWTTokens> {
    const { email, password } = loginAuthDto;
    const user = await this.authRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return this.getTokens(user);
  }
  async refreshToken(token: string): Promise<JWTTokens> {
    try {
      const { sub: email } = await this.jwtService.verifyAsync(token, {
        secret: 'super-secret-key-2',
      });

      const user = await this.authRepository.findOneOrFail({
        where: {
          email,
        },
      });
      return this.getTokens(user);
    } catch (error) {
      throw new HttpException('Invalid credential', HttpStatus.BAD_REQUEST);
    }
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 8);
  }

  private async getTokens(createAuthDto: CreateAuthDto): Promise<JWTTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: createAuthDto.email,
        },
        {
          secret: 'super-secret-key',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: createAuthDto.email,
        },
        {
          secret: 'super-secret-key-2',
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
