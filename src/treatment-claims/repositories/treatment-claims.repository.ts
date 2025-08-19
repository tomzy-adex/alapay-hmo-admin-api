import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { Claim } from '../../claim/entities/claim.entity';
import { ProviderClaim } from '../../claim/entities/provider-claim.entity';
import { TreatmentClaimSearchDto } from '../dto/treatment-claim-query.dto';

@Injectable()
export class TreatmentClaimsRepository extends TypeOrmRepository<Claim> {
  constructor(private readonly dataSource: DataSource) {
    super(Claim, dataSource.createEntityManager());
  }

  async findTreatmentClaimsWithFilters(searchDto: TreatmentClaimSearchDto) {
    const queryBuilder = this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('claim.notes', 'notes')
      .leftJoinAndSelect('notes.user', 'noteUser');

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(claim.providerReference ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR hospital.name ILIKE :search OR claim.description ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filter
    if (searchDto.status) {
      queryBuilder.andWhere('claim.status = :status', { 
        status: searchDto.status 
      });
    }

    // Apply type filter
    if (searchDto.type) {
      queryBuilder.andWhere('claim.type = :type', { 
        type: searchDto.type 
      });
    }

    // Apply user filter
    if (searchDto.userId) {
      queryBuilder.andWhere('user.id = :userId', { userId: searchDto.userId });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmo.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply hospital filter
    if (searchDto.hospitalId) {
      queryBuilder.andWhere('hospital.id = :hospitalId', { hospitalId: searchDto.hospitalId });
    }

    // Apply plan filter
    if (searchDto.planId) {
      queryBuilder.andWhere('plan.id = :planId', { planId: searchDto.planId });
    }

    // Apply amount range filters
    if (searchDto.minAmount !== undefined) {
      queryBuilder.andWhere('claim.amount >= :minAmount', { 
        minAmount: searchDto.minAmount 
      });
    }

    if (searchDto.maxAmount !== undefined) {
      queryBuilder.andWhere('claim.amount <= :maxAmount', { 
        maxAmount: searchDto.maxAmount 
      });
    }

    // Apply date range filters
    if (searchDto.startDate) {
      queryBuilder.andWhere('claim.serviceDate >= :startDate', { 
        startDate: searchDto.startDate 
      });
    }

    if (searchDto.endDate) {
      queryBuilder.andWhere('claim.serviceDate <= :endDate', { 
        endDate: searchDto.endDate 
      });
    }

    // Apply year filter
    if (searchDto.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM claim.serviceDate) = :year', { 
        year: searchDto.year 
      });
    }

    // Apply month filter
    if (searchDto.month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM claim.serviceDate) = :month', { 
        month: searchDto.month 
      });
    }

    // Apply provider reference filter
    if (searchDto.providerReference) {
      queryBuilder.andWhere('claim.providerReference ILIKE :providerReference', { 
        providerReference: `%${searchDto.providerReference}%` 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`claim.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findProviderClaimsWithFilters(searchDto: TreatmentClaimSearchDto) {
    const queryBuilder = this.dataSource.createQueryBuilder(ProviderClaim, 'providerClaim')
      .leftJoinAndSelect('providerClaim.hmo', 'hmo')
      .leftJoinAndSelect('providerClaim.hospital', 'hospital')
      .leftJoinAndSelect('providerClaim.payment', 'payment')
      .leftJoinAndSelect('providerClaim.request', 'request')
      .leftJoinAndSelect('providerClaim.notes', 'notes')
      .leftJoinAndSelect('notes.user', 'noteUser');

    // Apply search filters
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(providerClaim.claimReference ILIKE :search OR providerClaim.enrolleeNo ILIKE :search OR hospital.name ILIKE :search OR providerClaim.diagnosis ILIKE :search)',
        { search: `%${searchDto.search}%` }
      );
    }

    // Apply status filter
    if (searchDto.status) {
      queryBuilder.andWhere('providerClaim.status = :status', { 
        status: searchDto.status 
      });
    }

    // Apply HMO filter
    if (searchDto.hmoId) {
      queryBuilder.andWhere('hmo.id = :hmoId', { hmoId: searchDto.hmoId });
    }

    // Apply hospital filter
    if (searchDto.hospitalId) {
      queryBuilder.andWhere('hospital.id = :hospitalId', { hospitalId: searchDto.hospitalId });
    }

    // Apply payment status filter
    if (searchDto.paymentStatus) {
      queryBuilder.andWhere('payment.status = :paymentStatus', { 
        paymentStatus: searchDto.paymentStatus 
      });
    }

    // Apply authorization code filter
    if (searchDto.authorizationCode) {
      queryBuilder.andWhere('providerClaim.authorizationCode ILIKE :authorizationCode', { 
        authorizationCode: `%${searchDto.authorizationCode}%` 
      });
    }

    // Apply enrollee number filter
    if (searchDto.enrolleeNo) {
      queryBuilder.andWhere('providerClaim.enrolleeNo ILIKE :enrolleeNo', { 
        enrolleeNo: `%${searchDto.enrolleeNo}%` 
      });
    }

    // Apply claim reference filter
    if (searchDto.claimReference) {
      queryBuilder.andWhere('providerClaim.claimReference ILIKE :claimReference', { 
        claimReference: `%${searchDto.claimReference}%` 
      });
    }

    // Apply diagnosis filter
    if (searchDto.diagnosis) {
      queryBuilder.andWhere('providerClaim.diagnosis ILIKE :diagnosis', { 
        diagnosis: `%${searchDto.diagnosis}%` 
      });
    }

    // Apply date range filters
    if (searchDto.startDate) {
      queryBuilder.andWhere('providerClaim.createdAt >= :startDate', { 
        startDate: searchDto.startDate 
      });
    }

    if (searchDto.endDate) {
      queryBuilder.andWhere('providerClaim.createdAt <= :endDate', { 
        endDate: searchDto.endDate 
      });
    }

    // Apply year filter
    if (searchDto.year) {
      queryBuilder.andWhere('EXTRACT(YEAR FROM providerClaim.createdAt) = :year', { 
        year: searchDto.year 
      });
    }

    // Apply month filter
    if (searchDto.month) {
      queryBuilder.andWhere('EXTRACT(MONTH FROM providerClaim.createdAt) = :month', { 
        month: searchDto.month 
      });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`providerClaim.${sortBy}`, sortOrder);

    // Apply pagination
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findTreatmentClaimById(id: string) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('claim.notes', 'notes')
      .leftJoinAndSelect('notes.user', 'noteUser')
      .where('claim.id = :id', { id })
      .getOne();
  }

  async findProviderClaimById(id: string) {
    return this.dataSource.createQueryBuilder(ProviderClaim, 'providerClaim')
      .leftJoinAndSelect('providerClaim.hmo', 'hmo')
      .leftJoinAndSelect('providerClaim.hospital', 'hospital')
      .leftJoinAndSelect('providerClaim.payment', 'payment')
      .leftJoinAndSelect('providerClaim.request', 'request')
      .leftJoinAndSelect('providerClaim.notes', 'notes')
      .leftJoinAndSelect('notes.user', 'noteUser')
      .where('providerClaim.id = :id', { id })
      .getOne();
  }

  async getTreatmentClaimStats() {
    const totalClaims = await this.createQueryBuilder('claim').getCount();

    const pendingClaims = await this.createQueryBuilder('claim')
      .where('claim.status = :status', { status: 'pending' })
      .getCount();

    const approvedClaims = await this.createQueryBuilder('claim')
      .where('claim.status = :status', { status: 'approved' })
      .getCount();

    const rejectedClaims = await this.createQueryBuilder('claim')
      .where('claim.status = :status', { status: 'rejected' })
      .getCount();

    const totalAmount = await this.createQueryBuilder('claim')
      .select('SUM(claim.amount)', 'totalAmount')
      .where('claim.status = :status', { status: 'approved' })
      .getRawOne();

    const averageAmount = await this.createQueryBuilder('claim')
      .select('AVG(claim.amount)', 'averageAmount')
      .where('claim.status = :status', { status: 'approved' })
      .getRawOne();

    const claimsByStatus = await this.createQueryBuilder('claim')
      .select('claim.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.amount)', 'totalAmount')
      .groupBy('claim.status')
      .getRawMany();

    const claimsByType = await this.createQueryBuilder('claim')
      .select('claim.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.amount)', 'totalAmount')
      .groupBy('claim.type')
      .getRawMany();

    const claimsByMonth = await this.createQueryBuilder('claim')
      .select('EXTRACT(YEAR FROM claim.serviceDate)', 'year')
      .addSelect('EXTRACT(MONTH FROM claim.serviceDate)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.amount)', 'totalAmount')
      .groupBy('EXTRACT(YEAR FROM claim.serviceDate), EXTRACT(MONTH FROM claim.serviceDate)')
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getRawMany();

    return {
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalAmount: parseFloat(totalAmount?.totalAmount || '0'),
      averageAmount: parseFloat(averageAmount?.averageAmount || '0'),
      claimsByStatus,
      claimsByType,
      claimsByMonth,
    };
  }

  async getTreatmentClaimStatsByYear(year: number) {
    const totalClaims = await this.createQueryBuilder('claim')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .getCount();

    const pendingClaims = await this.createQueryBuilder('claim')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .andWhere('claim.status = :status', { status: 'pending' })
      .getCount();

    const approvedClaims = await this.createQueryBuilder('claim')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .andWhere('claim.status = :status', { status: 'approved' })
      .getCount();

    const totalAmount = await this.createQueryBuilder('claim')
      .select('SUM(claim.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .andWhere('claim.status = :status', { status: 'approved' })
      .getRawOne();

    const averageAmount = await this.createQueryBuilder('claim')
      .select('AVG(claim.amount)', 'averageAmount')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .andWhere('claim.status = :status', { status: 'approved' })
      .getRawOne();

    const claimsByMonth = await this.createQueryBuilder('claim')
      .select('EXTRACT(MONTH FROM claim.serviceDate)', 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM claim.serviceDate)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const claimsByStatus = await this.createQueryBuilder('claim')
      .select('claim.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(claim.amount)', 'totalAmount')
      .where('EXTRACT(YEAR FROM claim.serviceDate) = :year', { year })
      .groupBy('claim.status')
      .getRawMany();

    return {
      year,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims: totalClaims - pendingClaims - approvedClaims,
      totalAmount: parseFloat(totalAmount?.totalAmount || '0'),
      averageAmount: parseFloat(averageAmount?.averageAmount || '0'),
      claimsByMonth,
      claimsByStatus,
    };
  }

  async getTreatmentClaimsByUser(userId: string) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('user.id = :userId', { userId })
      .orderBy('claim.createdAt', 'DESC')
      .getMany();
  }

  async getTreatmentClaimsByHmo(hmoId: string) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('hmo.id = :hmoId', { hmoId })
      .orderBy('claim.createdAt', 'DESC')
      .getMany();
  }

  async getTreatmentClaimsByHospital(hospitalId: string) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('hospital.id = :hospitalId', { hospitalId })
      .orderBy('claim.createdAt', 'DESC')
      .getMany();
  }

  async getRecentTreatmentClaims(limit: number = 10) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .orderBy('claim.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getHighValueTreatmentClaims(minAmount: number = 100000) {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('claim.amount >= :minAmount', { minAmount })
      .orderBy('claim.amount', 'DESC')
      .getMany();
  }

  async getPendingTreatmentClaims() {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('claim.status = :status', { status: 'pending' })
      .orderBy('claim.createdAt', 'ASC')
      .getMany();
  }

  async getApprovedTreatmentClaims() {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('claim.status = :status', { status: 'approved' })
      .orderBy('claim.createdAt', 'DESC')
      .getMany();
  }

  async getRejectedTreatmentClaims() {
    return this.createQueryBuilder('claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.plan', 'plan')
      .leftJoinAndSelect('claim.hospital', 'hospital')
      .leftJoinAndSelect('claim.notes', 'notes')
      .where('claim.status = :status', { status: 'rejected' })
      .orderBy('claim.createdAt', 'DESC')
      .getMany();
  }
}
