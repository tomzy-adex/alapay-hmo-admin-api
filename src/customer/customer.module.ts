import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './repositories/customer.repository';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { Hmo } from '../hmo/entities/hmo.entity';
import { Organization } from '../organization/entities/organization.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Claim } from '../claim/entities/claim.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Notification } from '../notification/entities/notification.entity';
import { AuditLog } from '../audit-log/entities/audit-log.entity';
import { Hospital } from '../hmo/entities/hospital.entity';
import { Note } from '../claim/entities/note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Hmo,
      Organization,
      Wallet,
      Claim,
      Payment,
      Notification,
      AuditLog,
      Hospital,
      Note,
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository],
  exports: [CustomerService, CustomerRepository],
})
export class CustomerModule {}
