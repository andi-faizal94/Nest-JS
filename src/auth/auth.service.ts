import { Injectable } from '@nestjs/common';
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

  async findAll() {
    return await this.authRepository.find();
  }

  async findOne(id: number) {
    return await this.authRepository.findOne({ where: { id: id } });
  }
  async update(id: number, updateAuthDto: UpdateAuthDto) {
    const auth = await this.authRepository.findOne({ where: { id: id } });

    return this.authRepository.save({ ...auth, ...updateAuthDto });
  }

  async remove(id: number) {
    const auth = await this.authRepository.findOne({ where: { id: id } });

    return this.authRepository.remove(auth);
  }
}
