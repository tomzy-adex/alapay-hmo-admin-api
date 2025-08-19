import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './repositories/settings.repository';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { EmailModule } from '../email/email.module';
import { EncryptionService } from '../utils/encryption.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Hmo,
      Organization,
      Wallet,
      Notification,
      AuditLog,
    ]),
    CacheModule.register(),
    EmailModule.register(),
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    SettingsRepository,
    EncryptionService,
  ],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
