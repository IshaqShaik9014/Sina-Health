export type Role = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'PHARMACIST' | 'PATIENT';
export type OrgType = 'HOSPITAL' | 'PHARMACY';
export type PharmacyType = 'COMMUNITY' | 'HOSPITAL';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  licenseNumber?: string | null;
  specialty?: string | null;
  organization?: {
    id: string;
    name: string;
    type: OrgType;
    pharmacyType?: PharmacyType | null;
  } | null;
  patientProfile?: {
    id: string;
    sinaId: string;
  } | null;
}

export interface Patient {
  id: string;
  sinaId: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup?: string | null;
  phone: string;
  email?: string | null;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryFacility?: {
    id: string;
    name: string;
  } | null;
  allergies: Array<{ id: string; allergen: string; severity: string; reaction: string }>;
  conditions: Array<{ id: string; conditionName: string; icd10Code?: string; status: string }>;
}

export interface Encounter {
  id: string;
  patientId: string;
  encounterType: 'OUTPATIENT' | 'INPATIENT' | 'EMERGENCY' | 'FOLLOW_UP';
  chiefComplaint: string;
  bpSys?: number | null;
  bpDia?: number | null;
  heartRate?: number | null;
  tempCelsius?: number | null;
  respRate?: number | null;
  o2Saturation?: number | null;
  physicalExam?: string | null;
  treatmentPlan?: string | null;
  startedAt: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  organization: {
    id: string;
    name: string;
    type: OrgType;
  };
  department?: {
    id: string;
    name: string;
  } | null;
  diagnoses: Array<{ id: string; code: string; description: string; isDefinitive: boolean }>;
  investigations: Array<{ id: string; testName: string; category: string; status: string; resultSummary?: string }>;
  prescriptions?: Prescription[];
}

export interface Prescription {
  id: string;
  patientId: string;
  status: 'CREATED' | 'ACTIVE' | 'PARTIALLY_DISPENSED' | 'DISPENSED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  createdAt: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber?: string | null;
  };
  organization: {
    id: string;
    name: string;
    phone?: string | null;
  };
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  genericName?: string | null;
  strength: string;
  dosage: string;
  frequency: string;
  route: string;
  durationDays: number;
  quantity: number;
  remainingQty: number;
  instructions?: string | null;
}

export interface RecordAccessRequest {
  id: string;
  patientId: string;
  purpose: string;
  requestedCategories: string;
  status: 'PENDING_PATIENT_CONSENT' | 'PATIENT_APPROVED' | 'PATIENT_REJECTED' | 'PENDING_FACILITY_APPROVAL' | 'FACILITY_APPROVED' | 'FACILITY_REJECTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
  patient?: {
    id: string;
    sinaId: string;
    firstName: string;
    lastName: string;
  };
  requestingOrg: {
    id: string;
    name: string;
  };
  requestingDoctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  sourceOrg: {
    id: string;
    name: string;
  };
  accessGrant?: {
    id: string;
    validUntil: string;
    isRevoked: boolean;
  } | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: Role;
  action: string;
  recordCategory: string;
  purpose?: string | null;
  status: 'SUCCESS' | 'DENIED';
  timestamp: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
  };
  organization: {
    name: string;
  };
  patient?: {
    sinaId: string;
    firstName: string;
    lastName: string;
  } | null;
}
