import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TypeOrmRepository } from '../../config/repository/typeorm.repository';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class SettingsRepository extends TypeOrmRepository<User> {
  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findUserWithRelations(userId: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .leftJoinAndSelect('user.hospitals', 'hospitals')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findUserByEmail(email: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findUserByPhone(phoneNumber: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber })
      .getOne();
  }

  async checkEmailExists(email: string, excludeUserId?: string) {
    const queryBuilder = this.createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    return queryBuilder.getOne();
  }

  async checkPhoneExists(phoneNumber: string, excludeUserId?: string) {
    const queryBuilder = this.createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    return queryBuilder.getOne();
  }

  async getUserCredentials(userId: string) {
    // This would typically query a separate credentials table
    // For now, we'll return an empty array as placeholder
    return [];
  }

  async getUserSettings(userId: string) {
    const user = await this.findUserWithRelations(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      bloodGroup: user.bloodGroup,
      height: user.height,
      genotype: user.genotype,
      gender: user.gender,
      profilePix: user.profilePix,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      accountStatus: user.accountStatus,
      isDeveloper: user.isDeveloper,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
             role: user.role ? {
         id: user.role.id,
         permission: user.role.permission,
       } : null,
      hmo: user.hmo ? {
        id: user.hmo.id,
        name: user.hmo.name,
        email: user.hmo.email,
        phoneNumber: user.hmo.phoneNumber,
      } : null,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        contactInfo: user.organization.contactInfo,
      } : null,
             wallet: user.wallet ? {
         id: user.wallet.id,
         balance: user.wallet.balance,
       } : null,
      hospitals: user.hospitals ? user.hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
      })) : [],
    };
  }

  async updateUserProfile(userId: string, updateData: any) {
    return this.createQueryBuilder()
      .update(User)
      .set(updateData)
      .where('id = :userId', { userId })
      .execute();
  }

  async updateUserPassword(userId: string, hashedPassword: string) {
    return this.createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('id = :userId', { userId })
      .execute();
  }

  async verifyUserEmail(userId: string) {
    return this.createQueryBuilder()
      .update(User)
      .set({ isEmailVerified: true })
      .where('id = :userId', { userId })
      .execute();
  }

  async getUserVerificationStatus(userId: string) {
    const user = await this.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.isEmailVerified', 'user.status'])
      .where('user.id = :userId', { userId })
      .getOne();

    return user ? {
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
    } : null;
  }

  async getUsersByRole(roleId: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('role.id = :roleId', { roleId })
      .getMany();
  }

  async getUsersByHmo(hmoId: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('hmo.id = :hmoId', { hmoId })
      .getMany();
  }

  async getUsersByOrganization(organizationId: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('organization.id = :organizationId', { organizationId })
      .getMany();
  }

  async searchUsers(searchTerm: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phoneNumber ILIKE :search',
        { search: `%${searchTerm}%` }
      )
      .getMany();
  }

  async getUsersByStatus(status: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.status = :status', { status })
      .getMany();
  }

  async getUsersByAccountStatus(accountStatus: string) {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.accountStatus = :accountStatus', { accountStatus })
      .getMany();
  }

  async getUnverifiedUsers() {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.hmo', 'hmo')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.isEmailVerified = :isEmailVerified', { isEmailVerified: false })
      .getMany();
  }

  async getUserActivityStats(userId: string) {
    // This would typically query audit logs and other activity tables
    // For now, we'll return a placeholder structure
    return {
      lastLogin: new Date(),
      totalLogins: 0,
      lastProfileUpdate: new Date(),
      totalProfileUpdates: 0,
      lastPasswordChange: new Date(),
      totalPasswordChanges: 0,
      accountCreated: new Date(),
      daysSinceCreation: 0,
    };
  }

  async getUserSecuritySettings(userId: string) {
    // This would typically query security settings table
    // For now, we'll return a placeholder structure
    return {
      twoFactorEnabled: false,
      loginNotifications: true,
      passwordChangeNotifications: true,
      sessionTimeout: 3600, // in seconds
      maxLoginAttempts: 5,
      lockoutDuration: 900, // in seconds
      lastPasswordChange: new Date(),
      passwordExpiryDays: 90,
    };
  }
}
