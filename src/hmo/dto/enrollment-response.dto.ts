import { Status } from '../../utils/types';

export class EnrollmentResponseDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  enrolleeNo: string;
  status: Status;
  planName: string;
  planType: string;
  startDate: Date;
  endDate: Date;
  dependentsCount: number;
  lastPaymentDate: Date;
  nextPaymentDate: Date;
}
