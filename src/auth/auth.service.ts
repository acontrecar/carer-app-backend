import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { ErrorHandleService } from 'src/common/error-handle/error-handle.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { LoginResponse, RegisterResponse } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private errorHandleService: ErrorHandleService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<RegisterResponse> {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;

      return { user, token: this.gwtJwtToken({ id: user.id }) };
    } catch (error) {
      this.errorHandleService.errorHandle(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user)
      throw new UnauthorizedException(
        'Las credenciales no son validas (email)',
      );

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(
        'Las credenciales no son validas (contrasenia)',
      );

    return { user: user, token: this.gwtJwtToken({ id: user.id }) };
  }

  public gwtJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findAll() {
    const users = await this.userRepository.find({});

    return { users };
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user)
      throw new NotFoundException(
        `No se ha encontrado el usuario con id ${id}`,
      );

    return user;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
