import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { User } from '../../user/entities/user.entity';
import { CustomerSearchDto, CustomerFilterDto } from '../dto/customer-query.dto';
import { UserRoles } from '../../utils/types';

@Injectable()
export class CustomerRepository extends TypeOrmRepository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findCustomersWithFilters(
    searchDto: CustomerSearchDto,
    filterDto: CustomerFilterDto,
  ) {
    const queryBuilder = this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('user.hospitals', 'hospitals')
      .where('role.permission = :customerRole', { 
        customerRole: UserRoles.INDIVIDUAL_USER 
      });

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filters
    if (searchDto.status) {
      queryBuilder.andWhere('user.accountStatus = :status', { 
        status: searchDto.status 
      });
    }

    if (searchDto.accountStatus) {
      queryBuilder.andWhere('user.status = :accountStatus', { 
        accountStatus: searchDto.accountStatus 
      });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmo.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply organization filter
    if (searchDto.organizationId) {
      queryBuilder.andWhere('organization.id = :organizationId', { 
        organizationId: searchDto.organizationId 
      });
    }

    // Apply gender filter
    if (searchDto.gender) {
      queryBuilder.andWhere('user.gender = :gender', { 
        gender: searchDto.gender 
      });
    }

    // Apply blood group filter
    if (searchDto.bloodGroup) {
      queryBuilder.andWhere('user.bloodGroup = :bloodGroup', { 
        bloodGroup: searchDto.bloodGroup 
      });
    }

    // Apply email verification filter
    if (searchDto.isEmailVerified !== undefined) {
      queryBuilder.andWhere('user.isEmailVerified = :isEmailVerified', { 
        isEmailVerified: searchDto.isEmailVerified 
      });
    }

    // Apply date range filters
    if (filterDto.startDate) {
      queryBuilder.andWhere('user.createdAt >= :startDate', { 
        startDate: new Date(filterDto.startDate) 
      });
    }

    if (filterDto.endDate) {
      queryBuilder.andWhere('user.createdAt <= :endDate', { 
        endDate: new Date(filterDto.endDate) 
      });
    }

    // Apply height filters
    if (filterDto.minHeight) {
      queryBuilder.andWhere('user.height >= :minHeight', { 
        minHeight: filterDto.minHeight 
      });
    }

    if (filterDto.maxHeight) {
      queryBuilder.andWhere('user.height <= :maxHeight', { 
        maxHeight: filterDto.maxHeight 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findCustomerById(id: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('user.hospitals', 'hospitals')
      .leftJoinAndSelect('user.claims', 'claims')
      .leftJoinAndSelect('user.payments', 'payments')
      .leftJoinAndSelect('user.notifications', 'notifications')
      .leftJoinAndSelect('user.auditLogs', 'auditLogs')
      .where('user.id = :id', { id })
      .andWhere('role.permission = :customerRole', { 
        customerRole: UserRoles.INDIVIDUAL_USER 
      })
      .getOne();
  }

  async getCustomerStats() {
    const totalCustomers = await this.createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.permission = :customerRole', { 
        customerRole: UserRoles.INDIVIDUAL_USER 
      })
      .getCount();

    const activeCustomers = await this.createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.permission = :customerRole', { 
        customerRole: UserRoles.INDIVIDUAL_USER 
      })
      .andWhere('user.accountStatus = :status', { status: 'active' })
      .getCount();

    const verifiedCustomers = await this.createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .where('role.permission = :customerRole', { 
        customerRole: UserRoles.INDIVIDUAL_USER 
      })
      .andWhere('user.isEmailVerified = :verified', { verified: true })
      .getCount();

    return {
      totalCustomers,
      activeCustomers,
      verifiedCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      unverifiedCustomers: totalCustomers - verifiedCustomers,
    };
  }
}
