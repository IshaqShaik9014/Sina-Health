import bcrypt from 'bcryptjs';

export const isMockMode = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('YOUR_PASSWORD');

export interface MockDataStore {
  organizations: any[];
  departments: any[];
  users: any[];
  patients: any[];
  encounters: any[];
  prescriptions: any[];
  dispensings: any[];
  adrReports: any[];
  accessRequests: any[];
  accessGrants: any[];
  auditLogs: any[];
}

const defaultPasswordHash = bcrypt.hashSync('password123', 10);

export const mockStore: MockDataStore = {
  organizations: [
    {
      id: 'org-apex',
      name: 'Apex Central University Hospital',
      type: 'HOSPITAL',
      licenseNumber: 'HOSP-ACUH-0192',
      address: '100 Medical Plaza Way, Suite 400',
      phone: '+1 (555) 019-2831',
      email: 'records@apexcentral.health',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-metro',
      name: 'Metro General Hospital',
      type: 'HOSPITAL',
      licenseNumber: 'HOSP-MGH-0842',
      address: '450 Westside Boulevard',
      phone: '+1 (555) 024-5510',
      email: 'admin@metrogeneral.org',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-stjude',
      name: 'St. Jude Specialist Clinic & Hospital',
      type: 'HOSPITAL',
      licenseNumber: 'HOSP-SJC-1109',
      address: '88 Harborview Avenue',
      phone: '+1 (555) 038-9921',
      email: 'contact@stjudeclinic.org',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-citypharma',
      name: 'City Care Community Pharmacy',
      type: 'PHARMACY',
      pharmacyType: 'COMMUNITY',
      licenseNumber: 'PHARM-CCC-4011',
      address: '12 Commercial Street',
      phone: '+1 (555) 041-3382',
      email: 'dispensing@citycarepharm.com',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-greencross',
      name: 'Green Cross Community Pharmacy',
      type: 'PHARMACY',
      pharmacyType: 'COMMUNITY',
      licenseNumber: 'PHARM-GCC-5520',
      address: '74 Market Square',
      phone: '+1 (555) 049-7711',
      email: 'rx@greencrossrx.org',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-apexpharma',
      name: 'Apex Inpatient & Outpatient Pharmacy',
      type: 'PHARMACY',
      pharmacyType: 'HOSPITAL',
      licenseNumber: 'PHARM-AH-9901',
      address: '100 Medical Plaza Way, Ground Floor East',
      phone: '+1 (555) 019-2899',
      email: 'pharmacy@apexcentral.health',
      status: 'APPROVED',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  departments: [
    {
      id: 'dept-cardio',
      organizationId: 'org-apex',
      name: 'Cardiology & Vascular Medicine',
      code: 'CARD-01',
    },
    {
      id: 'dept-internal',
      organizationId: 'org-apex',
      name: 'Internal Medicine',
      code: 'INT-01',
    },
    {
      id: 'dept-pulm',
      organizationId: 'org-metro',
      name: 'Pulmonology & Respiratory Care',
      code: 'PULM-01',
    }
  ],

  users: [
    {
      id: 'user-admin',
      email: 'admin@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Al-Farabi',
      lastName: 'Ibn Sina',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-admin-apex',
      email: 'admin.apex@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Eleanor',
      lastName: 'Vance',
      role: 'HOSPITAL_ADMIN',
      organizationId: 'org-apex',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-dr-chen',
      email: 'dr.chen@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Arthur',
      lastName: 'Chen',
      role: 'DOCTOR',
      organizationId: 'org-apex',
      licenseNumber: 'MD-9281-CARD',
      specialty: 'Cardiology',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-dr-sarah',
      email: 'dr.sarah@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'DOCTOR',
      organizationId: 'org-apex',
      licenseNumber: 'MD-8411-INT',
      specialty: 'Internal Medicine',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-dr-harrison',
      email: 'dr.harrison@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'James',
      lastName: 'Harrison',
      role: 'DOCTOR',
      organizationId: 'org-metro',
      licenseNumber: 'MD-7704-PULM',
      specialty: 'Pulmonology',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-pharm-city',
      email: 'pharm.city@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Maya',
      lastName: 'Lin',
      role: 'PHARMACIST',
      organizationId: 'org-citypharma',
      licenseNumber: 'RPH-4482',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user-patient-mercer',
      email: 'patient.mercer@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Robert',
      lastName: 'Mercer',
      role: 'PATIENT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  patients: [
    {
      id: 'pat-mercer',
      sinaId: 'SINA-PAT-2026-000001',
      userId: 'user-patient-mercer',
      firstName: 'Robert',
      lastName: 'Mercer',
      dob: new Date('1964-04-12'),
      gender: 'MALE',
      bloodGroup: 'A+',
      phone: '+1 (555) 782-1190',
      email: 'patient.mercer@sina.health',
      address: '744 Oakridge Lane, Springfield',
      emergencyContactName: 'Judith Mercer',
      emergencyContactPhone: '+1 (555) 782-1191',
      primaryFacilityId: 'org-apex',
      allergies: [
        { id: 'all-1', patientId: 'pat-mercer', allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylaxis and generalized urticaria', recordedAt: new Date() },
      ],
      conditions: [
        { id: 'cond-1', patientId: 'pat-mercer', conditionName: 'Hypertension Essential', icd10Code: 'I10', diagnosedDate: new Date('2021-03-10'), status: 'ACTIVE' },
        { id: 'cond-2', patientId: 'pat-mercer', conditionName: 'Atrial Fibrillation', icd10Code: 'I48.91', diagnosedDate: new Date('2023-09-15'), status: 'ACTIVE' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'pat-carter',
      sinaId: 'SINA-PAT-2026-000002',
      firstName: 'Evelyn',
      lastName: 'Carter',
      dob: new Date('1978-08-25'),
      gender: 'FEMALE',
      bloodGroup: 'O+',
      phone: '+1 (555) 890-4421',
      email: 'patient.carter@sina.health',
      address: '122 Maple Wood Drive, Springfield',
      emergencyContactName: 'Thomas Carter',
      emergencyContactPhone: '+1 (555) 890-4422',
      primaryFacilityId: 'org-metro',
      allergies: [
        { id: 'all-2', patientId: 'pat-carter', allergen: 'Sulfa', severity: 'MODERATE', reaction: 'Maculopapular rash', recordedAt: new Date() },
      ],
      conditions: [
        { id: 'cond-3', patientId: 'pat-carter', conditionName: 'Type 2 Diabetes Mellitus', icd10Code: 'E11.9', diagnosedDate: new Date('2022-01-14'), status: 'ACTIVE' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  encounters: [
    {
      id: 'enc-1',
      patientId: 'pat-mercer',
      doctorId: 'user-dr-chen',
      organizationId: 'org-apex',
      departmentId: 'dept-cardio',
      encounterType: 'OUTPATIENT',
      chiefComplaint: 'Intermittent cardiac palpitations with mild exertional dyspnea lasting 2 weeks.',
      bpSys: 138,
      bpDia: 86,
      heartRate: 88,
      tempCelsius: 36.8,
      respRate: 16,
      o2Saturation: 98,
      physicalExam: 'Irregularly irregular heart rhythm noted on auscultation. No peripheral edema or JVD elevation.',
      treatmentPlan: 'Initiate anticoagulation and rate-control therapy. 12-lead ECG and metabolic panel ordered.',
      startedAt: new Date('2026-10-15T09:30:00Z'),
      diagnoses: [
        { id: 'diag-1', encounterId: 'enc-1', patientId: 'pat-mercer', code: 'I48.91', description: 'Unspecified atrial fibrillation', isDefinitive: true },
      ],
      investigations: [
        { id: 'inv-1', encounterId: 'enc-1', patientId: 'pat-mercer', testName: '12-Lead Electrocardiogram (ECG)', category: 'LAB', status: 'COMPLETED', resultSummary: 'Atrial fibrillation with rapid ventricular response (RVR). Rate 108 bpm.' },
        { id: 'inv-2', encounterId: 'enc-1', patientId: 'pat-mercer', testName: 'Transthoracic Echocardiogram', category: 'RADIOLOGY', status: 'COMPLETED', resultSummary: 'Left ventricular ejection fraction 55%. Mild left atrial enlargement (4.2 cm).' }
      ]
    },
    {
      id: 'enc-2',
      patientId: 'pat-mercer',
      doctorId: 'user-dr-sarah',
      organizationId: 'org-apex',
      departmentId: 'dept-internal',
      encounterType: 'FOLLOW_UP',
      chiefComplaint: 'Routine blood pressure review and medication tolerance assessment.',
      bpSys: 130,
      bpDia: 82,
      heartRate: 72,
      tempCelsius: 36.7,
      respRate: 15,
      o2Saturation: 99,
      physicalExam: 'Blood pressure well controlled. Resting heart rate 72 bpm regularized.',
      treatmentPlan: 'Continue current anti-hypertensive regimen. Recheck serum electrolytes in 3 months.',
      startedAt: new Date('2026-11-02T11:00:00Z'),
      diagnoses: [
        { id: 'diag-2', encounterId: 'enc-2', patientId: 'pat-mercer', code: 'I10', description: 'Essential hypertension', isDefinitive: true }
      ],
      investigations: []
    }
  ],

  prescriptions: [
    {
      id: 'rx-1',
      patientId: 'pat-mercer',
      doctorId: 'user-dr-chen',
      organizationId: 'org-apex',
      encounterId: 'enc-1',
      status: 'ACTIVE',
      notes: 'Maintenance anticoagulation and ventricular rate management.',
      createdAt: new Date('2026-10-15T10:30:00Z'),
      updatedAt: new Date('2026-10-15T10:30:00Z'),
      items: [
        {
          id: 'item-1',
          prescriptionId: 'rx-1',
          medicationName: 'Warfarin Sodium',
          genericName: 'Warfarin',
          strength: '5mg',
          dosage: '1 tablet daily at 18:00',
          frequency: 'Once daily',
          route: 'Oral',
          durationDays: 30,
          quantity: 30,
          remainingQty: 30,
          instructions: 'Take strictly at the same time each evening. Monitor INR target 2.0-3.0.',
        },
        {
          id: 'item-2',
          prescriptionId: 'rx-1',
          medicationName: 'Metoprolol Succinate',
          genericName: 'Metoprolol',
          strength: '50mg',
          dosage: '1 tablet every morning',
          frequency: 'Once daily',
          route: 'Oral',
          durationDays: 30,
          quantity: 30,
          remainingQty: 30,
          instructions: 'Do not discontinue abruptly. Check pulse periodically.',
        }
      ]
    },
    {
      id: 'rx-2',
      patientId: 'pat-mercer',
      doctorId: 'user-dr-sarah',
      organizationId: 'org-apex',
      encounterId: 'enc-2',
      status: 'ACTIVE',
      notes: 'Hypertension management.',
      createdAt: new Date('2026-11-02T11:30:00Z'),
      updatedAt: new Date('2026-11-02T11:30:00Z'),
      items: [
        {
          id: 'item-3',
          prescriptionId: 'rx-2',
          medicationName: 'Lisinopril',
          genericName: 'Lisinopril',
          strength: '10mg',
          dosage: '1 tablet daily',
          frequency: 'Once daily',
          route: 'Oral',
          durationDays: 30,
          quantity: 30,
          remainingQty: 30,
          instructions: 'Take with or without food. Report persistent dry cough if developed.',
        }
      ]
    }
  ],

  dispensings: [],
  adrReports: [],

  accessRequests: [
    {
      id: 'req-1',
      patientId: 'pat-mercer',
      requestingOrgId: 'org-metro',
      requestingDoctorId: 'user-dr-harrison',
      sourceOrgId: 'org-apex',
      purpose: 'Emergency Room evaluation for acute chest pain episode while traveling near Metro General district.',
      requestedCategories: 'CLINICAL_ENCOUNTERS,PRESCRIPTIONS,LABORATORY,DIAGNOSES',
      status: 'PENDING_PATIENT_CONSENT',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],

  accessGrants: [],

  auditLogs: [
    {
      id: 'log-1',
      userId: 'user-dr-chen',
      userRole: 'DOCTOR',
      organizationId: 'org-apex',
      patientId: 'pat-mercer',
      action: 'VIEW_PATIENT_TIMELINE',
      recordCategory: 'CLINICAL_ENCOUNTER',
      purpose: 'Clinical Evaluation',
      status: 'SUCCESS',
      timestamp: new Date(),
    }
  ]
};
