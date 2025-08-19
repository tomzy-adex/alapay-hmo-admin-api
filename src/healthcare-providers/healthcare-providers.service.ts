import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { HealthcareProvidersRepository } from './repositories/healthcare-providers.repository';
import { CreateHcpDto } from './dto/create-hcp.dto';
import { UpdateHcpDto } from './dto/update-hcp.dto';
import { HcpSearchDto } from './dto/hcp-query.dto';
import { DataSource, In } from 'typeorm';
import { Hmo } from '../hmo/entities/hmo.entity';
import { HealthcarePlan } from '../hmo/entities/healthcare-plan.entity';
import { ProcessStatus, Status } from '../utils/types';

@Injectable()
export class HealthcareProvidersService {
  constructor(
    private readonly hcpRepository: HealthcareProvidersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createHcp(payload: CreateHcpDto) {
    try {
      // Check if HCP name already exists
      const existingHcpByName = await this.hcpRepository.checkHcpNameExists(payload.name);
      if (existingHcpByName) {
        throw new ConflictException(
          `A healthcare provider with the name "${payload.name}" already exists.`,
        );
      }

      // Check if HCP email already exists
      const existingHcpByEmail = await this.hcpRepository.checkHcpEmailExists(payload.contactInfo.email);
      if (existingHcpByEmail) {
        throw new ConflictException(
          `A healthcare provider with the email "${payload.contactInfo.email}" already exists.`,
        );
      }

      // Validate plans exist
      if (payload.planIds && payload.planIds.length > 0) {
        const plans = await this.dataSource.getRepository(HealthcarePlan).find({
          where: { id: In(payload.planIds) },
        });

        if (plans.length !== payload.planIds.length) {
          throw new BadRequestException('Some healthcare plans not found.');
        }
      }

      // Validate HMOs exist
      if (payload.hmoIds && payload.hmoIds.length > 0) {
        const hmos = await this.dataSource.getRepository(Hmo).find({
          where: { id: In(payload.hmoIds) },
        });

        if (hmos.length !== payload.hmoIds.length) {
          throw new BadRequestException('Some HMOs not found.');
        }
      }

      // Create the HCP
      const hcp = this.hcpRepository.create({
        name: payload.name,
        address: payload.address,
        email: payload.contactInfo.email,
        phone: payload.contactInfo.phone,
        emergencyServiceProvider: payload.emergencyServiceProvider || false,
        status: payload.status || ProcessStatus.PENDING,
        accountStatus: payload.accountStatus || Status.DORMANT,
        verificationComments: payload.verificationComments,
        plans: payload.planIds?.map(id => ({ id })),
        hmos: payload.hmoIds?.map(id => ({ id })),
        // Add additional fields if they exist in the entity
        ...(payload.facilityInfo && {
          facilityType: payload.facilityInfo.facilityType,
          bedCount: payload.facilityInfo.bedCount,
          operatingHours: payload.facilityInfo.operatingHours,
          specialties: payload.facilityInfo.specialties,
        }),
        ...(payload.metadata && { metadata: payload.metadata }),
      });

      const createdHcp = await this.hcpRepository.save(hcp);

      // Fetch the created HCP with relations
      const hcpWithRelations = await this.hcpRepository.findHcpById(createdHcp.id);

      return {
        success: true,
        message: 'Healthcare provider created successfully',
        data: this.sanitizeHcpData(hcpWithRelations),
      };
    } catch (error) {
      if (error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating HCP:', error);
      throw new InternalServerErrorException('Failed to create healthcare provider');
    }
  }

  async getAllHcps(searchDto: HcpSearchDto) {
    try {
      const [hcps, total] = await this.hcpRepository.findHcpsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Healthcare providers retrieved successfully',
        data: {
          hcps: hcps.map(hcp => this.sanitizeHcpData(hcp)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching HCPs:', error);
      throw new InternalServerErrorException('Failed to fetch healthcare providers');
    }
  }

  async getHcpById(id: string) {
    try {
      const hcp = await this.hcpRepository.findHcpById(id);

      if (!hcp) {
        throw new NotFoundException('Healthcare provider not found');
      }

      return {
        success: true,
        message: 'Healthcare provider retrieved successfully',
        data: this.sanitizeHcpData(hcp, true), // Include detailed info for individual view
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching HCP by ID:', error);
      throw new InternalServerErrorException('Failed to fetch healthcare provider');
    }
  }

  async updateHcp(id: string, payload: UpdateHcpDto) {
    try {
      const hcp = await this.hcpRepository.findHcpById(id);

      if (!hcp) {
        throw new NotFoundException('Healthcare provider not found');
      }

      // Check for name conflicts if name is being updated
      if (payload.name && payload.name !== hcp.name) {
        const existingHcpByName = await this.hcpRepository.checkHcpNameExists(payload.name, id);
        if (existingHcpByName) {
          throw new ConflictException(
            `A healthcare provider with the name "${payload.name}" already exists.`,
          );
        }
      }

      // Check for email conflicts if email is being updated
      if (payload.contactInfo?.email && payload.contactInfo.email !== hcp.email) {
        const existingHcpByEmail = await this.hcpRepository.checkHcpEmailExists(payload.contactInfo.email, id);
        if (existingHcpByEmail) {
          throw new ConflictException(
            `A healthcare provider with the email "${payload.contactInfo.email}" already exists.`,
          );
        }
      }

      // Validate plans exist if being updated
      if (payload.planIds && payload.planIds.length > 0) {
        const plans = await this.dataSource.getRepository(HealthcarePlan).find({
          where: { id: In(payload.planIds) },
        });

        if (plans.length !== payload.planIds.length) {
          throw new BadRequestException('Some healthcare plans not found.');
        }
      }

      // Validate HMOs exist if being updated
      if (payload.hmoIds && payload.hmoIds.length > 0) {
        const hmos = await this.dataSource.getRepository(Hmo).find({
          where: { id: In(payload.hmoIds) },
        });

        if (hmos.length !== payload.hmoIds.length) {
          throw new BadRequestException('Some HMOs not found.');
        }
      }

      // Update the HCP
      const updateData: any = {};

      if (payload.name) updateData.name = payload.name;
      if (payload.address) updateData.address = payload.address;
      if (payload.contactInfo?.email) updateData.email = payload.contactInfo.email;
      if (payload.contactInfo?.phone) updateData.phone = payload.contactInfo.phone;
      if (payload.emergencyServiceProvider !== undefined) updateData.emergencyServiceProvider = payload.emergencyServiceProvider;
      if (payload.status) updateData.status = payload.status;
      if (payload.accountStatus) updateData.accountStatus = payload.accountStatus;
      if (payload.verificationComments) updateData.verificationComments = payload.verificationComments;
      if (payload.facilityInfo?.facilityType) updateData.facilityType = payload.facilityInfo.facilityType;
      if (payload.facilityInfo?.bedCount) updateData.bedCount = payload.facilityInfo.bedCount;
      if (payload.facilityInfo?.operatingHours) updateData.operatingHours = payload.facilityInfo.operatingHours;
      if (payload.facilityInfo?.specialties) updateData.specialties = payload.facilityInfo.specialties;
      if (payload.metadata) updateData.metadata = payload.metadata;

      // Update relationships
      if (payload.planIds) {
        updateData.plans = payload.planIds.map(id => ({ id }));
      }
      if (payload.hmoIds) {
        updateData.hmos = payload.hmoIds.map(id => ({ id }));
      }

      await this.hcpRepository.update(id, updateData);

      // Fetch the updated HCP
      const updatedHcp = await this.hcpRepository.findHcpById(id);

      return {
        success: true,
        message: 'Healthcare provider updated successfully',
        data: this.sanitizeHcpData(updatedHcp),
      };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating HCP:', error);
      throw new InternalServerErrorException('Failed to update healthcare provider');
    }
  }

  async deleteHcp(id: string) {
    try {
      const hcp = await this.hcpRepository.findHcpById(id);

      if (!hcp) {
        throw new NotFoundException('Healthcare provider not found');
      }

      // Check if HCP has active enrollments
      const hasActiveEnrollments = hcp.enrollments && 
        hcp.enrollments.some(enrollment => enrollment.status === 'active');

      if (hasActiveEnrollments) {
        throw new BadRequestException(
          'Cannot delete healthcare provider with active enrollments. Please deactivate all enrollments first.',
        );
      }

      // Check if HCP has active claims
      const hasActiveClaims = hcp.providerClaims && 
        hcp.providerClaims.some(claim => claim.status === ProcessStatus.PENDING || claim.status === ProcessStatus.APPROVED);

      if (hasActiveClaims) {
        throw new BadRequestException(
          'Cannot delete healthcare provider with active claims. Please process all claims first.',
        );
      }

      // Soft delete the HCP
      await this.hcpRepository.softDelete(id);

      return {
        success: true,
        message: 'Healthcare provider deleted successfully',
        data: {
          id: hcp.id,
          name: hcp.name,
          deletedAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting HCP:', error);
      throw new InternalServerErrorException('Failed to delete healthcare provider');
    }
  }

  async getHcpStats() {
    try {
      const stats = await this.hcpRepository.getHcpStats();

      return {
        success: true,
        message: 'Healthcare provider statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching HCP stats:', error);
      throw new InternalServerErrorException('Failed to fetch healthcare provider statistics');
    }
  }

  async getHcpEnrollmentStats(hcpId: string) {
    try {
      // Verify HCP exists
      const hcp = await this.hcpRepository.findOne({ where: { id: hcpId } });
      if (!hcp) {
        throw new NotFoundException('Healthcare provider not found');
      }

      const stats = await this.hcpRepository.getHcpEnrollmentStats(hcpId);

      return {
        success: true,
        message: 'Healthcare provider enrollment statistics retrieved successfully',
        data: {
          hcp: {
            id: hcp.id,
            name: hcp.name,
          },
          ...stats,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching HCP enrollment stats:', error);
      throw new InternalServerErrorException('Failed to fetch healthcare provider enrollment statistics');
    }
  }

  async getHcpsByHmo(hmoId: string) {
    try {
      const hcps = await this.hcpRepository.findHcpsByHmo(hmoId);

      return {
        success: true,
        message: 'HMO healthcare providers retrieved successfully',
        data: {
          hmoId,
          hcps: hcps.map(hcp => this.sanitizeHcpData(hcp)),
        },
      };
    } catch (error) {
      console.error('Error fetching HMO HCPs:', error);
      throw new InternalServerErrorException('Failed to fetch HMO healthcare providers');
    }
  }

  async getHcpsByPlan(planId: string) {
    try {
      const hcps = await this.hcpRepository.findHcpsByPlan(planId);

      return {
        success: true,
        message: 'Plan healthcare providers retrieved successfully',
        data: {
          planId,
          hcps: hcps.map(hcp => this.sanitizeHcpData(hcp)),
        },
      };
    } catch (error) {
      console.error('Error fetching plan HCPs:', error);
      throw new InternalServerErrorException('Failed to fetch plan healthcare providers');
    }
  }

  async getEmergencyProviders() {
    try {
      const hcps = await this.hcpRepository.findEmergencyProviders();

      return {
        success: true,
        message: 'Emergency healthcare providers retrieved successfully',
        data: {
          hcps: hcps.map(hcp => this.sanitizeHcpData(hcp)),
        },
      };
    } catch (error) {
      console.error('Error fetching emergency providers:', error);
      throw new InternalServerErrorException('Failed to fetch emergency healthcare providers');
    }
  }

  private sanitizeHcpData(hcp: any, includeDetails = false) {
    const sanitized = {
      id: hcp.id,
      name: hcp.name,
      address: hcp.address,
      email: hcp.email,
      phone: hcp.phone,
      emergencyServiceProvider: hcp.emergencyServiceProvider,
      status: hcp.status,
      accountStatus: hcp.accountStatus,
      verificationComments: hcp.verificationComments,
      createdAt: hcp.createdAt,
      updatedAt: hcp.updatedAt,
      plans: hcp.plans ? hcp.plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        coverageType: plan.coverageType,
        pricingStructure: plan.pricingStructure,
      })) : [],
      hmos: hcp.hmos ? hcp.hmos.map(hmo => ({
        id: hmo.id,
        name: hmo.name,
        email: hmo.email,
        phoneNumber: hmo.phoneNumber,
      })) : [],
    };

    // Include additional details for individual view
    if (includeDetails) {
      // sanitized.enrollments = hcp.enrollments ? hcp.enrollments.map(enrollment => ({
      //   id: enrollment.id,
      //   startDate: enrollment.startDate,
      //   endDate: enrollment.endDate,
      //   status: enrollment.status,
      //   createdAt: enrollment.createdAt,
      // })) : [];

      // sanitized.ratings = hcp.ratings ? hcp.ratings.map(rating => ({
      //   id: rating.id,
      //   rating: rating.rating,
      //   comment: rating.comment,
      //   createdAt: rating.createdAt,
      // })) : [];

      // sanitized.services = hcp.services ? hcp.services.map(service => ({
      //   id: service.id,
      //   name: service.name,
      //   description: service.description,
      //   price: service.price,
      // })) : [];

      // sanitized.providerClaims = hcp.providerClaims ? hcp.providerClaims.map(claim => ({
      //   id: claim.id,
      //   enrolleeNo: claim.enrolleeNo,
      //   description: claim.description,
      //   amount: claim.amount,
      //   status: claim.status,
      //   createdAt: claim.createdAt,
      // })) : [];

      // sanitized.users = hcp.users ? hcp.users.map(user => ({
      //   id: user.id,
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email,
      //   phoneNumber: user.phoneNumber,
      // })) : [];
    }

    return sanitized;
  }
}
