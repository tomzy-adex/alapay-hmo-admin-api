import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomerRepository } from './repositories/customer.repository';
import { CustomerSearchDto, CustomerFilterDto } from './dto/customer-query.dto';
import { UserRoles } from '../utils/types';

@Injectable()
export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async getAllCustomers(searchDto: CustomerSearchDto, filterDto: CustomerFilterDto) {
    try {
      const [customers, total] = await this.customerRepository.findCustomersWithFilters(
        searchDto,
        filterDto,
      );

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Customers retrieved successfully',
        data: {
          customers: customers.map(customer => this.sanitizeCustomerData(customer)),
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
      console.error('Error fetching customers:', error);
      throw new InternalServerErrorException('Failed to fetch customers');
    }
  }

  async searchCustomers(searchDto: CustomerSearchDto, filterDto: CustomerFilterDto) {
    try {
      const [customers, total] = await this.customerRepository.findCustomersWithFilters(
        searchDto,
        filterDto,
      );

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Customer search completed successfully',
        data: {
          customers: customers.map(customer => this.sanitizeCustomerData(customer)),
          searchTerm: searchDto.search,
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
      console.error('Error searching customers:', error);
      throw new InternalServerErrorException('Failed to search customers');
    }
  }

  async filterCustomers(searchDto: CustomerSearchDto, filterDto: CustomerFilterDto) {
    try {
      const [customers, total] = await this.customerRepository.findCustomersWithFilters(
        searchDto,
        filterDto,
      );

      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: 'Customer filtering completed successfully',
        data: {
          customers: customers.map(customer => this.sanitizeCustomerData(customer)),
          filters: {
            ...searchDto,
            ...filterDto,
          },
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
      console.error('Error filtering customers:', error);
      throw new InternalServerErrorException('Failed to filter customers');
    }
  }

  async getCustomerById(id: string) {
    try {
      const customer = await this.customerRepository.findCustomerById(id);

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      return {
        success: true,
        message: 'Customer retrieved successfully',
        data: this.sanitizeCustomerData(customer, true), // Include sensitive data for individual view
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching customer by ID:', error);
      throw new InternalServerErrorException('Failed to fetch customer');
    }
  }

  async deleteCustomer(id: string) {
    try {
      const customer = await this.customerRepository.findCustomerById(id);

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Check if customer has active claims or payments
      const hasActiveClaims = customer.claims && customer.claims.length > 0;
      const hasActivePayments = customer.payments && customer.payments.length > 0;

      if (hasActiveClaims || hasActivePayments) {
        throw new BadRequestException(
          'Cannot delete customer with active claims or payments. Please resolve all pending transactions first.',
        );
      }

      // Soft delete the customer
      await this.customerRepository.softDelete(id);

      return {
        success: true,
        message: 'Customer deleted successfully',
        data: {
          id: customer.id,
          email: customer.email,
          deletedAt: new Date(),
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting customer:', error);
      throw new InternalServerErrorException('Failed to delete customer');
    }
  }

  async getCustomerStats() {
    try {
      const stats = await this.customerRepository.getCustomerStats();

      return {
        success: true,
        message: 'Customer statistics retrieved successfully',
        data: stats,
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw new InternalServerErrorException('Failed to fetch customer statistics');
    }
  }

  private sanitizeCustomerData(customer: any, includeSensitive = false) {
    const sanitized = {
      id: customer.id,
      firstName: customer.firstName,
      middleName: customer.middleName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      dob: customer.dob,
      bloodGroup: customer.bloodGroup,
      height: customer.height,
      genotype: customer.genotype,
      gender: customer.gender,
      profilePix: customer.profilePix,
      isEmailVerified: customer.isEmailVerified,
      status: customer.status,
      accountStatus: customer.accountStatus,
      isDeveloper: customer.isDeveloper,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      role: customer.role ? {
        id: customer.role.id,
        permission: customer.role.permission,
      } : null,
      hmo: customer.hmo ? {
        id: customer.hmo.id,
        name: customer.hmo.name,
        email: customer.hmo.email,
        phoneNumber: customer.hmo.phoneNumber,
      } : null,
      organization: customer.organization ? {
        id: customer.organization.id,
        name: customer.organization.name,
        description: customer.organization.description,
      } : null,
      wallet: customer.wallet ? {
        id: customer.wallet.id,
        balance: customer.wallet.balance,
      } : null,
      hospitals: customer.hospitals ? customer.hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        phone: hospital.phone,
        email: hospital.email,
      })) : [],
    };

    // Include sensitive data only for individual customer view
    if (includeSensitive) {
      // sanitized.claims = customer.claims ? customer.claims.map(claim => ({
      //   id: claim.id,
      //   type: claim.type,
      //   description: claim.description,
      //   amount: claim.amount,
      //   status: claim.status,
      //   serviceDate: claim.serviceDate,
      //   createdAt: claim.createdAt,
      // })) : [];

      // sanitized.payments = customer.payments ? customer.payments.map(payment => ({
      //   id: payment.id,
      //   amount: payment.amount,
      //   status: payment.status,
      //   reference: payment.reference,
      //   createdAt: payment.createdAt,
      // })) : [];

      // sanitized.notifications = customer.notifications ? customer.notifications.map(notification => ({
      //   id: notification.id,
      //   title: notification.title,
      //   message: notification.message,
      //   status: notification.status,
      //   createdAt: notification.createdAt,
      // })) : [];

      // sanitized.auditLogs = customer.auditLogs ? customer.auditLogs.map(log => ({
      //   id: log.id,
      //   action: log.action,
      //   resource: log.resource,
      //   createdAt: log.createdAt,
      // })) : [];
    }

    return sanitized;
  }
}
