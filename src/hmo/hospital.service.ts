import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as csv from 'csvtojson';
import * as XLSX from 'xlsx';
import { extname } from 'path';
import { readFile } from 'fs/promises';
import { HealthcarePlanRepository } from './repositories/healthcare-plan.repository';
import { HospitalRepository } from './repositories/hospital.repository';
import { HmosQueryDto, HmoQueryDto } from './dto/hmo-query.dto';
import {
  CreateBulkHospitalDto,
  CreateHospitalDto,
  HospitalQueryDto,
  UpdateHospitalDto,
} from './dto/hospital.dto';
import { HmoService } from './hmo.service';
import { In } from 'typeorm';
import { UserRepository } from 'src/user/repositories/user.repository';
import { EmailService } from 'src/email/email.service';
import { NotificationRepository } from 'src/notification/repositories/notification.repository';
import { User } from 'src/user/entities/user.entity';
import { Hospital } from './entities/hospital.entity';
import { SendEmailDto } from 'src/email/dto/send-email.dto';
import { INotificationType } from 'src/utils/types';

@Injectable()
export class HospitalService {
  constructor(
    private readonly hospitalRepository: HospitalRepository,
    private readonly healthcarePlanRepository: HealthcarePlanRepository,
    private readonly hmoService: HmoService,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async addHospital(
    hmoQuery: HmoQueryDto,
    createHospitalDto: CreateHospitalDto,
  ) {
    try {
      const { adminId, hmoId } = hmoQuery;
      const { planIds, name, email } = createHospitalDto;

      // Ensure the admin is authorized
      await this.hmoService.checkAdmin(adminId, hmoId);

      // Check for duplicate hospital (same name and email)
      const existingHospital = await this.hospitalRepository.findOne({
        where: [
          { name: name },
          { email: email }
        ]
      });

      if (existingHospital) {
        if (existingHospital.name === name && existingHospital.email === email) {
          throw new BadRequestException(
            `Hospital with name "${name}" and email "${email}" already exists.`
          );
        } else if (existingHospital.name === name) {
          throw new BadRequestException(
            `Hospital with name "${name}" already exists.`
          );
        } else {
          throw new BadRequestException(
            `Hospital with email "${email}" already exists.`
          );
        }
      }

      // Fetch all plans by their IDs
      const plans = await this.healthcarePlanRepository.find({
        where: { id: In(planIds) }, // Ensure to import 'In' from TypeORM
      });

      // Validate that all plans exist
      if (plans.length !== planIds.length) {
        throw new NotFoundException('One or more plans not found');
      }

      // Create the hospital with multiple plans
      const hospital = this.hospitalRepository.create({
        ...createHospitalDto,
        plans, // Associate multiple plans
      });

      // Save and return the hospital with plans
      const created = await this.hospitalRepository.save(hospital);

      return {
        success: true,
        message: `Hospital added successfully with ${plans.length} plan(s).`,
        data: created,
      };

      return {
        success: true,
        message: `Hospital added successfully with ${plans.length} plan(s).`,
        data: created,
      };
    } catch (error) {
      console.error('Error adding hospital:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        hmoId: hmoQuery.hmoId,
        adminId: hmoQuery.adminId,
        hospitalData: createHospitalDto
      });
      // Re-throw the original error for better debugging
      throw error;
    }
  }

  /**
   * Processes an uploaded CSV or XLSX file and bulk creates hospital records.
   * Expects each row to contain: name, address, contactInfo.
   */
  async bulkUploadCSV(file: Express.Multer.File, hmoQuery: HmosQueryDto) {
    try {
      const { adminId, hmoId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const ext = extname(file.originalname).toLowerCase();
      let hospitalsData: any[] = [];

      if (ext === '.csv') {
        // Parse CSV file
        const fileContent = await readFile(file.path, 'utf8');
        hospitalsData = await csv().fromString(fileContent);
      } else if (ext === '.xlsx' || ext === '.xls') {
        // Parse XLSX file
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        hospitalsData = XLSX.utils.sheet_to_json(worksheet);
      } else {
        throw new BadRequestException(
          'Unsupported file format. Please upload CSV or XLSX file.',
        );
      }

      // Validate and create records
      const hospitalsToCreate: CreateBulkHospitalDto[] = [];
      for (const data of hospitalsData) {
        // Expecting columns: name, address, contactInfo
        if (!data.name || !data.address || !data.contactInfo) {
          throw new BadRequestException(
            `Missing required fields in record: ${JSON.stringify(data)}`,
          );
        }
        hospitalsToCreate.push({ ...data });
      }

      if (hospitalsToCreate.length === 0) {
        throw new BadRequestException(
          'No valid hospital records found in the file.',
        );
      }

      const hospitals = this.hospitalRepository.create(hospitalsToCreate);
      await this.hospitalRepository.save(hospitals);

      return {
        success: true,
        message: `Hospitals added successfully.`,
      };
    } catch (error) {
      throw error;
    }
  }

  async bulkUploadJSON(
    hospitalsData: CreateBulkHospitalDto[],
    hmoQuery: HmosQueryDto,
  ) {
    try {
      const { adminId, hmoId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      // Validate and create records
      const hospitalsToCreate: CreateBulkHospitalDto[] = [];
      for (const data of hospitalsData) {
        // Expecting fields: name, address, contactInfo
        if (!data.name || !data.address || !data.phone || !data.email) {
          throw new BadRequestException(
            `Missing required fields in record: ${JSON.stringify(data)}`,
          );
        }
        hospitalsToCreate.push({ ...data });
      }

      if (hospitalsToCreate.length === 0) {
        throw new BadRequestException('No valid hospital records provided.');
      }

      const hospitals = this.hospitalRepository.create(hospitalsToCreate);
      await this.hospitalRepository.save(hospitals);

      return {
        success: true,
        message: `Hospitals added successfully.`,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateHospital(
    hmoQuery: HospitalQueryDto,
    updateHospitalDto: UpdateHospitalDto,
  ) {
    try {
      const { adminId, hmoId, hospitalId } = hmoQuery;
      const { planIds } = updateHospitalDto;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['plans'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      if (planIds && planIds.length > 0) {
        const plans = await this.healthcarePlanRepository.find({
          where: { id: In(planIds) },
        });

        if (plans.length !== planIds.length) {
          throw new NotFoundException('One or more plans not found');
        }

        hospital.plans = plans;
      }

      Object.assign(hospital, updateHospitalDto);

      const updated = await this.hospitalRepository.save(hospital);

      return {
        success: true,
        message: `Hospital updated successfully.`,
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async addPlansToHospital(hmoQuery: HospitalQueryDto, planIds: string[]) {
    try {
      const { adminId, hmoId, hospitalId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['plans'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      const plans = await this.healthcarePlanRepository.find({
        where: { id: In(planIds) },
      });

      if (plans.length !== planIds.length) {
        throw new NotFoundException('One or more plans not found');
      }

      hospital.plans.push(...plans);

      const updated = await this.hospitalRepository.save(hospital);

      return {
        success: true,
        message: 'Plans added to hospital successfully.',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllHospitals(hmoQuery: HmosQueryDto) {
    try {
      const { adminId, hmoId, page, limit } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const [hospitals, total] = await this.hospitalRepository.findAndCount({
        relations: ['plans'],
        skip: (page - 1) * limit,
        take: limit,
      });

      if (!hospitals || hospitals.length === 0) {
        throw new NotFoundException('No hospitals found');
      }

      return {
        success: true,
        message: 'Hospitals retrieved successfully.',
        data: hospitals,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getHospitalById(hmoQuery: HospitalQueryDto) {
    try {
      const { adminId, hmoId, hospitalId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['plans'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      return {
        success: true,
        message: 'Hospital retrieved successfully.',
        data: hospital,
      };
    } catch (error) {
      throw error;
    }
  }

  async delistHospital(hmoQuery: HospitalQueryDto, reason: string) {
    try {
      const { adminId, hmoId, hospitalId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['plans'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      // Logic to notify users about the delisting
      await this.notifyUsersAboutDelisting(hospital, reason);

      await this.hospitalRepository.remove(hospital);

      return {
        success: true,
        message: 'Hospital delisted and users notified successfully.',
      };
    } catch (error) {
      throw error;
    }
  }

  private async notifyUsersAboutDelisting(hospital: Hospital, reason: string) {
    // Implement the logic to notify users about the delisting
    const users = await this.getUsersAffectedByHospital(hospital.id);
    for (const user of users) {
      await this.sendNotification(user, hospital, reason);
    }
  }

  private async getUsersAffectedByHospital(hospitalId: string) {
    // Fetch users who are affected by the hospital delisting
    return await this.userRepository.find({
      where: { hmo: { plans: { hospitals: { id: hospitalId } } } },
      relations: ['hmo'],
    });
  }

  private async sendNotification(
    user: User,
    hospital: Hospital,
    message: string,
  ) {
    const notification: INotificationType = {
      title: `${hospital.name} has been delisted.`,
      message,
    };

    const { email, firstName, id, hmo } = user;

    const emailPayload: SendEmailDto = {
      to: email,
      subject: notification.title,
      html: `Hello ${firstName},
        <br/><br/>
        ${hospital.name} has been delisted from ${hmo.name}. See more information below:
        <br/><br/>
       <b>${message}</b>
        `,
    };

    console.log(
      `Notifying user ${id} about delisting of hospital ${hospital.id}`,
    );

    await this.notificationRepository.save({
      ...notification,
      user: { id },
    });
    await this.emailService.sendEmail(emailPayload);
  }

  async deletePlanFromHospital(hmoQuery: HospitalQueryDto, planId: string) {
    try {
      const { adminId, hmoId, hospitalId } = hmoQuery;

      await this.hmoService.checkAdmin(adminId, hmoId);

      const hospital = await this.hospitalRepository.findOne({
        where: { id: hospitalId },
        relations: ['plans'],
      });

      if (!hospital) {
        throw new NotFoundException('Hospital not found');
      }

      const planIndex = hospital.plans.findIndex((plan) => plan.id === planId);
      if (planIndex === -1) {
        throw new NotFoundException('Plan not found in hospital');
      }

      hospital.plans.splice(planIndex, 1);

      const updated = await this.hospitalRepository.save(hospital);

      return {
        success: true,
        message: 'Plan removed from hospital successfully.',
        data: updated,
      };
    } catch (error) {
      throw error;
    }
  }
}
