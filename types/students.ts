export interface Guardian {
  guardianId: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export interface ClassInfo {
  _id: string;
  className: string;
  monthlyFee: number;
}

export interface UserInfo {
  email: string;
  phone: string;
  isActive: boolean;
  isBlocked: boolean;
}

export interface Student {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  admissionDate: string;
  branch: string;
  batchType: string;
  isResidential: boolean;
  isMealIncluded: boolean;
  admissionFee: number;
  payableAdmissionFee: number;
  monthlyFee: number;
  mealFee: number;
  classId: ClassInfo;
  guardianId: Guardian;
  userId: UserInfo;
  presentAddress: string;
  permanentAddress: string;
  currentSessionId: string;
  sessionHistory: Array<{
    sessionId: string;
    year: number;
  }>;
}

export interface StudentResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StudentFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortType?: "asc" | "desc";
  classId?: string;
  branch?: string;
  gender?: string;
  isResidential?: boolean;
  guardianId?: string;
  batchType?: string;
  currentSessionId?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
}
