import { DynamicModule, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { EmailService } from '../email/email.service';
import { RoleService } from '../role/role.service';
import { EncryptionService } from '../utils/encryption.service';
import { UserRepository } from './repositories/user.repository';
import { redisConnection } from '../config';
import { RoleRepository } from '../role/repositories/role.repository';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditLogRepository } from 'src/audit-log/repositories/audit-log.repository';
import { DynamicRepositoryService } from 'src/audit-log/dynamic-repository.service';
import { HmoRepository } from 'src/hmo/repositories/hmo.repository';

@Module({})
export class UserModule {
  static register(): DynamicModule {
    return {
      global: true,
      imports: [TypeOrmModule.forFeature([User])],
      controllers: [UserController],
      module: UserModule,
      providers: [
        UserService,
        UserRepository,
        EncryptionService,
        CacheService,
        RoleService,
        EmailService,
        RoleRepository,
        NotificationRepository,
        AuditLogService,
        AuditLogRepository,
        DynamicRepositoryService,
        HmoRepository,
        {
          provide: 'IOREDIS_INSTANCE',
          useValue: redisConnection,
        },
      ],
      exports: [
        UserService,
        UserRepository,
        EncryptionService,
        CacheService,
        NotificationRepository,
      ],
    };
  }
}
