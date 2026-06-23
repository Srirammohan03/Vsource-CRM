import { Lead } from ".";

export interface StudentRecord {
  id: string;

  studentName: string;

  mobileNumber: string;

  emailId: string;

  password?: string;

  dob?: string | Date;

  gender?: "male" | "female" | "others";

  applicationDate?: string | Date;

  currentStage?: string;

  status: string;

  counselorId: string;

  branch?: {
    id: string;
    name: string;
  };

  counselor?: {
    id: string;
    name: string;
  };

  applications: Applications[];

  visaProfile?: {
    depositStatus?: string;
    depositDeadlineDate?: string | Date;

    ihsPaymentStatus?: string;

    interviewStatus?: string;

    casStatus?: string;
    casDeadlineDate?: string | Date;

    visaStatus?: string;

    universityStartDate?: string | Date;
  } | null;

  loan?: {
    assignee?: string;

    nbfc?: string;

    status?: string;

    pfStatus?: string;

    sanctionedAmount?: string;

    disbursedAmount?: string;
  } | null;

  remarks?: Remarks[];

  documents?: {
    id: string;
    name: string;
    fileUrl: string;
    category?: string;
    uploadedAt: string | Date;
  }[];

  lead?: Lead;

  createdAt: string;
  updatedAt: string;
}

export interface Applications {
  id: string;

  portal?: string;

  universityId: string;
  courseId: string;

  university?: {
    id: string;
    name: string;
  };

  course?: {
    id: string;
    name: string;
  };

  status: string;

  applicationDate?: string | Date;
}

export interface Remarks {
  id: string;
  note: string;
  createdAt: string | Date;
}

export type DocumentModule = "ADMISSION" | "LOAN" | "VISA";

export type DocumentCategory =
  | "PERSONAL"
  | "ACADEMIC"
  | "TEST_SCORE"
  | "APPLICATION"
  | "UNIVERSITY"
  | "LOAN_STUDENT"
  | "LOAN_PARENT"
  | "LOAN_COLLATERAL"
  | "VISA";

export interface DocumentMasterItem {
  id: string;
  name: string;
  code: string;
  module: DocumentModule;
  category: DocumentCategory;
  isMandatory: boolean;
  allowMultiple: boolean;
  requiredCount: number;
  sortOrder: number;
  status: boolean;
}

export interface StudentDocumentItem {
  id: string;
  studentId: string;
  documentMasterId: string;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  remarks: string | null;
  verified: boolean;
  verifiedById: string | null;
  verifiedAt: string | null;
  uploadedById: string | null;
  uploadedAt: string;
  createdAt: string;
  documentMaster?: DocumentMasterItem;
}

export interface DocumentChecklistItem extends DocumentMasterItem {
  uploadedCount: number;
  isComplete: boolean;
  latestDocument: StudentDocumentItem | null;
  documents: StudentDocumentItem[];
}

export interface StudentDocumentSummary {
  totalChecklistItems: number;
  completedChecklistItems: number;
  pendingChecklistItems: number;
  totalRequiredUploads: number;
  completedRequiredUploads: number;
  mandatoryRequiredUploads: number;
  mandatoryCompletedUploads: number;
  percentage: number;
}

export interface StudentDocumentsResponse {
  studentId: string;

  studentName: string;

  hasUploadedDocuments: boolean;

  uploadedDocumentsCount: number;

  emptyStateMessage: string | null;

  summary: StudentDocumentSummary;

  checklist: DocumentChecklistItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UploadStudentDocumentVariables {
  documentMasterId: string;
  file: File;
  remarks?: string;
  onProgress?: (percentage: number) => void;
}

//! Visa
export type StudentVisaLoanProfile = {
  id?: string;
  studentId?: string;
  depositDeadlineDate?: string | null;
  depositStatus?: string | null;
  ihsPaidStatus?: string | null;
  visaPaidStatus?: string | null;
  casDeadlineDate?: string | null;
  casStatus?: string | null;
  visaStatus?: string | null;
  universityStartDate?: string | null;
  fintechAssignee?: string | null;
  nbfc?: string | null;
  loanStatus?: string | null;
  pfStatus?: string | null;
  appliedAmount?: string | number | null;
  sanctionedAmount?: string | number | null;
  disbursed?: boolean;
  disbursedAmount?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentVisaLoanProfilePayload = {
  depositDeadlineDate: string | null;
  depositStatus: string | null;
  ihsPaidStatus: string | null;
  visaPaidStatus: string | null;
  casDeadlineDate: string | null;
  casStatus: string | null;
  visaStatus: string | null;
  universityStartDate: string | null;
  fintechAssignee: string | null;
  nbfc: string | null;
  loanStatus: string | null;
  pfStatus: string | null;
  appliedAmount: number | null;
  sanctionedAmount: number | null;
  disbursed: boolean;
  disbursedAmount: number | null;
};
