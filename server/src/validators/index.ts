import { z } from 'zod';
import { Role, OrgType, PharmacyType, EncounterType, PrescriptionStatus } from '@prisma/client';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date of birth required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  phone: z.string().min(7, 'Valid contact number required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(3, 'Address is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name required'),
  emergencyContactPhone: z.string().min(7, 'Emergency contact phone required'),
  allergies: z.array(z.object({
    allergen: z.string(),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
    reaction: z.string(),
  })).optional(),
  existingConditions: z.array(z.object({
    conditionName: z.string(),
    icd10Code: z.string().optional(),
    diagnosedDate: z.string(),
    status: z.enum(['ACTIVE', 'MANAGED', 'RESOLVED']),
  })).optional(),
});

export const CreateEncounterSchema = z.object({
  patientId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  encounterType: z.nativeEnum(EncounterType).default(EncounterType.OUTPATIENT),
  chiefComplaint: z.string().min(3, 'Chief complaint required'),
  bpSys: z.number().int().min(50).max(250).optional(),
  bpDia: z.number().int().min(30).max(150).optional(),
  heartRate: z.number().int().min(30).max(220).optional(),
  tempCelsius: z.number().min(30).max(45).optional(),
  respRate: z.number().int().min(8).max(60).optional(),
  o2Saturation: z.number().int().min(50).max(100).optional(),
  physicalExam: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
  diagnoses: z.array(z.object({
    code: z.string(),
    description: z.string(),
    isDefinitive: z.boolean().default(false),
  })).optional(),
  investigations: z.array(z.object({
    testName: z.string(),
    category: z.enum(['LAB', 'RADIOLOGY', 'SEROLOGY']),
  })).optional(),
});

export const CreatePrescriptionSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    medicationName: z.string().min(1),
    genericName: z.string().optional(),
    strength: z.string().min(1),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    route: z.string().default('Oral'),
    durationDays: z.number().int().positive(),
    quantity: z.number().int().positive(),
    instructions: z.string().optional(),
  })).min(1, 'At least one prescription medication is required'),
});

export const CreateAccessRequestSchema = z.object({
  patientId: z.string().uuid(),
  sourceOrgId: z.string().uuid(),
  purpose: z.string().min(5, 'Specific clinical purpose required'),
  requestedCategories: z.string().min(1), // e.g. "ENCOUNTERS,PRESCRIPTIONS,LABS"
  durationDays: z.number().int().min(1).max(30).default(7),
});

export const PatientConsentDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  allowedCategories: z.string().optional(), // Can selectively approve categories
});

export const FacilityApprovalDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const DispenseMedicationSchema = z.object({
  prescriptionId: z.string().uuid(),
  dispensedQty: z.number().int().positive(),
  dispensedNotes: z.string().optional(),
});

export const PatientSignupSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Valid date of birth required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  phone: z.string().min(7, 'Valid contact phone number required'),
  address: z.string().min(3, 'Residential address is required'),
  emergencyContactName: z.string().min(1, 'Emergency contact name required'),
  emergencyContactPhone: z.string().min(7, 'Emergency contact phone required'),
  primaryFacilityId: z.string().optional(),
  allergies: z.array(z.object({
    allergen: z.string(),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
    reaction: z.string(),
  })).optional(),
});

export const StaffSignupSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Phone number required').optional(),
  role: z.enum(['DOCTOR', 'PHARMACIST', 'HOSPITAL_ADMIN']),
  organizationId: z.string().optional(),
  licenseNumber: z.string().min(3, 'Professional license number required'),
  specialty: z.string().optional(),
});
