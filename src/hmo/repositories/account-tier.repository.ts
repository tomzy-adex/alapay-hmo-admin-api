import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { AccountTier } from '../entities/account-tier.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AccountTierRepository extends TypeOrmRepository<AccountTier> {
  constructor(private readonly dataSource: DataSource) {
    super(AccountTier, dataSource.createEntityManager());
  }
}
