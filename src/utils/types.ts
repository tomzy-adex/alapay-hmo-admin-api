export enum UserRoles {
  INDIVIDUAL_USER = 'individual-user',
  ALAPAY_ADMIN = 'alapay-admin',
  ALAPAY_CUSTOMER_SERVICE_ADMIN = 'alapay-customer-service-admin',
  ALAPAY_FINANCE_ADMIN = 'alapay-finance-admin',
  HMO_ADMIN = 'hmo-admin',
  HEALTHCARE_PROVIDER = 'healthcare-provider',
  POS_AGENT = 'pos-agent',
}

export enum Status {
  ACTIVE = 'active',
  DORMANT = 'inactive',
  SUSPENDED = 'suspended',
}

export enum ProcessStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  OVERDUE = 'Overdue',
  PARTIAL = 'Partial',
}

export enum OnboardingType {
  HEALTHCARE_PROVIDER_ADMIN = 'healthcare-provider-admin',
  HEALTHCARE_PROVIDER = 'healthcare-provider',
}

export enum PaymentOptionType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  BI_WEEKLY = 'Bi-weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum PaymentDuration {
  DAILY = 1,
  WEEKLY = 7,
  BI_WEEKLY = 14,
  MONTHLY = 30,
  YEARLY = 365,
}

export enum ClaimType {
  OUT_OF_POCKET = 'out-of-pocket',
  PRE_AUTHORIZATION = 'pre-authorization',
  MEDICAL = 'MEDICAL',
  DENTAL = 'DENTAL',
  OPTICAL = 'OPTICAL',
  PHARMACY = 'PHARMACY',
  LABORATORY = 'LABORATORY',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CARD = 'card',
  WALLET = 'wallet',
  NIP_TRANSFER = 'nip-transfer',
}

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export enum DependentType {
  SPOUSE = 'spouse',
  CHILD = 'child',
  PARENT = 'parent',
  OTHER = 'other',
}

export enum DownloadFormat {
  PDF = 'pdf',
  XLSX = 'xlsx',
  CSV = 'csv',
}

export interface INotificationType {
  title: string;
  message: string;
}

export enum ClaimPaymentStatus {
  PAID = 'Paid',
  PARTIALLY_PAID = 'Partially Paid',
  UNPAID = 'Unpaid',
}

export interface IAuditLog {
  /**
   * The action performed, e.g., CREATE, UPDATE, DELETE.
   */
  action: string;

  /**
   * The name of the entity affected, e.g., User, Order.
   */
  entityName: string;

  /**
   * The ID of the entity affected. Can be null for actions without a specific entity.
   */
  entityId: string | null;

  /**
   * The previous state of the entity. Can be null for CREATE or DELETE actions.
   */
  oldValue: Record<string, any> | null;

  /**
   * The new state of the entity. Can be null for DELETE actions.
   */
  newValue: Record<string, any> | null;

  /**
   * The ID of the user who performed the action. Can be null for system-initiated actions.
   */
  userId: string | null;
}
