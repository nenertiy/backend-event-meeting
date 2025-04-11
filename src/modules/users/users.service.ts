import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordService } from '../password/password.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserRole } from '@prisma/client';
import { User } from 'src/common/types/user';
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async findById(id: string) {
    const cachedUser = await this.cacheManager.get<User>(`user_${id}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set<User>(`user_${id}`, user);

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string) {
    const cachedUser = await this.cacheManager.get<User>(`user_${username}`);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.usersRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cacheManager.set<User>(`user_${username}`, user);

    return user;
  }

  async findAll(query?: string, take?: number, skip?: number) {
    const cachedUsers = await this.cacheManager.get<User[]>(
      `users_${query}_${take}_${skip}`,
    );
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.usersRepository.findAll(query, take, skip);

    await this.cacheManager.set<User[]>(
      `users_${query}_${take}_${skip}`,
      users,
    );

    return users;
  }

  async create(dto: CreateUserDto) {
    await this.checkUserExistsByEmail(dto.email);
    await this.checkUserExistsByUsername(dto.username);

    const hashedPassword = await this.passwordService.hashPassword(
      dto.password,
    );

    if (dto.role === UserRole.ORGANIZER) {
      const organizer = await this.usersRepository.createOrganizer({
        ...dto,
        password: hashedPassword,
      });
      await this.cacheManager.set<User>(`user_${organizer.id}`, organizer);
      return organizer;
    } else {
      const user = await this.usersRepository.createUser({
        ...dto,
        password: hashedPassword,
      });
      await this.cacheManager.set<User>(`user_${user.id}`, user);
      return user;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.checkUserExistsById(id);
    await this.checkUserExistsByEmail(dto.email);
    await this.checkUserExistsByUsername(dto.username);

    await this.cacheManager.del('users');
    await this.cacheManager.del(`user_${id}`);

    let updateData = { ...dto };

    if (dto.password) {
      updateData.password = await this.passwordService.hashPassword(
        dto.password,
      );
    }

    const user = await this.usersRepository.update(id, updateData);
    await this.cacheManager.set<User>(`user_${user.id}`, user);

    return user;
  }

  async delete(id: string) {
    await this.checkUserExistsById(id);

    await this.cacheManager.del('users');
    await this.cacheManager.del(`user_${id}`);

    await this.usersRepository.delete(id);
  }

  private async checkUserExistsByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (user) {
      throw new ConflictException('User with this email already exists');
    }
  }

  private async checkUserExistsByUsername(username: string) {
    const user = await this.usersRepository.findByUsername(username);
    if (user) {
      throw new ConflictException('User with this username already exists');
    }
  }

  private async checkUserExistsById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
