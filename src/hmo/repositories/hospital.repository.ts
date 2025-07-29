import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Hospital } from '../entities/hospital.entity';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';

@Injectable()
export class HospitalRepository extends TypeOrmRepository<Hospital> {
  constructor(private readonly dataSource: DataSource) {
    super(Hospital, dataSource.createEntityManager());
  }
}
