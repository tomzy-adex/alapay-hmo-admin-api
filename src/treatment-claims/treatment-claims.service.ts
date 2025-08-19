import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TreatmentClaimsRepository } from './repositories/treatment-claims.repository';
import { TreatmentClaimSearchDto } from './dto/treatment-claim-query.dto';
import { ApproveDeclineClaimDto } from './dto/approve-decline-claim.dto';
import { ClaimStatus } from '../utils/types';

@Injectable()
export class TreatmentClaimsService {
  constructor(
    private readonly treatmentClaimsRepository: TreatmentClaimsRepository,
  ) {}

  async getAllTreatmentClaims(searchDto: TreatmentClaimSearchDto) {
    try {
      const [claims, total] = await this.treatmentClaimsRepository.findTreatmentClaimsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Treatment claims retrieved successfully',
        data: {
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
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
      console.error('Error fetching treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch treatment claims');
    }
  }

  async getTreatmentClaimsByYear(year: number, searchDto: TreatmentClaimSearchDto) {
    try {
      // Override the year filter
      const yearSearchDto = { ...searchDto, year };
      const [claims, total] = await this.treatmentClaimsRepository.findTreatmentClaimsWithFilters(yearSearchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `Treatment claims for year ${year} retrieved successfully`,
        data: {
          year,
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
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
      console.error('Error fetching treatment claims by year:', error);
      throw new InternalServerErrorException('Failed to fetch treatment claims by year');
    }
  }

  async filterAndExportTreatmentClaims(searchDto: TreatmentClaimSearchDto) {
    try {
      const [claims, total] = await this.treatmentClaimsRepository.findTreatmentClaimsWithFilters(searchDto);

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      const exportFormat = searchDto.exportFormat || 'csv';
      const exportData = this.prepareExportData(claims, exportFormat);

      return {
        success: true,
        message: 'Treatment claims filtered and export prepared successfully',
        data: {
          filters: this.getAppliedFilters(searchDto),
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
          export: {
            format: exportFormat,
            data: exportData,
            filename: `treatment-claims-${new Date().toISOString().split('T')[0]}.${exportFormat}`,
          },
        },
      };
    } catch (error) {
      console.error('Error filtering and exporting treatment claims:', error);
      throw new InternalServerErrorException('Failed to filter and export treatment claims');
    }
  }

  async getTreatmentClaimById(id: string) {
    try {
      const claim = await this.treatmentClaimsRepository.findTreatmentClaimById(id);

      if (!claim) {
        throw new NotFoundException('Treatment claim not found');
      }

      return {
        success: true,
        message: 'Treatment claim retrieved successfully',
        data: this.sanitizeClaimData(claim, true), // Include detailed info for individual view
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching treatment claim by ID:', error);
      throw new InternalServerErrorException('Failed to fetch treatment claim');
    }
  }

  async approveDeclineClaim(id: string, payload: ApproveDeclineClaimDto) {
    try {
      const claim = await this.treatmentClaimsRepository.findTreatmentClaimById(id);

      if (!claim) {
        throw new NotFoundException('Treatment claim not found');
      }

      if (claim.status !== ClaimStatus.PENDING) {
        throw new BadRequestException('Only pending claims can be approved or declined');
      }

      // Update claim status based on action
      const newStatus = payload.action === 'approve' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;
      claim.status = payload.status || newStatus;

      // Update rejection reason if declining
      if (payload.action === 'decline' && payload.reason) {
        claim.rejectionReason = payload.reason;
      }

      // Update amount if different approved amount is provided
      if (payload.approvedAmount && payload.approvedAmount !== claim.amount) {
        claim.amount = payload.approvedAmount;
      }

      // Save the updated claim
      await this.treatmentClaimsRepository.save(claim);

      // Add a note about the action
      if (payload.notes) {
        // Note: You would need to implement note creation here
        // await this.noteService.createNote({
        //   claimId: claim.id,
        //   note: payload.notes,
        //   userId: currentUserId, // Get from request context
        // });
      }

      return {
        success: true,
        message: `Treatment claim ${payload.action}d successfully`,
        data: {
          id: claim.id,
          status: claim.status,
          action: payload.action,
          reason: payload.reason,
          approvedAmount: claim.amount,
          updatedAt: claim.updatedAt,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error approving/declining treatment claim:', error);
      throw new InternalServerErrorException('Failed to process treatment claim');
    }
  }

  async getTreatmentClaimStats() {
    try {
      const stats = await this.treatmentClaimsRepository.getTreatmentClaimStats();

      return {
        success: true,
        message: 'Treatment claim statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching treatment claim stats:', error);
      throw new InternalServerErrorException('Failed to fetch treatment claim statistics');
    }
  }

  async getTreatmentClaimStatsByYear(year: number) {
    try {
      const stats = await this.treatmentClaimsRepository.getTreatmentClaimStatsByYear(year);

      return {
        success: true,
        message: `Treatment claim statistics for year ${year} retrieved successfully`,
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching treatment claim stats by year:', error);
      throw new InternalServerErrorException('Failed to fetch treatment claim statistics by year');
    }
  }

  async getTreatmentClaimsByUser(userId: string) {
    try {
      const claims = await this.treatmentClaimsRepository.getTreatmentClaimsByUser(userId);

      return {
        success: true,
        message: 'User treatment claims retrieved successfully',
        data: {
          userId,
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching user treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch user treatment claims');
    }
  }

  async getTreatmentClaimsByHmo(hmoId: string) {
    try {
      const claims = await this.treatmentClaimsRepository.getTreatmentClaimsByHmo(hmoId);

      return {
        success: true,
        message: 'HMO treatment claims retrieved successfully',
        data: {
          hmoId,
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching HMO treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch HMO treatment claims');
    }
  }

  async getTreatmentClaimsByHospital(hospitalId: string) {
    try {
      const claims = await this.treatmentClaimsRepository.getTreatmentClaimsByHospital(hospitalId);

      return {
        success: true,
        message: 'Hospital treatment claims retrieved successfully',
        data: {
          hospitalId,
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching hospital treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch hospital treatment claims');
    }
  }

  async getRecentTreatmentClaims(limit: number = 10) {
    try {
      const claims = await this.treatmentClaimsRepository.getRecentTreatmentClaims(limit);

      return {
        success: true,
        message: 'Recent treatment claims retrieved successfully',
        data: {
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching recent treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch recent treatment claims');
    }
  }

  async getHighValueTreatmentClaims(minAmount: number = 100000) {
    try {
      const claims = await this.treatmentClaimsRepository.getHighValueTreatmentClaims(minAmount);

      return {
        success: true,
        message: 'High value treatment claims retrieved successfully',
        data: {
          minAmount,
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching high value treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch high value treatment claims');
    }
  }

  async getPendingTreatmentClaims() {
    try {
      const claims = await this.treatmentClaimsRepository.getPendingTreatmentClaims();

      return {
        success: true,
        message: 'Pending treatment claims retrieved successfully',
        data: {
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching pending treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch pending treatment claims');
    }
  }

  async getApprovedTreatmentClaims() {
    try {
      const claims = await this.treatmentClaimsRepository.getApprovedTreatmentClaims();

      return {
        success: true,
        message: 'Approved treatment claims retrieved successfully',
        data: {
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching approved treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch approved treatment claims');
    }
  }

  async getRejectedTreatmentClaims() {
    try {
      const claims = await this.treatmentClaimsRepository.getRejectedTreatmentClaims();

      return {
        success: true,
        message: 'Rejected treatment claims retrieved successfully',
        data: {
          claims: claims.map(claim => this.sanitizeClaimData(claim)),
        },
      };
    } catch (error) {
      console.error('Error fetching rejected treatment claims:', error);
      throw new InternalServerErrorException('Failed to fetch rejected treatment claims');
    }
  }

  private sanitizeClaimData(claim: any, includeDetails = false) {
    const sanitized = {
      id: claim.id,
      type: claim.type,
      description: claim.description,
      amount: claim.amount,
      status: claim.status,
      serviceDate: claim.serviceDate,
      providerReference: claim.providerReference,
      rejectionReason: claim.rejectionReason,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      user: claim.user ? {
        id: claim.user.id,
        firstName: claim.user.firstName,
        lastName: claim.user.lastName,
        email: claim.user.email,
        phoneNumber: claim.user.phoneNumber,
      } : null,
      plan: claim.plan ? {
        id: claim.plan.id,
        name: claim.plan.name,
        coverageType: claim.plan.coverageType,
        pricingStructure: claim.plan.pricingStructure,
      } : null,
      hospital: claim.hospital ? {
        id: claim.hospital.id,
        name: claim.hospital.name,
        address: claim.hospital.address,
        phone: claim.hospital.phone,
        email: claim.hospital.email,
      } : null,
      notes: claim.notes ? claim.notes.map(note => ({
        id: note.id,
        note: note.note,
        timestamp: note.timestamp,
        user: note.user ? {
          id: note.user.id,
          firstName: note.user.firstName,
          lastName: note.user.lastName,
        } : null,
      })) : [],
    };

    // Include additional details for individual view
    if (includeDetails) {
      // sanitized.hmo = claim.user?.hmo ? {
      //   id: claim.user.hmo.id,
      //   name: claim.user.hmo.name,
      //   email: claim.user.hmo.email,
      // } : null;

      // sanitized.organization = claim.user?.organization ? {
      //   id: claim.user.organization.id,
      //   name: claim.user.organization.name,
      //   contactInfo: claim.user.organization.contactInfo,
      // } : null;

      // sanitized.wallet = claim.user?.wallet ? {
      //   id: claim.user.wallet.id,
      //   balance: claim.user.wallet.balance,
      // } : null;

      // sanitized.documents = claim.documents;
      // sanitized.metadata = claim.metadata;
    }

    return sanitized;
  }

  private getAppliedFilters(searchDto: TreatmentClaimSearchDto) {
    const filters: any = {};

    if (searchDto.status) filters.status = searchDto.status;
    if (searchDto.type) filters.type = searchDto.type;
    if (searchDto.userId) filters.userId = searchDto.userId;
    if (searchDto.hmoId) filters.hmoId = searchDto.hmoId;
    if (searchDto.hospitalId) filters.hospitalId = searchDto.hospitalId;
    if (searchDto.planId) filters.planId = searchDto.planId;
    if (searchDto.minAmount !== undefined) filters.minAmount = searchDto.minAmount;
    if (searchDto.maxAmount !== undefined) filters.maxAmount = searchDto.maxAmount;
    if (searchDto.startDate) filters.startDate = searchDto.startDate;
    if (searchDto.endDate) filters.endDate = searchDto.endDate;
    if (searchDto.year) filters.year = searchDto.year;
    if (searchDto.month) filters.month = searchDto.month;
    if (searchDto.paymentStatus) filters.paymentStatus = searchDto.paymentStatus;
    if (searchDto.authorizationCode) filters.authorizationCode = searchDto.authorizationCode;
    if (searchDto.providerReference) filters.providerReference = searchDto.providerReference;
    if (searchDto.enrolleeNo) filters.enrolleeNo = searchDto.enrolleeNo;
    if (searchDto.claimReference) filters.claimReference = searchDto.claimReference;
    if (searchDto.diagnosis) filters.diagnosis = searchDto.diagnosis;

    return filters;
  }

  private prepareExportData(claims: any[], format: string) {
    // This is a simplified export preparation
    // In a real implementation, you would use libraries like exceljs, csv-writer, etc.
    
    if (format === 'csv') {
      const headers = ['ID', 'Type', 'Description', 'Amount', 'Status', 'Service Date', 'User', 'Hospital', 'Plan'];
      const rows = claims.map(claim => [
        claim.id,
        claim.type,
        claim.description,
        claim.amount,
        claim.status,
        claim.serviceDate,
        `${claim.user?.firstName} ${claim.user?.lastName}`,
        claim.hospital?.name,
        claim.plan?.name,
      ]);
      
      return {
        headers,
        rows,
        content: [headers, ...rows].map(row => row.join(',')).join('\n'),
      };
    }

    if (format === 'excel') {
      // Return data structure for Excel export
      return {
        sheets: [{
          name: 'Treatment Claims',
          data: claims.map(claim => ({
            id: claim.id,
            type: claim.type,
            description: claim.description,
            amount: claim.amount,
            status: claim.status,
            serviceDate: claim.serviceDate,
            userName: `${claim.user?.firstName} ${claim.user?.lastName}`,
            userEmail: claim.user?.email,
            hospitalName: claim.hospital?.name,
            planName: claim.plan?.name,
            createdAt: claim.createdAt,
          })),
        }],
      };
    }

    if (format === 'pdf') {
      // Return data structure for PDF export
      return {
        title: 'Treatment Claims Report',
        data: claims.map(claim => ({
          id: claim.id,
          type: claim.type,
          description: claim.description,
          amount: claim.amount,
          status: claim.status,
          serviceDate: claim.serviceDate,
          user: `${claim.user?.firstName} ${claim.user?.lastName}`,
          hospital: claim.hospital?.name,
          plan: claim.plan?.name,
        })),
      };
    }

    return claims;
  }
}
