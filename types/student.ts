import { Lead } from ".";

export interface StudentRecord {
  id: string;

  studentNumber: string;

  studentName: string;

  mobileNumber?: string;

  emailId?: string;

  passportNumber?: string;

  country?: string;

  intake?: string;

  admissionDate?: string | Date;

  applicationType?: string;

  englishRequirement?: string;

  currentStage?: string;

  status: string;

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
  universityName: string;
  courseName: string;
  status: string;
  applicationDate?: string | Date;
}

export interface Remarks {
  id: string;
  note: string;
  createdAt: string | Date;
}
