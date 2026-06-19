// crm-frontend-next\app\(dashboard)\studentProfiles\page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  FileCheck2,
  BarChart3,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ChevronRight,
  Filter,
  TrendingUp,
  Percent,
  DollarSign,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Check,
  Briefcase,
  Globe2,
  Trash2,
  Eye,
  FileSignature,
  SlidersHorizontal,
  FolderOpen,
  LayoutGrid,
  TableProperties,
  ArrowUpRight,
  ExternalLink,
  X,
} from "lucide-react";
// import { motion, AnimatePresence } from "motion/react";

// Import our custom operational modules
// import { FilterSidebar } from "./FilterSidebar.tsx";
import { DMSSection, DocumentItem } from "./DMSSection";
import { StudentTable, LocalStudent } from "./StudentTable";
import { AddEditModal } from "./AddEditModal";
// import { FilterSidebar } from "./FilterSidebar";
import { motion, AnimatePresence } from "framer-motion";
interface Application {
  id: string;
  portal: string;
  university: string;
  course: string;
  applicationDate: string;
  status:
  | "Applied"
  | "Pending"
  | "Offer Received"
  | "Priority Offer Received"
  | "Conditional Offer"
  | "Unconditional Offer"
  | "Rejected";
}
interface LoanDetail {
  assignee: string;
  nbfc: "Poonawalla" | "Credila" | "Avanse" | "ICICI" | "Self Funding";
  status: "Pending" | "Approved" | "Sanctioned" | "Rejected";
  pfStatus: "Paid" | "Pending" | "Waived" | "Not Applicable";
  sanctionedAmount: string;
  disbursedAmount: string;
}

interface VisaDetail {
  depositStatus: "Paid" | "Pending" | "Waived";
  ihsPayment: "Paid" | "Pending" | "Not Required";
  interviewStatus: "Completed" | "Pending" | "Waived";
  casStatus: "Received" | "Pending" | "Not Required";
  visaStatus: "Approved" | "Applied" | "Decision Pending" | "Draft Pending";
}

interface Remark {
  date: string;
  note: string;
}

interface Student {
  id: string;
  name: string;
  counsellor: string;
  country:
    | "United Kingdom"
    | "United States"
    | "Canada"
    | "Australia"
    | "Germany";
  intake: "Sep 2026" | "Jan 2026" | "May 2026";
  admissionDate: string;
  applicationType: string;
  passportNumber: string;
  mobileNumber: string;
  email: string;
  englishRequirement: string;
  currentStage:
    | "Lead Created"
    | "Application Submitted"
    | "Offer Received"
    | "Deposit Paid"
    | "Interview Completed"
    | "CAS Received"
    | "Visa Applied"
    | "Visa Approved";
  applications: Application[];
  loan: LoanDetail;
  visaDetails: VisaDetail;
  remarks: Remark[];
}
const initialStudents: Student[] = [
  {
    id: "1",
    name: "Prasad Panjugula",
    counsellor: "Anjali Sharma",
    country: "United Kingdom",
    intake: "Sep 2026",
    admissionDate: "12-Apr-2026",
    applicationType: "Master's Degree",
    passportNumber: "P1298471",
    mobileNumber: "+91 94401 23456",
    email: "prasad.panjugula@gmail.com",
    englishRequirement: "IELTS - 7.5 (Waived)",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-1-1",
        portal: "GVOC",
        university: "Coventry University",
        course: "MSc Automotive Engineering with Work Placement",
        applicationDate: "01-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-1-2",
        portal: "Leverage",
        university: "Aston University",
        course: "MSc Project Management",
        applicationDate: "01-May-2026",
        status: "Unconditional Offer",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "Credila",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹35,00,000",
      disbursedAmount: "₹15,00,000",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "05-Jun-2026", note: "Visa slot booked for 08-Jun filing." },
      { date: "08-Jun-2026", note: "Documents submitted at VFS." },
      { date: "12-Jun-2026", note: "Waiting for CAS." },
      { date: "15-Jun-2026", note: "CAS received." },
    ],
  },
  {
    id: "2",
    name: "Mekapati Sneha Latha Reddy",
    counsellor: "Sophia Sen",
    country: "United States",
    intake: "Sep 2026",
    admissionDate: "15-Apr-2026",
    applicationType: "Master's Degree",
    passportNumber: "P4829384",
    mobileNumber: "+91 98850 12345",
    email: "sneha.reddy@gmail.com",
    englishRequirement: "PTE - 74",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-2-1",
        portal: "Direct",
        university: "New York University",
        course: "MS Computer Science",
        applicationDate: "12-Apr-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-2-2",
        portal: "Centrum",
        university: "Boston University",
        course: "MS Applied Data Analytics",
        applicationDate: "20-Apr-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Nisha Patel",
      nbfc: "Avanse",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹45,00,000",
      disbursedAmount: "₹45,00,000",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "10-May-2026", note: "I-20 Form received from NYU." },
      {
        date: "15-May-2026",
        note: "F1 Visa Interview completed successfully.",
      },
      { date: "25-May-2026", note: "Visa stamped and passport collected." },
    ],
  },
  {
    id: "3",
    name: "Sai Santhosh",
    counsellor: "Ravi Teja",
    country: "United Kingdom",
    intake: "Jan 2026",
    admissionDate: "10-Mar-2026",
    applicationType: "Master's Degree",
    passportNumber: "P4920192",
    mobileNumber: "+91 99345 81920",
    email: "sai.santhosh@gmail.com",
    englishRequirement: "IELTS - 6.5",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-3-1",
        portal: "GVOC",
        university: "University of Hertfordshire",
        course: "MSc Software Engineering",
        applicationDate: "15-Mar-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-3-2",
        portal: "Leverage",
        university: "Cardiff Metropolitan University",
        course: "MBA Finance",
        applicationDate: "18-Mar-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Vikram Varma",
      nbfc: "Poonawalla",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹22,00,000",
      disbursedAmount: "₹0",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "01-Jun-2026", note: "CAS Request submitted." },
      { date: "10-Jun-2026", note: "CAS Statement issued by Hertfordshire." },
      { date: "14-Jun-2026", note: "Visa approved under Priority service." },
    ],
  },
  {
    id: "4",
    name: "Sai Ram Kondamadugu",
    counsellor: "Priya Nair",
    country: "Australia",
    intake: "Sep 2026",
    admissionDate: "02-May-2026",
    applicationType: "Master's Degree",
    passportNumber: "P9281729",
    mobileNumber: "+91 88975 62810",
    email: "sairam.k@gmail.com",
    englishRequirement: "Medium of Instruction (MOI)",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-4-1",
        portal: "Direct",
        university: "Deakin University",
        course: "Master of Data Science",
        applicationDate: "05-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-4-2",
        portal: "GVOC",
        university: "Macquarie University",
        course: "Master of Information Technology",
        applicationDate: "10-May-2026",
        status: "Applied",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "ICICI",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹28,00,000",
      disbursedAmount: "₹10,00,000",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Waived",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "20-May-2026", note: "CoE received from Deakin." },
      { date: "28-May-2026", note: "Visa lodged to Australian Home Affairs." },
      { date: "10-Jun-2026", note: "Subclass 500 Visa Approved." },
    ],
  },
  {
    id: "5",
    name: "Karunakar Reddy",
    counsellor: "Karan Malhotra",
    country: "Canada",
    intake: "Jan 2026",
    admissionDate: "08-Apr-2026",
    applicationType: "PG Diploma",
    passportNumber: "P5738291",
    mobileNumber: "+91 90123 45678",
    email: "karunakar.reddy@gmail.com",
    englishRequirement: "IELTS - 7.0",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-5-1",
        portal: "Leverage",
        university: "York University",
        course: "PG Diploma in Advanced Management",
        applicationDate: "10-Apr-2026",
        status: "Priority Offer Received",
      },
      {
        id: "app-5-2",
        portal: "GVOC",
        university: "Lambton College",
        course: "PG Diploma in Mobile Application Development",
        applicationDate: "14-Apr-2026",
        status: "Rejected",
      },
    ],
    loan: {
      assignee: "Vikram Varma",
      nbfc: "Credila",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹20,00,000",
      disbursedAmount: "₹20,00,000",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Waived",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "25-Apr-2026", note: "LOA (Letter of Acceptance) Received." },
      { date: "02-May-2026", note: "GIC Account funded with $20,635." },
      { date: "29-May-2026", note: "Study Permit approved." },
    ],
  },
  {
    id: "6",
    name: "Akhil Kumar",
    counsellor: "Ravi Teja",
    country: "Germany",
    intake: "Sep 2026",
    admissionDate: "10-May-2026",
    applicationType: "Master's Degree",
    passportNumber: "P3921029",
    mobileNumber: "+91 91234 56789",
    email: "akhil.kumar@gmail.com",
    englishRequirement: "TOEFL - 98",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-6-1",
        portal: "Direct",
        university: "IU International University of Applied Sciences",
        course: "Master of Business Administration",
        applicationDate: "12-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-6-2",
        portal: "Centrum",
        university: "SRH Berlin University of Applied Sciences",
        course: "MSc Cyber Security",
        applicationDate: "15-May-2026",
        status: "Applied",
      },
    ],
    loan: {
      assignee: "Nisha Patel",
      nbfc: "Self Funding",
      status: "Approved",
      pfStatus: "Not Applicable",
      sanctionedAmount: "-",
      disbursedAmount: "-",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Not Required",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "18-May-2026", note: "Admission offer accepted." },
      { date: "24-May-2026", note: "Blocked Account funded with €11,208." },
      {
        date: "12-Jun-2026",
        note: "German Embassy visa interview completed and approved.",
      },
    ],
  },
  {
    id: "7",
    name: "Harika Devi",
    counsellor: "Anjali Sharma",
    country: "United Kingdom",
    intake: "Sep 2026",
    admissionDate: "30-Apr-2026",
    applicationType: "Master's Degree",
    passportNumber: "P1829302",
    mobileNumber: "+91 93456 78901",
    email: "harika.devi@gmail.com",
    englishRequirement: "IELTS - 7.0",
    currentStage: "Visa Approved",
    applications: [
      {
        id: "app-7-1",
        portal: "GVOC",
        university: "University of Greenwich",
        course: "MSc Big Data and Business Intelligence",
        applicationDate: "02-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-7-2",
        portal: "Leverage",
        university: "University of East London",
        course: "MSc Information Security",
        applicationDate: "05-May-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "Avanse",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹24,00,000",
      disbursedAmount: "₹12,00,000",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Approved",
    },
    remarks: [
      { date: "15-May-2026", note: "Deposit of £4,000 paid." },
      { date: "22-May-2026", note: "CAS Statement received." },
      { date: "06-Jun-2026", note: "Visa approved." },
    ],
  },
  {
    id: "8",
    name: "Vamsi Krishna",
    counsellor: "Sophia Sen",
    country: "United Kingdom",
    intake: "Sep 2026",
    admissionDate: "28-Apr-2026",
    applicationType: "Master's Degree",
    passportNumber: "P8394019",
    mobileNumber: "+91 94567 89012",
    email: "vamsi.krishna@gmail.com",
    englishRequirement: "Medium of Instruction (MOI)",
    currentStage: "Visa Applied",
    applications: [
      {
        id: "app-8-1",
        portal: "Leverage",
        university: "Cardiff Metropolitan University",
        course: "MSc Data Science",
        applicationDate: "01-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-8-2",
        portal: "GVOC",
        university: "Coventry University",
        course: "MSc Cyber Security",
        applicationDate: "04-May-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Nisha Patel",
      nbfc: "Credila",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹30,00,000",
      disbursedAmount: "₹0",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Applied",
    },
    remarks: [
      { date: "01-Jun-2026", note: "Deposits fully paid to Cardiff Met." },
      { date: "08-Jun-2026", note: "CAS Issued." },
      {
        date: "14-Jun-2026",
        note: "Visa application submitted. Biometrics completed.",
      },
    ],
  },
  {
    id: "9",
    name: "Nikhil Reddy",
    counsellor: "Priya Nair",
    country: "United States",
    intake: "Sep 2026",
    admissionDate: "10-Apr-2026",
    applicationType: "Master's Degree",
    passportNumber: "P2938102",
    mobileNumber: "+91 95678 90123",
    email: "nikhil.reddy@gmail.com",
    englishRequirement: "Duolingo - 125",
    currentStage: "Visa Applied",
    applications: [
      {
        id: "app-9-1",
        portal: "Direct",
        university: "University of Texas at Dallas",
        course: "MS Business Analytics",
        applicationDate: "11-Apr-2026",
        status: "Priority Offer Received",
      },
      {
        id: "app-9-2",
        portal: "Centrum",
        university: "University of Houston",
        course: "MS Information Systems",
        applicationDate: "20-Apr-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "Avanse",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹40,00,000",
      disbursedAmount: "₹0",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Paid",
      interviewStatus: "Pending",
      casStatus: "Received",
      visaStatus: "Applied",
    },
    remarks: [
      { date: "04-May-2026", note: "I-20 document issued by UT Dallas." },
      { date: "29-May-2026", note: "SEVIS Fee funded." },
      { date: "10-Jun-2026", note: "Visa slot booked for June 22nd." },
    ],
  },
  {
    id: "10",
    name: "Sandeep Kumar",
    counsellor: "Karan Malhotra",
    country: "United Kingdom",
    intake: "Sep 2026",
    admissionDate: "10-May-2026",
    applicationType: "Master's Degree",
    passportNumber: "P1029384",
    mobileNumber: "+91 96789 01234",
    email: "sandeep.k@gmail.com",
    englishRequirement: "IELTS - 6.5",
    currentStage: "CAS Received",
    applications: [
      {
        id: "app-10-1",
        portal: "GVOC",
        university: "University of Bedfordshire",
        course: "MSc Applied Computing",
        applicationDate: "12-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-10-2",
        portal: "Leverage",
        university: "Leeds Beckett University",
        course: "MSc Software Engineering",
        applicationDate: "15-May-2026",
        status: "Conditional Offer",
      },
    ],
    loan: {
      assignee: "Vikram Varma",
      nbfc: "Poonawalla",
      status: "Sanctioned",
      pfStatus: "Pending",
      sanctionedAmount: "₹18,00,000",
      disbursedAmount: "₹0",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Pending",
      interviewStatus: "Completed",
      casStatus: "Received",
      visaStatus: "Draft Pending",
    },
    remarks: [
      { date: "28-May-2026", note: "Pre-CAS interview cleared successfully." },
      {
        date: "12-Jun-2026",
        note: "Deposit cleared in the University bank account.",
      },
      { date: "15-Jun-2026", note: "CAS letter received from Bedfordshire!" },
    ],
  },
  {
    id: "11",
    name: "Rohith Kumar",
    counsellor: "Ravi Teja",
    country: "Canada",
    intake: "Sep 2026",
    admissionDate: "29-Apr-2026",
    applicationType: "PG Diploma",
    passportNumber: "P1203948",
    mobileNumber: "+91 97890 12345",
    email: "rohith.kumar@gmail.com",
    englishRequirement: "PTE - 68",
    currentStage: "Deposit Paid",
    applications: [
      {
        id: "app-11-1",
        portal: "Leverage",
        university: "Conestoga College",
        course: "PG Diploma Web Development",
        applicationDate: "01-May-2026",
        status: "Unconditional Offer",
      },
      {
        id: "app-11-2",
        portal: "GVOC",
        university: "Fanshawe College",
        course: "PG Diploma Information Security",
        applicationDate: "05-May-2026",
        status: "Applied",
      },
    ],
    loan: {
      assignee: "Nisha Patel",
      nbfc: "Credila",
      status: "Sanctioned",
      pfStatus: "Paid",
      sanctionedAmount: "₹15,00,000",
      disbursedAmount: "₹0",
    },
    visaDetails: {
      depositStatus: "Paid",
      ihsPayment: "Pending",
      interviewStatus: "Waived",
      casStatus: "Pending",
      visaStatus: "Draft Pending",
    },
    remarks: [
      { date: "15-May-2026", note: "Admission offer received from Conestoga." },
      { date: "05-Jun-2026", note: "Deposit of CAD $9,500 paid successfully." },
      {
        date: "12-Jun-2026",
        note: "Waiting for official Letter of Acceptance (LOA) for visa filing.",
      },
    ],
  },
  {
    id: "12",
    name: "Tejaswini",
    counsellor: "Priya Nair",
    country: "United Kingdom",
    intake: "Jan 2026",
    admissionDate: "28-May-2026",
    applicationType: "Master's Degree",
    passportNumber: "P8291038",
    mobileNumber: "+91 98901 23456",
    email: "tejaswini@gmail.com",
    englishRequirement: "IELTS - 6.5",
    currentStage: "Application Submitted",
    applications: [
      {
        id: "app-12-1",
        portal: "GVOC",
        university: "University of Leeds",
        course: "MSc Data Science",
        applicationDate: "01-Jun-2026",
        status: "Applied",
      },
      {
        id: "app-12-2",
        portal: "Leverage",
        university: "Coventry University",
        course: "MSc Embedded Systems",
        applicationDate: "05-Jun-2026",
        status: "Pending",
      },
    ],
    loan: {
      assignee: "Vikram Varma",
      nbfc: "Avanse",
      status: "Pending",
      pfStatus: "Pending",
      sanctionedAmount: "-",
      disbursedAmount: "-",
    },
    visaDetails: {
      depositStatus: "Pending",
      ihsPayment: "Pending",
      interviewStatus: "Pending",
      casStatus: "Pending",
      visaStatus: "Draft Pending",
    },
    remarks: [
      {
        date: "02-Jun-2026",
        note: "Application submitted to University of Leeds.",
      },
      {
        date: "10-Jun-2026",
        note: "Academic transcripts compiled and uploaded.",
      },
    ],
  },
  {
    id: "13",
    name: "Keerthana",
    counsellor: "Sophia Sen",
    country: "United States",
    intake: "Sep 2026",
    admissionDate: "10-Jun-2026",
    applicationType: "Master's Degree",
    passportNumber: "P4829120",
    mobileNumber: "+91 99012 34567",
    email: "keerthana@gmail.com",
    englishRequirement: "Duolingo - 115",
    currentStage: "Lead Created",
    applications: [
      {
        id: "app-13-1",
        portal: "Centrum",
        university: "University of South Florida",
        course: "MS Business Analytics",
        applicationDate: "12-Jun-2026",
        status: "Applied",
      },
      {
        id: "app-13-2",
        portal: "Direct",
        university: "Arizona State University",
        course: "MS Information Technology",
        applicationDate: "14-Jun-2026",
        status: "Applied",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "Poonawalla",
      status: "Pending",
      pfStatus: "Pending",
      sanctionedAmount: "-",
      disbursedAmount: "-",
    },
    visaDetails: {
      depositStatus: "Pending",
      ihsPayment: "Pending",
      interviewStatus: "Pending",
      casStatus: "Pending",
      visaStatus: "Draft Pending",
    },
    remarks: [
      {
        date: "12-Jun-2026",
        note: "Lead generated and assigned to Sophia Sen.",
      },
      {
        date: "14-Jun-2026",
        note: "First counseling session done. USA options suggested.",
      },
    ],
  },
  {
    id: "14",
    name: "Abhinay",
    counsellor: "Anjali Sharma",
    country: "Canada",
    intake: "May 2026",
    admissionDate: "05-Jun-2026",
    applicationType: "PG Diploma",
    passportNumber: "P9210293",
    mobileNumber: "+91 90123 45670",
    email: "abhinay@gmail.com",
    englishRequirement: "IELTS - 6.0",
    currentStage: "Lead Created",
    applications: [
      {
        id: "app-14-1",
        portal: "Leverage",
        university: "Seneca College",
        course: "PG Diploma Computer Programming",
        applicationDate: "10-Jun-2026",
        status: "Pending",
      },
    ],
    loan: {
      assignee: "Nisha Patel",
      nbfc: "Self Funding",
      status: "Pending",
      pfStatus: "Not Applicable",
      sanctionedAmount: "-",
      disbursedAmount: "-",
    },
    visaDetails: {
      depositStatus: "Pending",
      ihsPayment: "Pending",
      interviewStatus: "Pending",
      casStatus: "Pending",
      visaStatus: "Draft Pending",
    },
    remarks: [
      { date: "11-Jun-2026", note: "SOP guidelines shared with applicant." },
    ],
  },
  {
    id: "15",
    name: "Mahesh Babu",
    counsellor: "Karan Malhotra",
    country: "Australia",
    intake: "Sep 2026",
    admissionDate: "11-Jun-2026",
    applicationType: "Master's Degree",
    passportNumber: "P5102938",
    mobileNumber: "+91 91234 56701",
    email: "mahesh.babu@gmail.com",
    englishRequirement: "Medium of Instruction (MOI)",
    currentStage: "Lead Created",
    applications: [
      {
        id: "app-15-1",
        portal: "Direct",
        university: "RMIT University",
        course: "Master of Cybersecurity",
        applicationDate: "11-Jun-2026",
        status: "Applied",
      },
    ],
    loan: {
      assignee: "Sanjay Kumar",
      nbfc: "Credila",
      status: "Rejected",
      pfStatus: "Pending",
      sanctionedAmount: "-",
      disbursedAmount: "-",
    },
    visaDetails: {
      depositStatus: "Pending",
      ihsPayment: "Pending",
      interviewStatus: "Pending",
      casStatus: "Pending",
      visaStatus: "Draft Pending",
    },
    remarks: [
      {
        date: "12-Jun-2026",
        note: "Credila loan application rejected due to insufficient collateral value. Seeking other lenders.",
      },
    ],
  },
];
const recentActivities = [
  {
    id: "act-1",
    type: "Visa Slot Booked",
    student: "Prasad Panjugula",
    counsellor: "Anjali Sharma",
    date: "05-Jun-2026",
    details: "VFS booking completed for June 8th.",
  },
  {
    id: "act-2",
    type: "Offer Received",
    student: "Sandeep Kumar",
    counsellor: "Karan Malhotra",
    date: "12-Jun-2026",
    details: "Unconditional Offer from Bedfordshire.",
  },
  {
    id: "act-3",
    type: "CAS Received",
    student: "Prasad Panjugula",
    counsellor: "Anjali Sharma",
    date: "15-Jun-2026",
    details: "CAS received from Coventry University.",
  },
  {
    id: "act-4",
    type: "Loan Approved",
    student: "Akhil Kumar",
    counsellor: "Ravi Teja",
    date: "12-Jun-2026",
    details: "Self-funding source verified and approved.",
  },
];
export default function Home() {
  // Backwards compatible initial state mapped with extra credentials & local documents
  const [students, setStudents] = useState<LocalStudent[]>(() => {
    return initialStudents.map((s, index) => {
      const firstNames = s.name.split(" ");
      const pName = firstNames[0] || "Student";
      return {
        ...s,
        password: `Pass${pName}@2026`,
        twelfthEnglishMoi:
          index % 3 === 0
            ? "MOI Waiver Letter"
            : index % 3 === 1
              ? "82% in XII English"
              : "88% in XII English",
        documents: [
          {
            id: `doc-${s.id}-1`,
            category: "Passport",
            name: `${pName}_Passport_Full.pdf`,
            fileType: "pdf",
            uploadedAt: "12-May-2026",
            fileSize: "1.2 MB",
            content: `OFFICIAL PASSPORT RECORD\nRepublic of India\nPASSPORT REGISTRATION: ${s.passportNumber}\nFull Name: ${s.name}\nNationality: INDIAN\nSex: Male\nDate of Expiry: 14-Aug-2032`,
          },
          {
            id: `doc-${s.id}-2`,
            category: "12th Marks Memo",
            name: `${pName}_12th_Transcript.pdf`,
            fileType: "pdf",
            uploadedAt: "12-May-2026",
            fileSize: "780 KB",
            content: `COUNCIL FOR THE INDIAN SCHOOL CERTIFICATE EXAMINATIONS\nCandidate: ${s.name}\nEnglish: 85/100\nMathematics: 92/100\nPhysics: 89/100\nMOI Assessment: English Language Medium certified.`,
          },
          {
            id: `doc-${s.id}-3`,
            category: "Lears SOP",
            name: `${pName}_StatementOfPurpose.pdf`,
            fileType: "pdf",
            uploadedAt: "14-May-2026",
            fileSize: "410 KB",
            content: `STATEMENT OF PURPOSE\nTo the Academic Registry,\nMy name is ${s.name}. I am writing to express my desire to pursue further studies in ${s.applications[0]?.course || "Computer Science"} of ${s.applications[0]?.university || "Target Institution"}.`,
          },
        ],
      };
    });
  });

  const [currentView, setCurrentView] = useState<"students">("students");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Keep this page synchronized with the application-level dark class.
  // The previous code used true as light mode in the page but dark mode in
  // StudentTable, which caused opposite card/text colours.
  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setIsDarkMode(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Detail page state variables
  const [detailTab, setDetailTab] = useState<
    "info" | "documents" | "applications" | "finance" | "visa" | "remarks"
  >("info");

  // Search state
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);

  // Advanced Filters State Management
  const [filterCounsellor, setFilterCounsellor] = useState<string>("All");
  const [filterIntake, setFilterIntake] = useState<string>("All");
  const [filterCountry, setFilterCountry] = useState<string>("All");
  const [filterVisaStatus, setFilterVisaStatus] = useState<string>("All");
  const [filterLoanStatus, setFilterLoanStatus] = useState<string>("All");
  const [filterCasStatus, setFilterCasStatus] = useState<string>("All");
  const [filterNbfc, setFilterNbfc] = useState<string>("All");
  const [filterFintechAssignee, setFilterFintechAssignee] =
    useState<string>("All");
  const [filterAppStatus, setFilterAppStatus] = useState<string>("All");
  const [filterUniversity, setFilterUniversity] = useState<string>("All");
  const [filterDateType, setFilterDateType] = useState<string>("All");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Modals / Toggles
  // const [isFilterSidebarOpen, setIsFilterSidebarOpen] =
  //   useState<boolean>(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<LocalStudent | null>(null);

  // Application sub-module (Tab 3) workflow states
  const [appLayout, setAppLayout] = useState<"cards" | "table">("cards");
  const [showAddAppForm, setShowAddAppForm] = useState<boolean>(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [appPortal, setAppPortal] = useState<string>("GVOC");
  const [appDate, setAppDate] = useState<string>("15-Jun-2026");
  const [appUniversity, setAppUniversity] = useState<string>("");
  const [appCourse, setAppCourse] = useState<string>("");
  const [appIntake, setAppIntake] = useState<string>("Sep 2026");
  const [appStatus, setAppStatus] = useState<string>("Pending");

  // Notification Banner triggers
  const [notifications, setNotifications] = useState<
    Array<{ id: string; text: string; time: string; read: boolean }>
  >([
    {
      id: "n-1",
      text: "New Visa SLA guidelines updated for UK VFS.",
      time: "10 mins ago",
      read: false,
    },
    {
      id: "n-2",
      text: "Financial sanction pre-draft requested for Sandeep.",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "n-3",
      text: "CAS Issued for Student Prasad Panjugula!",
      time: "1 day ago",
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Add/Edit basic user remark state
  const [newRemarkText, setNewRemarkText] = useState<string>("");

  // Reset Filters wrapper
  const resetFilters = () => {
    setFilterCounsellor("All");
    setFilterIntake("All");
    setFilterCountry("All");
    setFilterVisaStatus("All");
    setFilterLoanStatus("All");
    setFilterCasStatus("All");
    setFilterNbfc("All");
    setFilterFintechAssignee("All");
    setFilterAppStatus("All");
    setFilterUniversity("All");
    setFilterDateType("All");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterCounsellor !== "All") count++;
    if (filterCountry !== "All") count++;
    if (filterIntake !== "All") count++;
    if (filterVisaStatus !== "All") count++;
    if (filterLoanStatus !== "All") count++;
    if (filterCasStatus !== "All") count++;
    if (filterNbfc !== "All") count++;
    if (filterFintechAssignee !== "All") count++;
    if (filterAppStatus !== "All") count++;
    if (filterUniversity !== "All") count++;
    if (filterDateType !== "All") count++;
    return count;
  }, [
    filterCounsellor,
    filterCountry,
    filterIntake,
    filterVisaStatus,
    filterLoanStatus,
    filterCasStatus,
    filterNbfc,
    filterFintechAssignee,
    filterAppStatus,
    filterUniversity,
    filterDateType,
  ]);

  // Unique list derivations from the live dataset for dropdown options
  const uniqueUniversities = useMemo(() => {
    const list = new Set<string>();
    students.forEach((s) =>
      s.applications.forEach((app) => list.add(app.university)),
    );
    return Array.from(list).filter(Boolean);
  }, [students]);

  const uniqueFintechAssignees = useMemo(() => {
    const list = new Set<string>();
    students.forEach((s) => {
      if (s.loan.assignee) list.add(s.loan.assignee);
    });
    return Array.from(list).filter(Boolean);
  }, [students]);

  // Admission parsed dates solver
  const parseStudentAdmissionDate = (dateStr: string): Date => {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date();
    const day = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);
    const mNames: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month =
      mNames[parts[1].toLowerCase()] !== undefined
        ? mNames[parts[1].toLowerCase()]
        : 5;
    return new Date(year, month, day);
  };

  const isDateInFilter = (
    studentDateStr: string,
    filterType: string,
    customStart: string,
    customEnd: string,
  ): boolean => {
    if (filterType === "All") return true;
    const studentDate = parseStudentAdmissionDate(studentDateStr);
    const sTime = studentDate.getTime();

    switch (filterType) {
      case "Today": {
        const target = new Date(2026, 5, 15);
        return (
          studentDate.getFullYear() === target.getFullYear() &&
          studentDate.getMonth() === target.getMonth() &&
          studentDate.getDate() === target.getDate()
        );
      }
      case "Yesterday": {
        const target = new Date(2026, 5, 14);
        return (
          studentDate.getFullYear() === target.getFullYear() &&
          studentDate.getMonth() === target.getMonth() &&
          studentDate.getDate() === target.getDate()
        );
      }
      case "Last 7 Days": {
        const minDate = new Date(2026, 5, 9);
        const maxDate = new Date(2026, 5, 15, 23, 59, 59);
        return sTime >= minDate.getTime() && sTime <= maxDate.getTime();
      }
      case "Last 30 Days": {
        const minDate = new Date(2026, 4, 16); // May 16, 2026
        const maxDate = new Date(2026, 5, 15, 23, 59, 59);
        return sTime >= minDate.getTime() && sTime <= maxDate.getTime();
      }
      case "This Month": {
        return (
          studentDate.getFullYear() === 2026 && studentDate.getMonth() === 5
        );
      }
      case "Last Month": {
        return (
          studentDate.getFullYear() === 2026 && studentDate.getMonth() === 4
        );
      }
      case "This Quarter": {
        return (
          studentDate.getFullYear() === 2026 &&
          [3, 4, 5].includes(studentDate.getMonth())
        );
      }
      case "Last Quarter": {
        return (
          studentDate.getFullYear() === 2026 &&
          [0, 1, 2].includes(studentDate.getMonth())
        );
      }
      case "This Year": {
        return studentDate.getFullYear() === 2026;
      }
      case "Custom Date": {
        if (!customStart) return true;
        const start = new Date(customStart);
        const end = customEnd ? new Date(customEnd) : new Date(2026, 5, 15);
        end.setHours(23, 59, 59, 999);
        return sTime >= start.getTime() && sTime <= end.getTime();
      }
      default:
        return true;
    }
  };

  // Sorted & Filtered Students list
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search matching criteria
      if (globalSearch.trim() !== "") {
        const q = globalSearch.toLowerCase();
        const matchesSearch =
          student.name.toLowerCase().includes(q) ||
          student.counsellor.toLowerCase().includes(q) ||
          student.passportNumber.toLowerCase().includes(q) ||
          student.email.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (filterCounsellor !== "All" && student.counsellor !== filterCounsellor)
        return false;
      if (filterIntake !== "All" && student.intake !== filterIntake)
        return false;
      if (filterCountry !== "All" && student.country !== filterCountry)
        return false;
      if (
        filterVisaStatus !== "All" &&
        student.visaDetails.visaStatus !== filterVisaStatus
      )
        return false;
      if (
        filterLoanStatus !== "All" &&
        student.loan.status !== filterLoanStatus
      )
        return false;
      if (
        filterCasStatus !== "All" &&
        student.visaDetails.casStatus !== filterCasStatus
      )
        return false;
      if (filterNbfc !== "All" && student.loan.nbfc !== filterNbfc)
        return false;
      if (
        filterFintechAssignee !== "All" &&
        student.loan.assignee !== filterFintechAssignee
      )
        return false;

      if (filterAppStatus !== "All") {
        const hasMatchingApp = student.applications.some(
          (app) => app.status === filterAppStatus,
        );
        if (!hasMatchingApp) return false;
      }

      if (filterUniversity !== "All") {
        const hasMatchingUni = student.applications.some(
          (app) => app.university === filterUniversity,
        );
        if (!hasMatchingUni) return false;
      }

      if (
        !isDateInFilter(
          student.admissionDate,
          filterDateType,
          customStartDate,
          customEndDate,
        )
      )
        return false;

      return true;
    });
  }, [
    students,
    globalSearch,
    filterCounsellor,
    filterIntake,
    filterCountry,
    filterVisaStatus,
    filterLoanStatus,
    filterCasStatus,
    filterNbfc,
    filterFintechAssignee,
    filterAppStatus,
    filterUniversity,
    filterDateType,
    customStartDate,
    customEndDate,
  ]);

  // Target statistics strictly reactive to filters / specs
  const stats = useMemo(() => {
    const totalCount = filteredStudents.length;

    // Spec default alignment: Total count 15, applications 28, etc.
    const appsCount = filteredStudents.reduce(
      (sum, s) => sum + s.applications.length,
      0,
    );

    // Offers Status matching conditionally acceptable
    const offersCount = filteredStudents.reduce((sum, s) => {
      const matchOffers = s.applications.filter((app) =>
        [
          "Offer Received",
          "Priority Offer Received",
          "Conditional Offer",
          "Unconditional Offer",
        ].includes(app.status),
      );
      return sum + matchOffers.length;
    }, 0);

    // CAS Received (CAS status value is Received or CAS Received)
    const casCount = filteredStudents.filter((s) =>
      ["Received", "CAS Received"].includes(s.visaDetails.casStatus),
    ).length;

    // Visa Approved count
    const visaCount = filteredStudents.filter((s) =>
      ["Approved", "Visa Approved"].includes(s.visaDetails.visaStatus),
    ).length;

    // Loan Approved or Sanctioned cases
    const loansCount = filteredStudents.filter((s) =>
      ["Sanctioned", "Approved"].includes(s.loan.status),
    ).length;

    return {
      totalStudents: totalCount,
      applicationsSubmitted: appsCount,
      offersReceived: offersCount,
      casReceived: casCount,
      visaApproved: visaCount,
      loansSanctioned: loansCount,
    };
  }, [filteredStudents]);

  // Dynamic visual charts aggregation helpers (SVG rendered)
  const chartsData = useMemo(() => {
    // Applications by intake cycle
    const intakes = { "Sep 2026": 0, "Jan 2026": 0, "May 2026": 0 };
    filteredStudents.forEach((s) => {
      if (s.intake in intakes) intakes[s.intake] += s.applications.length;
    });

    // Visa Status Breakdown
    const visas = {
      "Visa Approved": 0,
      "Visa Applied": 0,
      "Visa Decision Pending": 0,
      "Visa Rejected": 0,
      "Draft Pending": 0,
    };
    filteredStudents.forEach((s) => {
      const vs = s.visaDetails.visaStatus as string;
      if (vs === "Visa Approved" || vs === "Approved") {
        visas["Visa Approved"]++;
      } else if (vs === "Visa Applied" || vs === "Applied") {
        visas["Visa Applied"]++;
      } else if (vs === "Visa Decision Pending" || vs === "Decision Pending") {
        visas["Visa Decision Pending"]++;
      } else if (vs === "Visa Rejected" || vs === "Rejected") {
        visas["Visa Rejected"]++;
      } else {
        visas["Draft Pending"]++;
      }
    });

    // Top University applications list
    const unis: Record<string, number> = {};
    filteredStudents.forEach((s) =>
      s.applications.forEach(
        (a) => (unis[a.university] = (unis[a.university] || 0) + 1),
      ),
    );
    const sortedUnis = Object.entries(unis)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Loan status metrics
    const loans = { Sanctioned: 0, Approved: 0, Pending: 0, Rejected: 0 };
    filteredStudents.forEach((s) => {
      const ls = s.loan.status;
      if (ls in loans) loans[ls]++;
    });

    // Countries metrics
    const countries: Record<string, number> = {};
    filteredStudents.forEach(
      (s) => (countries[s.country] = (countries[s.country] || 0) + 1),
    );

    // Counsellors metrics
    const counsellors: Record<string, number> = {};
    filteredStudents.forEach(
      (s) => (counsellors[s.counsellor] = (counsellors[s.counsellor] || 0) + 1),
    );

    return {
      intake: Object.entries(intakes).map(([name, value]) => ({ name, value })),
      visa: Object.entries(visas).map(([name, value]) => ({ name, value })),
      university: sortedUnis.map(([name, value]) => ({ name, value })),
      loan: Object.entries(loans).map(([name, value]) => ({ name, value })),
      country: Object.entries(countries).map(([name, value]) => ({
        name,
        value,
      })),
      counsellor: Object.entries(counsellors).map(([name, value]) => ({
        name,
        value,
      })),
    };
  }, [filteredStudents]);

  // Selected Student Object active state lookup
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Handle student router selector
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setCurrentView("students");
    setDetailTab("info");
    setGlobalSearch("");
    setShowSearchResults(false);
  };

  // EDIT BASIC PROFILE WRAPPER
  const openEditModal = (student: LocalStudent) => {
    setStudentToEdit(student);
    setIsAddEditOpen(true);
  };

  const openAddModal = () => {
    setStudentToEdit(null);
    setIsAddEditOpen(true);
  };

  // DELETE CASE FILE
  const handleDeleteStudent = (id: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this student's folders and case records? This is irreversible.",
      )
    ) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudentId === id) {
        setSelectedStudentId(null);
      }
    }
  };

  // CHANGE STATUS SELECT FROM TABLE INLINE OR FROM TIMELINE (Wired with progress colors!)
  const handleTableStatusChange = (
    studentId: string,
    field: string,
    value: any,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updated = { ...s };

          if (field === "appStatus") {
            const apps = [...updated.applications];
            if (apps[0]) {
              apps[0] = { ...apps[0], status: value };
            }
            updated.applications = apps;
          }
          if (field === "depositStatus") {
            updated.visaDetails = {
              ...updated.visaDetails,
              depositStatus: value,
            };
          }
          if (field === "ihsPayment") {
            updated.visaDetails = { ...updated.visaDetails, ihsPayment: value };
          }
          if (field === "interviewStatus") {
            updated.visaDetails = {
              ...updated.visaDetails,
              interviewStatus: value,
            };
          }
          if (field === "casStatus") {
            updated.visaDetails = { ...updated.visaDetails, casStatus: value };
          }
          if (field === "visaStatus") {
            updated.visaDetails = { ...updated.visaDetails, visaStatus: value };
            if (value === "Visa Approved" || value === "Approved") {
              updated.currentStage = "Visa Approved";
            } else if (value === "Visa Applied" || value === "Applied") {
              updated.currentStage = "Visa Applied";
            }
          }
          if (field === "loanStatus") {
            updated.loan = { ...updated.loan, status: value };
          }
          if (field === "pfStatus") {
            updated.loan = { ...updated.loan, pfStatus: value };
          }
          if (field === "nbfc") {
            updated.loan = { ...updated.loan, nbfc: value };
          }
          return updated;
        }
        return s;
      }),
    );
  };

  // SAVE EDIT/ADD PROFILE FORM SUBMIT COMMAND
  const handleSaveStudentPayload = (payload: Partial<LocalStudent>) => {
    if (studentToEdit) {
      // Updating
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === studentToEdit.id) {
            const updated = {
              ...s,
              ...payload,
              loan: {
                ...s.loan,
                ...payload.loan,
              },
              visaDetails: {
                ...s.visaDetails,
                ...payload.visaDetails,
              },
            } as LocalStudent;

            // Sync currentStage to Visa Approved or Applied if visaStatus changes
            const vStat = updated.visaDetails?.visaStatus as any;
            if (vStat === "Approved" || vStat === "Visa Approved") {
              updated.currentStage = "Visa Approved" as any;
            } else if (vStat === "Applied" || vStat === "Visa Applied") {
              updated.currentStage = "Visa Applied" as any;
            }
            return updated;
          }
          return s;
        }),
      );
    } else {
      // Appending new Student
      const nextId = (
        Math.max(...students.map((s) => Number(s.id)), 0) + 1
      ).toString();
      const pName = payload.name?.split(" ")[0] || "Student";
      const newStudent: LocalStudent = {
        id: nextId,
        name: payload.name || "New Student",
        counsellor: payload.counsellor || "Prasad Panjugula",
        country: payload.country || "United Kingdom",
        intake: payload.intake || "Sep 2026",
        admissionDate: payload.admissionDate || "15-Jun-2026",
        applicationType: payload.applicationType || "Master's Degree",
        englishRequirement: payload.twelfthEnglishMoi || "MOI Waiver Letter",
        passportNumber: payload.passportNumber || "N/A",
        mobileNumber: payload.mobileNumber || "N/A",
        email: payload.email || "N/A",
        password: payload.password || `Pass${pName}@2026`,
        twelfthEnglishMoi: payload.twelfthEnglishMoi || "MOI Waiver Letter",
        currentStage:
          (payload.visaDetails?.visaStatus as any) === "Approved" ||
            (payload.visaDetails?.visaStatus as any) === "Visa Approved"
            ? ("Visa Approved" as any)
            : ("Lead Created" as any),
        applications: [
          {
            id: `app-${nextId}-1`,
            portal: "GVOC",
            university: "Teesside University",
            course: "MSc Data Science & AI",
            applicationDate: "15-Jun-2026",
            status: (payload.applications?.[0]?.status || "Pending") as any,
          },
        ],
        visaDetails: {
          depositStatus:
            payload.visaDetails?.depositStatus || "Deposit Not Paid",
          ihsPayment: payload.visaDetails?.ihsPayment || "Pending",
          interviewStatus: payload.visaDetails?.interviewStatus || "Pending",
          casStatus: payload.visaDetails?.casStatus || "CAS Not Applied",
          visaStatus: payload.visaDetails?.visaStatus || "Draft Pending",
        } as any,
        loan: {
          assignee: payload.loan?.assignee || "Sunil",
          nbfc: payload.loan?.nbfc || "Credila",
          status: payload.loan?.status || "Pending",
          pfStatus: payload.loan?.pfStatus || "Pending",
          sanctionedAmount: payload.loan?.sanctionedAmount || "₹0",
          disbursedAmount: payload.loan?.disbursedAmount || "₹0",
        },
        remarks: [
          {
            date: "15-Jun-2026",
            note: "Case file created in CRM under counsellor Prasad.",
          },
        ],
        documents: [
          {
            id: `doc-${nextId}-1`,
            category: "Passport",
            name: `${pName}_Passport_2026.pdf`,
            fileType: "pdf",
            uploadedAt: "15-Jun-2026",
            fileSize: "1.2 MB",
            content: `OFFICIAL PASSPORT\nHOLDER: ${payload.name}\nPASSPORT: ${payload.passportNumber}`,
          },
        ],
      };

      setStudents((prev) => [newStudent, ...prev]);
    }
  };

  // DMS DOCUMENT METADATA SYNCS
  const handleAddDocumentToStudent = (
    studentId: string,
    docPayload: Omit<DocumentItem, "id">,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const item: DocumentItem = {
            ...docPayload,
            id: `doc-${s.id}-${Date.now()}`,
          };
          return {
            ...s,
            documents: [...s.documents, item],
          };
        }
        return s;
      }),
    );
  };

  const handleDeleteDocumentFromStudent = (
    studentId: string,
    docId: string,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: s.documents.filter((d) => d.id !== docId),
          };
        }
        return s;
      }),
    );
  };

  const handleReplaceDocumentInStudent = (
    studentId: string,
    docId: string,
    updated: Partial<DocumentItem>,
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            documents: s.documents.map((d) =>
              d.id === docId ? { ...d, ...updated } : d,
            ),
          };
        }
        return s;
      }),
    );
  };

  // ADDS REMARK LOG LINE TO ACTIVE PORTFOLIO CHRONOLOGY
  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim() || !selectedStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudentId) {
          return {
            ...s,
            remarks: [
              ...s.remarks,
              { date: "15-Jun-2026", note: newRemarkText.trim() },
            ],
          };
        }
        return s;
      }),
    );
    setNewRemarkText("");
  };

  // MULTIPLE UNIVERSITY APPLICATIONS WORKFLOW IMPLEMENTATION (TAB 3)
  const handleTriggerAddApp = () => {
    setEditingAppId(null);
    setAppPortal("Direct");
    setAppDate("15-Jun-2026");
    setAppUniversity("");
    setAppCourse("");
    setAppIntake("Sep 2026");
    setAppStatus("Pending");
    setShowAddAppForm(true);
  };

  const handleTriggerEditApp = (app: Application) => {
    setEditingAppId(app.id || "1");
    setAppPortal(app.portal);
    setAppDate(app.applicationDate);
    setAppUniversity(app.university);
    setAppCourse(app.course);
    setAppIntake("Sep 2026");
    setAppStatus(app.status);
    setShowAddAppForm(true);
  };

  const handleSaveUniversityAppForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUniversity.trim() || !appCourse.trim() || !selectedStudentId)
      return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudentId) {
          let updated = [...s.applications];
          if (editingAppId) {
            updated = updated.map((app) =>
              app.id === editingAppId
                ? {
                  ...app,
                  portal: appPortal,
                  applicationDate: appDate,
                  university: appUniversity,
                  course: appCourse,
                  status: appStatus as any,
                }
                : app,
            );
          } else {
            updated.push({
              id: `app-${s.id}-${Date.now()}`,
              portal: appPortal,
              applicationDate: appDate,
              university: appUniversity,
              course: appCourse,
              status: appStatus as any,
            });
          }
          return { ...s, applications: updated };
        }
        return s;
      }),
    );

    setShowAddAppForm(false);
    setEditingAppId(null);
    setAppUniversity("");
    setAppCourse("");
  };

  const handleDeleteUniversityApp = (appId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this university application entry?",
      )
    ) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === selectedStudentId) {
            return {
              ...s,
              applications: s.applications.filter((app) => app.id !== appId),
            };
          }
          return s;
        }),
      );
    }
  };

  // SAVE TAB 4 FINANCIAL DETAILS FORM BACK TO IMMIGRATION FOLDER
  const handleSaveFinancesTab = (e: React.FormEvent, finPayload: any) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudentId) {
          return {
            ...s,
            loan: {
              ...s.loan,
              ...finPayload,
            },
          };
        }
        return s;
      }),
    );
    alert("Financial credit and NBFC parameters updated successfully!");
  };

  return (
    <div
      className={`${isDarkMode ? "dark" : ""} flex min-h-screen bg-background text-foreground transition-colors duration-200`}
    >
      {/* 1. COMPACT FIXED SIDEBAR NAVIGATION */}

      {/* 2. MAIN WORKSPACE CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">
        {/* TOP COMPLIANCE NAVBAR */}


        {/* WORKSPACE OPERATIONS MAIN CONTENT */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* CRITICAL HERO GREETING BLOCK */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
            <div>
              <span className="text-red-601 font-black tracking-widest text-[10px] uppercase text-red-600 block">
                Consultancy CRM Management Panel
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight">
                {selectedStudentId
                  ? "Active Case Folio Verification"
                  : `${currentView} Control Desk`}
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Last Sync: 15-Jun-2026 21:59 UTC
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 3. CASE FOLIO VERIFICATION: STUDENT DETAIL VIEW */}
            {selectedStudentId && selectedStudent ? (
              <motion.div
                key="student-detail-profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Return Navigator Toggle */}
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 hover:underline hover:scale-[1.01] transition-transform"
                >
                  ← Return to Master Profiles Directory
                </button>

                {/* Profile Widget header card */}
                <div
                  className={`p-6 rounded-3xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${isDarkMode
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-100"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-red-605 from-red-600 via-rose-500 to-amber-500 text-white flex items-center justify-center text-2xl font-black">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-805 dark:text-slate-100">
                          {selectedStudent.name}
                        </h3>
                        <span className="bg-red-600/10 text-red-600 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full text-[9px] tracking-wide uppercase">
                          Counsellor: {selectedStudent.counsellor}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-red-600" />
                        <span>Destination: {selectedStudent.country}</span> •
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {selectedStudent.intake}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Flow pipeline active stage */}
                  <div className="flex flex-col lg:items-end gap-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                      Embassy Pipeline Node
                    </span>
                    <span className="bg-green-500/10 text-green-500 font-black px-4 py-1 border border-green-500/20 rounded-xl text-xs uppercase tracking-widest animate-pulse">
                      {selectedStudent.currentStage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Passport Registration: {selectedStudent.passportNumber}
                    </span>
                  </div>
                </div>

                {/* VISUAL STEPPER TIMELINE AND COMPLIANCE INTEGRATION TRACKER (Interactive!) */}
                <div
                  className={`p-6 rounded-3xl border shadow-md space-y-4 ${isDarkMode
                      ? "bg-slate-900 border-slate-805"
                      : "bg-white border-slate-100"
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block">
                      Visa compliance pipeline stepper
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      Click any node block to force trigger stage update
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative py-2">
                    {[
                      "Lead Created",
                      "Application Submitted",
                      "Offer Received",
                      "Deposit Paid",
                      "Interview Completed",
                      "CAS Received",
                      "Visa Applied",
                      "Visa Approved",
                    ].map((step, index, arr) => {
                      const activeIndex = arr.indexOf(
                        selectedStudent.currentStage,
                      );
                      const isCompleted = index <= activeIndex;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={step}
                          onClick={() => {
                            setStudents((prev) =>
                              prev.map((s) => {
                                if (s.id === selectedStudentId) {
                                  return { ...s, currentStage: step as any };
                                }
                                return s;
                              }),
                            );
                          }}
                          className={`p-3 rounded-2xl text-center border text-xs font-bold transition-all flex flex-col justify-between h-[85px] hover:scale-[1.03] overflow-hidden select-none cursor-pointer ${isActive
                              ? "bg-red-600 text-white border-red-650 shadow-lg shadow-red-600/15"
                              : isCompleted
                                ? "bg-emerald-100 text-emerald-800 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-500"
                            }`}
                        >
                          <span className="text-[10px] font-black font-mono self-start text-inherit opacity-80">
                            0{index + 1}
                          </span>
                          <p className="text-[10px] tracking-tight uppercase leading-tight font-black text-left">
                            {step}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM TABS SECTION GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Left Column navigation tabs */}
                  <div className="space-y-1.5 lg:col-span-1">
                    {[
                      {
                        key: "info",
                        label: "Basic Information",
                        icon: User,
                        color: "text-red-500",
                      },
                      {
                        key: "documents",
                        label: "Document Locker (DMS)",
                        icon: FolderOpen,
                        color: "text-blue-500",
                      },
                      {
                        key: "applications",
                        label:
                          "Applications (" +
                          selectedStudent.applications.length +
                          ")",
                        icon: FileText,
                        color: "text-emerald-500",
                      },
                      {
                        key: "finance",
                        label: "Finance & Lending NBFC",
                        icon: CreditCard,
                        color: "text-amber-500",
                      },
                      {
                        key: "visa",
                        label: "Visa Stamp Stepper",
                        icon: FileCheck2,
                        color: "text-purple-500",
                      },
                      {
                        key: "remarks",
                        label: "History Remarks Timeline",
                        icon: FileSignature,
                        color: "text-rose-500",
                      },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSel = detailTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setDetailTab(tab.key as any)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all border ${isSel
                              ? "bg-red-600 text-white border-red-600 shadow-xl shadow-red-600/10"
                              : "bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850"
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4.5 w-4.5 ${isSel ? "text-white" : tab.color}`}
                            />
                            <span>{tab.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Middle panels contents (Col Span 3) */}
                  <div className="lg:col-span-3">
                    <div
                      className={`p-6 rounded-3xl border shadow-xl min-h-[420px] ${isDarkMode
                          ? "bg-slate-900 border-slate-805 text-slate-100"
                          : "bg-white border-slate-100 text-slate-800"
                        }`}
                    >
                      {/* T1. INFORMATION PANEL (Wired fully with edit options!) */}
                      {detailTab === "info" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b pb-3 border-inherit">
                            <div>
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                Profile Compliance Checklist
                              </h4>
                              <p className="text-xs font-bold text-red-650 text-red-600">
                                All fields are editable using basic edit option
                              </p>
                            </div>
                            <button
                              onClick={() => openEditModal(selectedStudent)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl transition-all shadow-md shadow-red-600/10 cursor-pointer"
                            >
                              Edit Profile Records
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              {
                                label: "Student Identification ID",
                                val: `STU${100 + Number(selectedStudent.id)}`,
                                icon: User,
                              },
                              {
                                label: "Assigned Adviser/Counsellor",
                                val: selectedStudent.counsellor,
                                icon: Briefcase,
                              },
                              {
                                label: "Admission Enrollment Date",
                                val: selectedStudent.admissionDate,
                                icon: Calendar,
                              },
                              {
                                label: "Degree Track Program",
                                val: selectedStudent.applicationType,
                                icon: GraduationCap,
                              },
                              {
                                label: "Passport Registration ID",
                                val: selectedStudent.passportNumber,
                                icon: FileSignature,
                              },
                              {
                                label: "Admissions Mobile Number",
                                val: selectedStudent.mobileNumber,
                                icon: Globe2,
                              },
                              {
                                label: "Registered Email Address",
                                val: selectedStudent.email,
                                icon: FileText,
                              },
                              {
                                label: "Target Country Location",
                                val: selectedStudent.country,
                                icon: MapPin,
                              },
                              {
                                label: "Target Intake Cycle",
                                val: selectedStudent.intake,
                                icon: Calendar,
                              },
                              {
                                label: "XII English Score / Waiver Medium",
                                val:
                                  selectedStudent.twelfthEnglishMoi ||
                                  "MOI Waiver Letter",
                                icon: FileCheck2,
                              },
                            ].map((v, i) => {
                              const ItemIcon = v.icon;
                              return (
                                <div
                                  key={i}
                                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center gap-3 border border-slate-100 dark:border-slate-850"
                                >
                                  <div className="p-2 bg-red-600/10 text-red-600 rounded-xl">
                                    <ItemIcon className="h-4.5 w-4.5" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">
                                      {v.label}
                                    </span>
                                    <span className="text-xs font-extrabold text-slate-850 dark:text-slate-150">
                                      {v.val}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* T2. DOCUMENT MANAGEMENT SYSTEM TAB (Integrated real DMSSection!) */}
                      {detailTab === "documents" && (
                        <div className="space-y-4">
                          <div className="pb-2 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Interactive Document Management System
                            </h4>
                            <p className="text-xs text-slate-450 text-slate-400">
                              Validate marksheet transcripts, visa stamps, or
                              passport PDFs below.
                            </p>
                          </div>

                          <DMSSection
                            studentId={selectedStudent.id}
                            studentName={selectedStudent.name}
                            documents={selectedStudent.documents || []}
                            isDarkMode={isDarkMode}
                            onAddDocument={(doc) =>
                              handleAddDocumentToStudent(
                                selectedStudent.id,
                                doc,
                              )
                            }
                            onDeleteDocument={(docId) =>
                              handleDeleteDocumentFromStudent(
                                selectedStudent.id,
                                docId,
                              )
                            }
                            onReplaceDocument={(docId, updated) =>
                              handleReplaceDocumentInStudent(
                                selectedStudent.id,
                                docId,
                                updated,
                              )
                            }
                          />
                        </div>
                      )}

                      {/* T3. ADVANCED MULTIPLE APPLICATIONS TAB PANEL */}
                      {detailTab === "applications" && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-3 border-b border-inherit">
                            <div>
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                University Applications Pipeline
                              </h4>
                              <p className="text-xs text-slate-450 text-slate-450 text-slate-400">
                                Manage multiple university files per applicant
                                folder
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Layout selector toggle */}
                              <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1">
                                <button
                                  onClick={() => setAppLayout("cards")}
                                  className={`p-1.5 rounded-lg text-xs ${appLayout === "cards" ? "bg-red-600 text-white" : "text-slate-400"}`}
                                  title="Render applications as Cards"
                                >
                                  <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setAppLayout("table")}
                                  className={`p-1.5 rounded-lg text-xs ${appLayout === "table" ? "bg-red-600 text-white" : "text-slate-400"}`}
                                  title="Render applications into a list table"
                                >
                                  <TableProperties className="h-4 w-4" />
                                </button>
                              </div>

                              <button
                                onClick={handleTriggerAddApp}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-4.5 w-4.5" />
                                <span>Add New Course Program</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Add Form Dialog inside the Tab */}
                          {showAddAppForm && (
                            <form
                              onSubmit={handleSaveUniversityAppForm}
                              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 animate-fadeIn space-y-3"
                            >
                              <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-405 mb-2 text-red-600">
                                {editingAppId
                                  ? "Update University Application"
                                  : "Register New University Target"}
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    University Name
                                  </label>
                                  <input
                                    type="text"
                                    value={appUniversity}
                                    onChange={(e) =>
                                      setAppUniversity(e.target.value)
                                    }
                                    placeholder="e.g. University of Manchester"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                      }`}
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Course Name
                                  </label>
                                  <input
                                    type="text"
                                    value={appCourse}
                                    onChange={(e) =>
                                      setAppCourse(e.target.value)
                                    }
                                    placeholder="e.g. MSc Advanced Computer Science"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                      }`}
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Immigration Portal
                                  </label>
                                  <input
                                    type="text"
                                    value={appPortal}
                                    onChange={(e) =>
                                      setAppPortal(e.target.value)
                                    }
                                    placeholder="e.g. GVOC / Centurus / Direct"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                      }`}
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Application Date
                                  </label>
                                  <input
                                    type="text"
                                    value={appDate}
                                    onChange={(e) => setAppDate(e.target.value)}
                                    placeholder="15-Jun-2026"
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                      }`}
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">
                                    Application Status
                                  </label>
                                  <select
                                    value={appStatus}
                                    onChange={(e) =>
                                      setAppStatus(e.target.value)
                                    }
                                    className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                        ? "bg-slate-900 border-slate-800"
                                        : "bg-white border-slate-200"
                                      }`}
                                  >
                                    {[
                                      "Draft",
                                      "Applied",
                                      "Pending",
                                      "Offer Received",
                                      "Priority Offer Received",
                                      "Conditional Offer",
                                      "Unconditional Offer",
                                      "Rejected",
                                      "Deferred",
                                    ].map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="flex items-end justify-end gap-2 pt-5">
                                  <button
                                    type="button"
                                    onClick={() => setShowAddAppForm(false)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-red-655 bg-red-600 text-white rounded-xl text-xs font-black shadow"
                                  >
                                    Save Entry
                                  </button>
                                </div>
                              </div>
                            </form>
                          )}

                          {selectedStudent.applications.length === 0 ? (
                            <p className="text-center py-12 text-slate-400">
                              No registered university applications on file. Add
                              one above.
                            </p>
                          ) : appLayout === "cards" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedStudent.applications.map((app, i) => (
                                <div
                                  key={app.id || i}
                                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-850 flex flex-col justify-between whitespace-normal"
                                >
                                  <div>
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="bg-red-600 text-white font-black text-[8px] py-0.5 px-2 rounded-full font-mono uppercase tracking-widest">
                                        {app.portal}
                                      </span>
                                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-[9px] py-0.5 px-2 rounded-md">
                                        {app.status}
                                      </span>
                                    </div>
                                    <h5 className="font-extrabold text-sm mb-1">
                                      {app.university}
                                    </h5>
                                    <p className="text-[11px] text-slate-400 font-medium mb-4">
                                      {app.course}
                                    </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/50 dark:border-slate-805/50 text-[10px] text-slate-400">
                                    <span>
                                      Date Filed: {app.applicationDate}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleTriggerEditApp(app)
                                        }
                                        className="text-red-600 hover:underline font-bold"
                                      >
                                        Edit
                                      </button>
                                      <span className="text-slate-300">|</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteUniversityApp(
                                            app.id || "",
                                          )
                                        }
                                        className="text-rose-500 hover:underline font-bold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-850">
                              <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-slate-100 dark:bg-slate-950 text-[9px] uppercase font-black text-slate-400 tracking-wider">
                                  <tr>
                                    <th className="px-4 py-2.5">Portal</th>
                                    <th className="px-4 py-2.5">University</th>
                                    <th className="px-4 py-2.5">
                                      Course Program
                                    </th>
                                    <th className="px-4 py-2.5">
                                      Date Applied
                                    </th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {selectedStudent.applications.map(
                                    (app, i) => (
                                      <tr
                                        key={app.id || i}
                                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850"
                                      >
                                        <td className="px-4 py-3 font-mono font-bold text-red-650 text-red-600">
                                          {app.portal}
                                        </td>
                                        <td className="px-4 py-3 font-bold">
                                          {app.university}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                          {app.course}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                          {app.applicationDate}
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className="bg-slate-100 dark:bg-slate-850 text-[10px] font-black px-2 py-0.5 rounded">
                                            {app.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-1.5">
                                          <button
                                            onClick={() =>
                                              handleTriggerEditApp(app)
                                            }
                                            className="text-red-600 font-bold"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteUniversityApp(
                                                app.id || "",
                                              )
                                            }
                                            className="text-rose-500 font-bold"
                                          >
                                            Delete
                                          </button>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      {/* T4. FINANCIAL CREDIT CONTROL PANEL */}
                      {detailTab === "finance" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Financial & Borrowing Ledger
                            </h4>
                            <p className="text-xs text-slate-400">
                              Manage Lending NBFC credits, processing fee
                              waivers, and sanctioned payouts.
                            </p>
                          </div>

                          <form
                            onSubmit={(e) => {
                              const form = e.currentTarget;
                              const payload = {
                                assignee: (
                                  form.elements.namedItem(
                                    "assignee",
                                  ) as HTMLInputElement
                                ).value,
                                nbfc: (
                                  form.elements.namedItem(
                                    "nbfc",
                                  ) as HTMLSelectElement
                                ).value,
                                status: (
                                  form.elements.namedItem(
                                    "status",
                                  ) as HTMLSelectElement
                                ).value,
                                pfStatus: (
                                  form.elements.namedItem(
                                    "pfStatus",
                                  ) as HTMLSelectElement
                                ).value,
                                sanctionedAmount: (
                                  form.elements.namedItem(
                                    "sanctioned",
                                  ) as HTMLInputElement
                                ).value,
                                disbursedAmount: (
                                  form.elements.namedItem(
                                    "disbursed",
                                  ) as HTMLInputElement
                                ).value,
                              };
                              handleSaveFinancesTab(e, payload);
                            }}
                            className="space-y-4 text-xs"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Fintech Assignee Representative
                                </label>
                                <input
                                  type="text"
                                  name="assignee"
                                  defaultValue={selectedStudent.loan.assignee}
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Lending NBFC Partner
                                </label>
                                <select
                                  name="nbfc"
                                  defaultValue={selectedStudent.loan.nbfc}
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-650 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                >
                                  {[
                                    "Poonawalla",
                                    "Credila",
                                    "Avanse",
                                    "ICICI",
                                    "HDFC Credila",
                                    "Self Funding",
                                    "Other",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Loan Status
                                </label>
                                <select
                                  name="status"
                                  defaultValue={selectedStudent.loan.status}
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                >
                                  {[
                                    "Pending",
                                    "Under Review",
                                    "Approved",
                                    "Rejected",
                                    "Sanctioned",
                                    "Disbursed",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Processing Fee Status
                                </label>
                                <select
                                  name="pfStatus"
                                  defaultValue={
                                    selectedStudent.loan.pfStatus || "Pending"
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                >
                                  {[
                                    "Paid",
                                    "Pending",
                                    "Waived",
                                    "Not Applicable",
                                  ].map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Sanctioned Amount
                                </label>
                                <input
                                  type="text"
                                  name="sanctioned"
                                  defaultValue={
                                    selectedStudent.loan.sanctionedAmount
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-1.5 block">
                                  Released Disbursement
                                </label>
                                <input
                                  type="text"
                                  name="disbursed"
                                  defaultValue={
                                    selectedStudent.loan.disbursedAmount
                                  }
                                  className={`w-full px-3.5 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                      ? "bg-slate-950 border-slate-800"
                                      : "bg-slate-50 border-slate-200"
                                    }`}
                                  required
                                />
                              </div>
                            </div>

                            <div className="pt-4 border-t border-inherit flex justify-end">
                              <button
                                type="submit"
                                className="bg-red-655 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-6 py-2.5 rounded-xl uppercase tracking-wider shadow"
                              >
                                Save Financial Parameters
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* T5. VISA STATS MILESTONES PROGRESS TRACKER */}
                      {detailTab === "visa" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Immigration Milestones Checklist
                            </h4>
                            <p className="text-xs text-slate-400">
                              Alter key embassy timeline metrics. Changes
                              refresh progress bars instantly.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Deposit Payment Status
                              </label>
                              <select
                                value={
                                  selectedStudent.visaDetails.depositStatus
                                }
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "depositStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                  }`}
                              >
                                {[
                                  "Deposit Paid",
                                  "Deposit Not Paid",
                                  "Paid",
                                  "Pending",
                                  "Waived",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                IHS Charge Status
                              </label>
                              <select
                                value={selectedStudent.visaDetails.ihsPayment}
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "ihsPayment",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                  }`}
                              >
                                {["Paid", "Pending", "Not Required"].map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Embassy Interview
                              </label>
                              <select
                                value={
                                  selectedStudent.visaDetails.interviewStatus
                                }
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "interviewStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                  }`}
                              >
                                {["Completed", "Pending", "Waived"].map(
                                  (opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>

                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                CAS Issue Status
                              </label>
                              <select
                                value={selectedStudent.visaDetails.casStatus}
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "casStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                  }`}
                              >
                                {[
                                  "CAS Received",
                                  "CAS Under Review",
                                  "CAS Not Applied",
                                  "Received",
                                  "Pending",
                                  "Not Required",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[9px] uppercase font-bold text-slate-450 block mb-1.5">
                                Official Visa Stamp Decision
                              </label>
                              <select
                                value={selectedStudent.visaDetails.visaStatus}
                                onChange={(e) =>
                                  handleTableStatusChange(
                                    selectedStudent.id,
                                    "visaStatus",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-3.5 py-2 rounded-xl border ${isDarkMode
                                    ? "bg-slate-950 border-slate-800"
                                    : "bg-slate-50 border-slate-202"
                                  }`}
                              >
                                {[
                                  "Visa Approved",
                                  "Visa Applied",
                                  "Visa Decision Pending",
                                  "Visa Rejected",
                                  "Draft Pending",
                                  "Approved",
                                  "Applied",
                                  "Decision Pending",
                                  "Rejected",
                                ].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="p-4 bg-emerald-500/10 border border-emerald-550/20 text-xs rounded-2xl flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              Embassy milestone fields saved back to case file.
                              Dynamic pipeline is in sync.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* T6. CHRONOLOGICAL REMARKS HUB */}
                      {detailTab === "remarks" && (
                        <div className="space-y-6">
                          <div className="pb-3 border-b border-inherit">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              Consulting Notes History
                            </h4>
                            <p className="text-xs text-slate-400 font-medium">
                              Record chronological logs or parent conversation
                              summaries below.
                            </p>
                          </div>

                          <form
                            onSubmit={handleAddRemark}
                            className="flex gap-2.5"
                          >
                            <input
                              type="text"
                              value={newRemarkText}
                              onChange={(e) => setNewRemarkText(e.target.value)}
                              placeholder="Type a new compliance note, advisory update..."
                              className={`flex-1 px-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-red-600 ${isDarkMode
                                  ? "bg-slate-950 border-slate-800 text-slate-200"
                                  : "bg-slate-50 border-slate-202"
                                }`}
                              required
                            />
                            <button
                              type="submit"
                              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide cursor-pointer"
                            >
                              Append Remark
                            </button>
                          </form>

                          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-3">
                            {selectedStudent.remarks
                              .slice()
                              .reverse()
                              .map((rem, i) => (
                                <div
                                  key={i}
                                  className="relative pl-6 border-l-2 border-red-600/30 pb-3 last:pb-0"
                                >
                                  <span className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-red-600" />
                                  <div className="text-[10px] flex items-center justify-between text-slate-400 mb-1 font-bold">
                                    <span className="font-mono bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded">
                                      {rem.date}
                                    </span>
                                    <span>Logged by Agent</span>
                                  </div>
                                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                                    {rem.note}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* 1. CORE PIXEL-PERFECT DASHBOARD VIEW */}

                {/* 2. ALL STUDENT PROFILES (Master Table rendering 32 specs columns!) */}
                {currentView === "students" && (
                  <motion.div
                    key="students-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 animate-fadeIn"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit bg-inherit">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Master Admissions Directory
                        </h4>
                        <p className="text-xs text-slate-450 text-slate-400 font-medium">
                          Showing {filteredStudents.length} of {students.length}{" "}
                          compliance folders
                        </p>
                      </div>

                      {/* <div className="flex items-center gap-2">
                        <button
                          onClick={openAddModal}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4.5 py-2 rounded-xl inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-4.5 w-4.5" />
                          <span>Quick Register Student</span>
                        </button>
                      </div> */}
                    </div>

                    {/* Master Student 32-Column Table */}
                    <StudentTable
                      students={filteredStudents}
                      isDarkMode={isDarkMode}
                      onSelectStudent={handleSelectStudent}
                      onEditStudent={openEditModal}
                      onDeleteStudent={handleDeleteStudent}
                      onStatusChange={handleTableStatusChange}
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 3. FLOATING FILTER SIDEBAR DRAWER PANEL (Fully Responsive!) */}

      {/* 4. DRAWER DIALOG BOX FOR ADD & EDIT STUDENT FOLIO */}
      <AddEditModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        isDarkMode={isDarkMode}
        studentToEdit={studentToEdit}
        onSave={handleSaveStudentPayload}
      />
    </div>
  );
}
