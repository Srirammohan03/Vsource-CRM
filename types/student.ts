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

export type StudentDocumentRecord = {
  id: string;
  studentId: string;
  documentCode: string;
  documentType: string;
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  remarks?: string | null;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentDocumentChecklistItem = {
  code: string;
  name: string;
  category:
    | "PERSONAL"
    | "ACADEMIC"
    | "TEST_SCORE"
    | "APPLICATION"
    | "UNIVERSITY"
    | "LOAN_STUDENT"
    | "LOAN_PARENT"
    | "LOAN_COLLATERAL"
    | "VISA";
  module: "ADMISSION" | "LOAN" | "VISA";
  requiredCount: number;
  allowMultiple: boolean;
  isMandatory: boolean;
  uploadedCount: number;
  isComplete: boolean;
  documents: StudentDocumentRecord[];
};

export type StudentDocumentSummary = {
  totalChecklistItems: number;
  completedChecklistItems: number;
  pendingChecklistItems: number;
  totalRequiredUploads: number;
  completedRequiredUploads: number;
  percentage: number;
};

export type StudentDocumentsResponse = {
  checklist: StudentDocumentChecklistItem[];
  summary: StudentDocumentSummary;
  hasUploadedDocuments: boolean;
};

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
