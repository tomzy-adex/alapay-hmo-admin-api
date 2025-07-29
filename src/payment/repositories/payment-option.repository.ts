import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { PaymentOption } from '../entities/payment-option.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentOptionRepository extends TypeOrmRepository<PaymentOption> {
  constructor(private readonly dataSource: DataSource) {
    super(PaymentOption, dataSource.createEntityManager());
  }
}
