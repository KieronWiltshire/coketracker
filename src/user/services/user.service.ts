import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDao } from '../daos/user.dao';

@Injectable()
export class UserService {
  constructor(
    private readonly config: ConfigService,
    private readonly userDao: UserDao,
  ) {}
}
