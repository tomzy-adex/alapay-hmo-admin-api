import { Status } from '../../utils/types';

export class EnrollmentMetricsDto {
  totalEnrollments: number;
  activeEnrollments: number;
  inactiveEnrollments: number;
  suspendedEnrollments: number;
  enrollmentsByPlan: {
    planName: string;
    count: number;
  }[];
  enrollmentsByStatus: {
    status: Status;
    count: number;
  }[];
}

export class PaymentMetricsDto {
  totalPremiumCollected: number;
  pendingRemittances: number;
  overdueRemittances: number;
  paymentTrends: {
    date: string;
    amount: number;
  }[];
  remittanceSchedule: {
    dueDate: string;
    amount: number;
    status: string;
  }[];
}

export class TransactionHistoryDto {
  id: string;
  date: Date;
  amount: number;
  status: string;
  type: string;
  userDetails: {
    name: string;
    email: string;
    enrolleeNo: string;
  };
  planDetails: {
    name: string;
    type: string;
  };
}

export class PerformanceMetricsDto {
  activeUsers: number;
  totalPremiumCollected: number;
  averagePremiumPerUser: number;
  paymentCompletionRate: number;
  overduePaymentRate: number;
  monthlyTrends: {
    month: string;
    activeUsers: number;
    totalPremium: number;
  }[];
}

export class ServiceAnalyticsDto {
  serviceUsage: {
    serviceName: string;
    usageCount: number;
  }[];
  userDemographics: {
    ageGroup: string;
    count: number;
  }[];
  planPerformance: {
    planName: string;
    activeUsers: number;
    revenue: number;
  }[];
}

export class PaymentAnalyticsDto {
  paymentPatterns: {
    timePeriod: string;
    amount: number;
    count: number;
  }[];
  overduePayments: {
    planType: string;
    count: number;
    amount: number;
  }[];
  revenueTrends: {
    period: string;
    collected: number;
    expected: number;
  }[];
} 