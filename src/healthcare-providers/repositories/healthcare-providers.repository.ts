import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Hospital } from '../../hmo/entities/hospital.entity';
import { HcpSearchDto } from '../dto/hcp-query.dto';

@Injectable()
export class HealthcareProvidersRepository extends TypeOrmRepository<Hospital> {
  constructor(private readonly dataSource: DataSource) {
    super(Hospital, dataSource.createEntityManager());
  }

  async findHcpsWithFilters(searchDto: HcpSearchDto) {
    const queryBuilder = this.createQueryBuilder('hcp')
      .leftJoinAndSelect('hcp.plans', 'plans')
      .leftJoinAndSelect('hcp.hmos', 'hmos')
      .leftJoinAndSelect('hcp.enrollments', 'enrollments')
      .leftJoinAndSelect('hcp.ratings', 'ratings')
      .leftJoinAndSelect('hcp.services', 'services')
      .leftJoinAndSelect('hcp.providerClaims', 'providerClaims');

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(hcp.name ILIKE :search OR hcp.address ILIKE :search OR hcp.email ILIKE :search OR hcp.phone ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filter
    if (searchDto.status) {
      queryBuilder.andWhere('hcp.status = :status', { 
        status: searchDto.status 
      });
    }

    // Apply account status filter
    if (searchDto.accountStatus) {
      queryBuilder.andWhere('hcp.accountStatus = :accountStatus', { 
        accountStatus: searchDto.accountStatus 
      });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmos.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply plan filter
    if (searchDto.planId) {
      queryBuilder.andWhere('plans.id = :planId', { planId: searchDto.planId });
    }

    // Apply facility type filter
    if (searchDto.facilityType) {
      queryBuilder.andWhere('hcp.facilityType = :facilityType', { 
        facilityType: searchDto.facilityType 
      });
    }

    // Apply emergency service filter
    if (searchDto.emergencyServiceProvider !== undefined) {
      queryBuilder.andWhere('hcp.emergencyServiceProvider = :emergencyServiceProvider', { 
        emergencyServiceProvider: searchDto.emergencyServiceProvider 
      });
    }

    // Apply specialty filter
    if (searchDto.specialty) {
      queryBuilder.andWhere('hcp.specialties::text ILIKE :specialty', { 
        specialty: `%${searchDto.specialty}%` 
      });
    }

    // Apply location filter
    if (searchDto.location) {
      queryBuilder.andWhere('hcp.address ILIKE :location', { 
        location: `%${searchDto.location}%` 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`hcp.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findHcpById(id: string) {
    return this.createQueryBuilder('hcp')
      .leftJoinAndSelect('hcp.plans', 'plans')
      .leftJoinAndSelect('hcp.hmos', 'hmos')
      .leftJoinAndSelect('hcp.enrollments', 'enrollments')
      .leftJoinAndSelect('hcp.ratings', 'ratings')
      .leftJoinAndSelect('hcp.services', 'services')
      .leftJoinAndSelect('hcp.providerClaims', 'providerClaims')
      .leftJoinAndSelect('hcp.users', 'users')
      .where('hcp.id = :id', { id })
      .getOne();
  }

  async checkHcpNameExists(name: string, excludeId?: string) {
    const queryBuilder = this.createQueryBuilder('hcp')
      .where('hcp.name = :name', { name });

    if (excludeId) {
      queryBuilder.andWhere('hcp.id != :excludeId', { excludeId });
    }

    return await queryBuilder.getOne();
  }

  async checkHcpEmailExists(email: string, excludeId?: string) {
    const queryBuilder = this.createQueryBuilder('hcp')
      .where('hcp.email = :email', { email });

    if (excludeId) {
      queryBuilder.andWhere('hcp.id != :excludeId', { excludeId });
    }

    return await queryBuilder.getOne();
  }

  async getHcpStats() {
    const totalHcps = await this.createQueryBuilder('hcp').getCount();

    const activeHcps = await this.createQueryBuilder('hcp')
      .where('hcp.accountStatus = :status', { status: 'active' })
      .getCount();

    const approvedHcps = await this.createQueryBuilder('hcp')
      .where('hcp.status = :status', { status: 'approved' })
      .getCount();

    const emergencyProviders = await this.createQueryBuilder('hcp')
      .where('hcp.emergencyServiceProvider = :emergency', { emergency: true })
      .getCount();

    const hcpsByType = await this.createQueryBuilder('hcp')
      .select('hcp.facilityType', 'facilityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hcp.facilityType')
      .getRawMany();

    const hcpsByStatus = await this.createQueryBuilder('hcp')
      .select('hcp.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('hcp.status')
      .getRawMany();

    return {
      totalHcps,
      activeHcps,
      inactiveHcps: totalHcps - activeHcps,
      approvedHcps,
      pendingHcps: totalHcps - approvedHcps,
      emergencyProviders,
      nonEmergencyProviders: totalHcps - emergencyProviders,
      hcpsByType,
      hcpsByStatus,
    };
  }

  async getHcpEnrollmentStats(hcpId: string) {
    const totalEnrollments = await this.dataSource
      .createQueryBuilder('ProviderEnrollment', 'enrollment')
      .leftJoin('enrollment.provider', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .getCount();

    const activeEnrollments = await this.dataSource
      .createQueryBuilder('ProviderEnrollment', 'enrollment')
      .leftJoin('enrollment.provider', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .andWhere('enrollment.status = :status', { status: 'active' })
      .getCount();

    const totalRatings = await this.dataSource
      .createQueryBuilder('ProviderRating', 'rating')
      .leftJoin('rating.provider', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .getCount();

    const averageRating = await this.dataSource
      .createQueryBuilder('ProviderRating', 'rating')
      .leftJoin('rating.provider', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .select('AVG(rating.rating)', 'averageRating')
      .getRawOne();

    const totalServices = await this.dataSource
      .createQueryBuilder('ProviderService', 'service')
      .leftJoin('service.provider', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .getCount();

    const totalClaims = await this.dataSource
      .createQueryBuilder('ProviderClaim', 'claim')
      .leftJoin('claim.hospital', 'hcp')
      .where('hcp.id = :hcpId', { hcpId })
      .getCount();

    return {
      totalEnrollments,
      activeEnrollments,
      inactiveEnrollments: totalEnrollments - activeEnrollments,
      totalRatings,
      averageRating: parseFloat(averageRating?.averageRating || '0'),
      totalServices,
      totalClaims,
    };
  }

  async findHcpsByHmo(hmoId: string) {
    return this.createQueryBuilder('hcp')
      .leftJoinAndSelect('hcp.hmos', 'hmos')
      .leftJoinAndSelect('hcp.plans', 'plans')
      .where('hmos.id = :hmoId', { hmoId })
      .orderBy('hcp.createdAt', 'DESC')
      .getMany();
  }

  async findHcpsByPlan(planId: string) {
    return this.createQueryBuilder('hcp')
      .leftJoinAndSelect('hcp.plans', 'plans')
      .leftJoinAndSelect('hcp.hmos', 'hmos')
      .where('plans.id = :planId', { planId })
      .orderBy('hcp.createdAt', 'DESC')
      .getMany();
  }

  async findEmergencyProviders() {
    return this.createQueryBuilder('hcp')
      .leftJoinAndSelect('hcp.plans', 'plans')
      .leftJoinAndSelect('hcp.hmos', 'hmos')
      .where('hcp.emergencyServiceProvider = :emergency', { emergency: true })
      .andWhere('hcp.accountStatus = :status', { status: 'active' })
      .orderBy('hcp.name', 'ASC')
      .getMany();
  }
}
