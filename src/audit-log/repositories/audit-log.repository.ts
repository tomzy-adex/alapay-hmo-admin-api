import { Injectable } from '@nestjs/common';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { AuditLog } from '../entities/audit-log.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditLogRepository extends TypeOrmRepository<AuditLog> {
  constructor(private readonly dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }
}
