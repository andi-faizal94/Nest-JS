import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
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
}
