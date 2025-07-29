/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ClaimQueryDto,
  UpdateClaimDto,
  UpdateClaimStatusDto,
} from './dto/update-claim.dto';
import { ClaimStatus, ProcessStatus } from 'src/utils/types';
import { ClaimRepository } from './repositories/claim.repository';
import { UserRepository } from 'src/user/repositories/user.repository';
import { HospitalRepository } from 'src/hmo/repositories/hospital.repository';
import { ProviderClaimRepository } from './repositories/provider-claim.repository';
import { NoteRepository } from './repositories/note.repository';
import { AuthData } from 'src/utils/auth.strategy';
import { QueryDto } from 'src/config/dto/query.dto';
import { UpdateProviderClaimStatusDto } from './dto/update-provider-claim.dto';

@Injectable()
export class ClaimService {
  constructor(
    private readonly claimRepository: ClaimRepository,
    private readonly userRepository: UserRepository,
    private readonly hospitalRepository: HospitalRepository,
    private readonly providerClaimRepository: ProviderClaimRepository,
    private readonly noteRepository: NoteRepository,
  ) {}

  async findAllUserClaim(
    hospitalId: string,
    query: QueryDto,
    authData: AuthData,
  ) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [claims, total] = await this.claimRepository.findAndCount({
      where: {
        hospital: { id: hospitalId },
        user: { hmo: { id: authData.hmoId } },
      },
      relations: ['user', 'hospital'],
      skip: offset,
      take: limit,
    });

    if (!claims || claims.length === 0) {
      throw new NotFoundException('No claims found for this hospital');
    }

    return {
      success: true,
      message: 'Claims retrieved successfully',
      data: claims,
      total,
      page,
      limit,
    };
  }

  async findOneUserClaim(query: ClaimQueryDto, authData: AuthData) {
    const { claimId, userId } = query;
    const claim = await this.claimRepository.findOne({
      where: { id: claimId, user: { id: userId, hmo: { id: authData.hmoId } } },
      relations: ['user', 'hospital'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return {
      success: true,
      message: 'Claim retrieved successfully',
      data: claim,
    };
  }

  async updateUserClaim(
    updateClaimDto: UpdateClaimDto,
    authData: AuthData,
    query: ClaimQueryDto,
  ) {
    const claim = await this.findOneUserClaim(query, authData);

    if (claim.data.status === ClaimStatus.PAID) {
      throw new BadRequestException('Cannot update a paid claim');
    }

    Object.assign(claim.data, updateClaimDto);
    return this.claimRepository.save(claim.data);
  }

  async updateClaimStatusForUser(
    query: ClaimQueryDto,
    payload: UpdateClaimStatusDto,
    authData: AuthData,
  ) {
    const { status, reason } = payload;
    const claim = await this.findOneUserClaim(query, authData);

    if (claim.data.status === ClaimStatus.PAID) {
      throw new BadRequestException('Cannot update status of a paid claim');
    }

    claim.data.status = status;
    if (status === ClaimStatus.REJECTED && !reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const newNote = this.noteRepository.create({
      note: reason,
      providerClaim: { id: claim.data.id },
      user: { id: authData.id },
    });

    await this.noteRepository.save(newNote);
    claim.data.notes = [...claim.data.notes, newNote];

    return this.claimRepository.save(claim.data);
  }

  async findByUser(userId: string, authData: AuthData) {
    return this.claimRepository.find({
      where: { user: { id: userId, hmo: { id: authData.hmoId } } },
      relations: ['hospital'],
    });
  }

  async findByHospital(hospitalId: string, authData: AuthData) {
    return this.claimRepository.find({
      where: {
        hospital: { id: hospitalId },
        user: { hmo: { id: authData.hmoId } },
      },
      relations: ['user'],
    });
  }

  async findByStatus(status: ClaimStatus, authData: AuthData) {
    return this.claimRepository.find({
      where: { status, user: { hmo: { id: authData.hmoId } } },
      relations: ['user', 'hospital'],
    });
  }

  async findAllProviderClaims(query: QueryDto, authData: AuthData) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const [providerClaims, total] =
      await this.providerClaimRepository.findAndCount({
        where: { hmo: { id: authData.hmoId } },
        relations: ['hospital', 'user'],
        skip: offset,
        take: limit,
      });

    if (!providerClaims || providerClaims.length === 0) {
      throw new NotFoundException('No provider claims found');
    }

    return {
      success: true,
      message: 'Provider claims retrieved successfully',
      data: providerClaims,
      total,
      page,
      limit,
    };
  }

  async findOneProviderClaim(id: string, authData: AuthData) {
    const providerClaim = await this.providerClaimRepository.findOne({
      where: { id, hmo: { id: authData.hmoId } },
      relations: ['hospital', 'user'],
    });

    if (!providerClaim) {
      throw new NotFoundException('Provider claim not found');
    }

    return {
      success: true,
      message: 'Provider claim retrieved successfully',
      data: providerClaim,
    };
  }

  async updateProviderClaim(
    id: string,
    updateClaimDto: UpdateClaimDto,
    authData: AuthData,
  ) {
    const providerClaim = await this.findOneProviderClaim(id, authData);

    if (providerClaim.data.status === ProcessStatus.APPROVED) {
      throw new BadRequestException('Cannot update a paid provider claim');
    }

    Object.assign(providerClaim.data, updateClaimDto);
    return this.providerClaimRepository.save(providerClaim.data);
  }

  async updateProviderClaimStatus(
    id: string,
    payload: UpdateProviderClaimStatusDto,
    authData: AuthData,
  ) {
    const { status, reason } = payload;
    const providerClaim = await this.findOneProviderClaim(id, authData);

    if (providerClaim.data.status === ProcessStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot update status of a paid provider claim',
      );
    }

    providerClaim.data.status = status;
    if (status === ProcessStatus.REJECTED && !reason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const newNote = this.noteRepository.create({
      note: reason,
      providerClaim: { id: providerClaim.data.id },
      user: { id: authData.id },
    });

    await this.noteRepository.save(newNote);
    providerClaim.data.notes = [...providerClaim.data.notes, newNote];

    return this.providerClaimRepository.save(providerClaim.data);
  }

  async findProviderClaimsByHospital(hospitalId: string, authData: AuthData) {
    return this.providerClaimRepository.find({
      where: {
        hospital: { id: hospitalId },
        hmo: { id: authData.hmoId },
      },
      relations: ['user'],
    });
  }

  async findProviderClaimsByStatus(status: ProcessStatus, authData: AuthData) {
    return this.providerClaimRepository.find({
      where: { status, hmo: { id: authData.hmoId } },
      relations: ['hospital', 'user'],
    });
  }
}
