import { PrismaClient, Role, OrgType, PharmacyType, OrgStatus, EncounterType, PrescriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[SINA Seed] Starting clinical demonstration database seeding...');

  // Clear existing data safely
  await prisma.auditLog.deleteMany();
  await prisma.accessGrant.deleteMany();
  await prisma.recordAccessRequest.deleteMany();
  await prisma.dispensingRecord.deleteMany();
  await prisma.adverseDrugReaction.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.investigation.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.medicalCondition.deleteMany();
  await prisma.patientAllergy.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Al-Farabi',
      lastName: 'Ibn Sina',
      role: Role.SUPER_ADMIN,
    },
  });

  // 2. Create 3 Hospitals
  const apexHospital = await prisma.organization.create({
    data: {
      name: 'Apex Central University Hospital',
      type: OrgType.HOSPITAL,
      licenseNumber: 'HOSP-ACUH-0192',
      address: '100 Medical Plaza Way, Suite 400',
      phone: '+1 (555) 019-2831',
      email: 'records@apexcentral.health',
      status: OrgStatus.APPROVED,
    },
  });

  const metroGeneral = await prisma.organization.create({
    data: {
      name: 'Metro General Hospital',
      type: OrgType.HOSPITAL,
      licenseNumber: 'HOSP-MGH-0842',
      address: '450 Westside Boulevard',
      phone: '+1 (555) 024-5510',
      email: 'admin@metrogeneral.org',
      status: OrgStatus.APPROVED,
    },
  });

  const stJudeClinic = await prisma.organization.create({
    data: {
      name: 'St. Jude Specialist Clinic & Hospital',
      type: OrgType.HOSPITAL,
      licenseNumber: 'HOSP-SJC-1109',
      address: '88 Harborview Avenue',
      phone: '+1 (555) 038-9921',
      email: 'contact@stjudeclinic.org',
      status: OrgStatus.APPROVED,
    },
  });

  // 3. Create Pharmacies (2 Community, 1 Hospital)
  const cityPharma = await prisma.organization.create({
    data: {
      name: 'City Care Community Pharmacy',
      type: OrgType.PHARMACY,
      pharmacyType: PharmacyType.COMMUNITY,
      licenseNumber: 'PHARM-CCC-4011',
      address: '12 Commercial Street',
      phone: '+1 (555) 041-3382',
      email: 'dispensing@citycarepharm.com',
      status: OrgStatus.APPROVED,
    },
  });

  const greenCrossPharma = await prisma.organization.create({
    data: {
      name: 'Green Cross Community Pharmacy',
      type: OrgType.PHARMACY,
      pharmacyType: PharmacyType.COMMUNITY,
      licenseNumber: 'PHARM-GCC-5520',
      address: '74 Market Square',
      phone: '+1 (555) 049-7711',
      email: 'rx@greencrossrx.org',
      status: OrgStatus.APPROVED,
    },
  });

  const apexHospitalPharma = await prisma.organization.create({
    data: {
      name: 'Apex Inpatient & Outpatient Pharmacy',
      type: OrgType.PHARMACY,
      pharmacyType: PharmacyType.HOSPITAL,
      licenseNumber: 'PHARM-AH-9901',
      address: '100 Medical Plaza Way, Ground Floor East',
      phone: '+1 (555) 019-2899',
      email: 'pharmacy@apexcentral.health',
      status: OrgStatus.APPROVED,
    },
  });

  // 4. Create Hospital Departments
  const cardioDept = await prisma.department.create({
    data: {
      organizationId: apexHospital.id,
      name: 'Cardiology & Vascular Medicine',
      code: 'CARD-01',
    },
  });

  const internalDept = await prisma.department.create({
    data: {
      organizationId: apexHospital.id,
      name: 'Internal Medicine',
      code: 'INT-01',
    },
  });

  const metroPulmDept = await prisma.department.create({
    data: {
      organizationId: metroGeneral.id,
      name: 'Pulmonology & Respiratory Care',
      code: 'PULM-01',
    },
  });

  // 5. Create 3 Hospital Administrators
  const adminApex = await prisma.user.create({
    data: {
      email: 'admin.apex@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Eleanor',
      lastName: 'Vance',
      role: Role.HOSPITAL_ADMIN,
      organizationId: apexHospital.id,
    },
  });

  const adminMetro = await prisma.user.create({
    data: {
      email: 'admin.metro@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Marcus',
      lastName: 'Brody',
      role: Role.HOSPITAL_ADMIN,
      organizationId: metroGeneral.id,
    },
  });

  const adminStJude = await prisma.user.create({
    data: {
      email: 'admin.stjude@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'David',
      lastName: 'Sterling',
      role: Role.HOSPITAL_ADMIN,
      organizationId: stJudeClinic.id,
    },
  });

  // 6. Create 5 Doctors
  const drChen = await prisma.user.create({
    data: {
      email: 'dr.chen@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Arthur',
      lastName: 'Chen',
      role: Role.DOCTOR,
      organizationId: apexHospital.id,
      licenseNumber: 'MD-9281-CARD',
      specialty: 'Cardiology',
    },
  });

  const drSarah = await prisma.user.create({
    data: {
      email: 'dr.sarah@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: Role.DOCTOR,
      organizationId: apexHospital.id,
      licenseNumber: 'MD-8411-INT',
      specialty: 'Internal Medicine',
    },
  });

  const drHarrison = await prisma.user.create({
    data: {
      email: 'dr.harrison@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'James',
      lastName: 'Harrison',
      role: Role.DOCTOR,
      organizationId: metroGeneral.id,
      licenseNumber: 'MD-7704-PULM',
      specialty: 'Pulmonology',
    },
  });

  const drPatel = await prisma.user.create({
    data: {
      email: 'dr.patel@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Ananya',
      lastName: 'Patel',
      role: Role.DOCTOR,
      organizationId: metroGeneral.id,
      licenseNumber: 'MD-6632-NEURO',
      specialty: 'Neurology',
    },
  });

  const drReynolds = await prisma.user.create({
    data: {
      email: 'dr.reynolds@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Clara',
      lastName: 'Reynolds',
      role: Role.DOCTOR,
      organizationId: stJudeClinic.id,
      licenseNumber: 'MD-5519-GP',
      specialty: 'Family Medicine',
    },
  });

  // 7. Create 4 Pharmacists
  const pharmApex = await prisma.user.create({
    data: {
      email: 'pharm.apex@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Jonathan',
      lastName: 'Wu',
      role: Role.PHARMACIST,
      organizationId: apexHospitalPharma.id,
      licenseNumber: 'RPH-3301',
    },
  });

  const pharmCity1 = await prisma.user.create({
    data: {
      email: 'pharm.city@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Maya',
      lastName: 'Lin',
      role: Role.PHARMACIST,
      organizationId: cityPharma.id,
      licenseNumber: 'RPH-4482',
    },
  });

  const pharmCity2 = await prisma.user.create({
    data: {
      email: 'pharm.tariq@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Tariq',
      lastName: 'Al-Mansoor',
      role: Role.PHARMACIST,
      organizationId: cityPharma.id,
      licenseNumber: 'RPH-4903',
    },
  });

  const pharmGreen = await prisma.user.create({
    data: {
      email: 'pharm.green@sina.health',
      passwordHash: defaultPasswordHash,
      firstName: 'Hannah',
      lastName: 'Schmidt',
      role: Role.PHARMACIST,
      organizationId: greenCrossPharma.id,
      licenseNumber: 'RPH-6119',
    },
  });

  // 8. Create 10 Fictional Patients with Longitudinal Records
  const patientsData = [
    {
      sinaId: 'SINA-PAT-2026-000001',
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
      primaryFacilityId: apexHospital.id,
      allergies: [
        { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylaxis and generalized urticaria' },
      ],
      conditions: [
        { conditionName: 'Hypertension Essential', icd10Code: 'I10', diagnosedDate: new Date('2021-03-10'), status: 'ACTIVE' },
        { conditionName: 'Atrial Fibrillation', icd10Code: 'I48.91', diagnosedDate: new Date('2023-09-15'), status: 'ACTIVE' },
      ],
    },
    {
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
      primaryFacilityId: metroGeneral.id,
      allergies: [
        { allergen: 'Sulfa', severity: 'MODERATE', reaction: 'Maculopapular rash' },
      ],
      conditions: [
        { conditionName: 'Type 2 Diabetes Mellitus', icd10Code: 'E11.9', diagnosedDate: new Date('2022-01-14'), status: 'ACTIVE' },
      ],
    },
    {
      sinaId: 'SINA-PAT-2026-000003',
      firstName: 'Julian',
      lastName: 'Rossi',
      dob: new Date('1990-11-03'),
      gender: 'MALE',
      bloodGroup: 'B+',
      phone: '+1 (555) 612-8874',
      email: 'julian.rossi@example.com',
      address: '38 Sunset Boulevard, Metro City',
      emergencyContactName: 'Gianna Rossi',
      emergencyContactPhone: '+1 (555) 612-8875',
      primaryFacilityId: apexHospital.id,
      allergies: [],
      conditions: [
        { conditionName: 'Mild Asthma', icd10Code: 'J45.20', diagnosedDate: new Date('2020-05-18'), status: 'MANAGED' },
      ],
    },
    {
      sinaId: 'SINA-PAT-2026-000004',
      firstName: 'Mariam',
      lastName: 'Kareem',
      dob: new Date('1985-02-19'),
      gender: 'FEMALE',
      bloodGroup: 'AB+',
      phone: '+1 (555) 902-3341',
      email: 'mariam.kareem@example.com',
      address: '900 Cedar Court, Metro City',
      emergencyContactName: 'Zayd Kareem',
      emergencyContactPhone: '+1 (555) 902-3342',
      primaryFacilityId: stJudeClinic.id,
      allergies: [
        { allergen: 'Aspirin', severity: 'SEVERE', reaction: 'Bronchospasm' },
      ],
      conditions: [],
    },
    {
      sinaId: 'SINA-PAT-2026-000005',
      firstName: 'David',
      lastName: 'Kowalski',
      dob: new Date('1956-07-30'),
      gender: 'MALE',
      bloodGroup: 'O-',
      phone: '+1 (555) 431-7788',
      email: 'david.k@example.com',
      address: '15 Ironworks Street',
      emergencyContactName: 'Anna Kowalski',
      emergencyContactPhone: '+1 (555) 431-7789',
      primaryFacilityId: metroGeneral.id,
      allergies: [],
      conditions: [
        { conditionName: 'COPD', icd10Code: 'J44.9', diagnosedDate: new Date('2019-10-12'), status: 'ACTIVE' },
      ],
    },
    {
      sinaId: 'SINA-PAT-2026-000006',
      firstName: 'Sofia',
      lastName: 'Alvarez',
      dob: new Date('1995-12-08'),
      gender: 'FEMALE',
      bloodGroup: 'A-',
      phone: '+1 (555) 774-2201',
      email: 'sofia.alvarez@example.com',
      address: '422 Willow Creek Way',
      emergencyContactName: 'Mateo Alvarez',
      emergencyContactPhone: '+1 (555) 774-2202',
      primaryFacilityId: apexHospital.id,
      allergies: [],
      conditions: [],
    },
    {
      sinaId: 'SINA-PAT-2026-000007',
      firstName: 'Marcus',
      lastName: 'Aurelius-Cole',
      dob: new Date('1972-06-15'),
      gender: 'MALE',
      bloodGroup: 'B-',
      phone: '+1 (555) 321-9988',
      email: 'marcus.cole@example.com',
      address: '88 Heritage Park Drive',
      emergencyContactName: 'Lydia Cole',
      emergencyContactPhone: '+1 (555) 321-9989',
      primaryFacilityId: stJudeClinic.id,
      allergies: [],
      conditions: [
        { conditionName: 'Hyperlipidemia', icd10Code: 'E78.5', diagnosedDate: new Date('2023-04-11'), status: 'ACTIVE' },
      ],
    },
    {
      sinaId: 'SINA-PAT-2026-000008',
      firstName: 'Chloe',
      lastName: 'Bennett',
      dob: new Date('2001-09-22'),
      gender: 'FEMALE',
      bloodGroup: 'O+',
      phone: '+1 (555) 678-0012',
      email: 'chloe.bennett@example.com',
      address: '17 Campus View Lane',
      emergencyContactName: 'Susan Bennett',
      emergencyContactPhone: '+1 (555) 678-0013',
      primaryFacilityId: apexHospital.id,
      allergies: [],
      conditions: [],
    },
    {
      sinaId: 'SINA-PAT-2026-000009',
      firstName: 'Kwame',
      lastName: 'Mensah',
      dob: new Date('1983-03-14'),
      gender: 'MALE',
      bloodGroup: 'A+',
      phone: '+1 (555) 555-8941',
      email: 'kwame.mensah@example.com',
      address: '61 Palm Valley Way',
      emergencyContactName: 'Abena Mensah',
      emergencyContactPhone: '+1 (555) 555-8942',
      primaryFacilityId: metroGeneral.id,
      allergies: [],
      conditions: [],
    },
    {
      sinaId: 'SINA-PAT-2026-000010',
      firstName: 'Elena',
      lastName: 'Rostova',
      dob: new Date('1969-10-05'),
      gender: 'FEMALE',
      bloodGroup: 'AB-',
      phone: '+1 (555) 234-9900',
      email: 'elena.rostova@example.com',
      address: '109 Riverside Drive',
      emergencyContactName: 'Dmitri Rostov',
      emergencyContactPhone: '+1 (555) 234-9901',
      primaryFacilityId: apexHospital.id,
      allergies: [
        { allergen: 'Morphine', severity: 'SEVERE', reaction: 'Severe respiratory depression' },
      ],
      conditions: [
        { conditionName: 'Osteoarthritis', icd10Code: 'M19.90', diagnosedDate: new Date('2021-08-20'), status: 'ACTIVE' },
      ],
    },
  ];

  for (const pData of patientsData) {
    // Also create patient user account if they have email
    let userRecord = null;
    if (pData.email) {
      userRecord = await prisma.user.create({
        data: {
          email: pData.email,
          passwordHash: defaultPasswordHash,
          firstName: pData.firstName,
          lastName: pData.lastName,
          role: Role.PATIENT,
        },
      });
    }

    const patient = await prisma.patient.create({
      data: {
        sinaId: pData.sinaId,
        userId: userRecord?.id,
        firstName: pData.firstName,
        lastName: pData.lastName,
        dob: pData.dob,
        gender: pData.gender,
        bloodGroup: pData.bloodGroup,
        phone: pData.phone,
        email: pData.email,
        address: pData.address,
        emergencyContactName: pData.emergencyContactName,
        emergencyContactPhone: pData.emergencyContactPhone,
        primaryFacilityId: pData.primaryFacilityId,
        allergies: {
          create: pData.allergies.map(a => ({
            allergen: a.allergen,
            severity: a.severity,
            reaction: a.reaction,
          })),
        },
        conditions: {
          create: pData.conditions.map(c => ({
            conditionName: c.conditionName,
            icd10Code: c.icd10Code,
            diagnosedDate: c.diagnosedDate,
            status: c.status,
          })),
        },
      },
    });

    // Populate Robert Mercer (SINA-PAT-2026-000001) with rich encounters, diagnoses, labs, and prescriptions
    if (pData.sinaId === 'SINA-PAT-2026-000001') {
      // Encounter 1: Cardiology consultation at Apex Hospital
      const encounter1 = await prisma.encounter.create({
        data: {
          patientId: patient.id,
          doctorId: drChen.id,
          organizationId: apexHospital.id,
          departmentId: cardioDept.id,
          encounterType: EncounterType.OUTPATIENT,
          chiefComplaint: 'Intermittent cardiac palpitations with mild exertional dyspnea lasting 2 weeks.',
          bpSys: 138,
          bpDia: 86,
          heartRate: 88,
          tempCelsius: 36.8,
          respRate: 16,
          o2Saturation: 98,
          physicalExam: 'Irregularly irregular heart rhythm noted on auscultation. No peripheral edema or JVD elevation.',
          treatmentPlan: 'Initiate anticoagulation and rate-control therapy. 12-lead ECG and comprehensive metabolic panel ordered.',
          startedAt: new Date('2026-10-15T09:30:00Z'),
        },
      });

      await prisma.diagnosis.create({
        data: {
          encounterId: encounter1.id,
          patientId: patient.id,
          code: 'I48.91',
          description: 'Unspecified atrial fibrillation',
          isDefinitive: true,
        },
      });

      await prisma.investigation.createMany({
        data: [
          {
            encounterId: encounter1.id,
            patientId: patient.id,
            testName: '12-Lead Electrocardiogram (ECG)',
            category: 'LAB',
            status: 'COMPLETED',
            resultSummary: 'Atrial fibrillation with rapid ventricular response (RVR). Rate 108 bpm.',
            performedAt: new Date('2026-10-15T10:00:00Z'),
          },
          {
            encounterId: encounter1.id,
            patientId: patient.id,
            testName: 'Transthoracic Echocardiogram',
            category: 'RADIOLOGY',
            status: 'COMPLETED',
            resultSummary: 'Left ventricular ejection fraction 55%. Mild left atrial enlargement (4.2 cm).',
            performedAt: new Date('2026-10-18T14:00:00Z'),
          },
        ],
      });

      // Prescription 1
      const rx1 = await prisma.prescription.create({
        data: {
          patientId: patient.id,
          doctorId: drChen.id,
          organizationId: apexHospital.id,
          encounterId: encounter1.id,
          status: PrescriptionStatus.ACTIVE,
          notes: 'Maintenance anticoagulation and ventricular rate management.',
          createdAt: new Date('2026-10-15T10:30:00Z'),
          items: {
            create: [
              {
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
              },
            ],
          },
        },
      });

      // Encounter 2: Internal Medicine follow-up with Dr. Sarah Jenkins
      const encounter2 = await prisma.encounter.create({
        data: {
          patientId: patient.id,
          doctorId: drSarah.id,
          organizationId: apexHospital.id,
          departmentId: internalDept.id,
          encounterType: EncounterType.FOLLOW_UP,
          chiefComplaint: 'Routine blood pressure review and medication tolerance assessment.',
          bpSys: 130,
          bpDia: 82,
          heartRate: 72,
          tempCelsius: 36.7,
          respRate: 15,
          o2Saturation: 99,
          physicalExam: 'Blood pressure well controlled. Resting heart rate 72 bpm regularized.',
          treatmentPlan: 'Continue current anti-hypertensive regimen. Recheck serum electrolytes and renal panel in 3 months.',
          startedAt: new Date('2026-11-02T11:00:00Z'),
        },
      });

      // Prescription 2
      const rx2 = await prisma.prescription.create({
        data: {
          patientId: patient.id,
          doctorId: drSarah.id,
          organizationId: apexHospital.id,
          encounterId: encounter2.id,
          status: PrescriptionStatus.ACTIVE,
          notes: 'Hypertension management.',
          createdAt: new Date('2026-11-02T11:30:00Z'),
          items: {
            create: [
              {
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
              },
            ],
          },
        },
      });

      // Cross-Hospital Consent Request: Dr. Harrison from Metro General requesting records for Robert Mercer
      await prisma.recordAccessRequest.create({
        data: {
          patientId: patient.id,
          requestingOrgId: metroGeneral.id,
          requestingDoctorId: drHarrison.id,
          sourceOrgId: apexHospital.id,
          purpose: 'Emergency Room evaluation for acute chest pain episode while traveling near Metro General district.',
          requestedCategories: 'CLINICAL_ENCOUNTERS,PRESCRIPTIONS,LABORATORY,DIAGNOSES',
          status: 'PENDING_PATIENT_CONSENT',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log('[SINA Seed] Successfully seeded:');
  console.log('- 1 Super Admin (admin@sina.health)');
  console.log('- 3 Hospitals (Apex Central, Metro General, St. Jude)');
  console.log('- 3 Pharmacies (City Care, Green Cross, Apex Hospital Pharmacy)');
  console.log('- 3 Hospital Admins (admin.apex@sina.health, admin.metro@sina.health, etc.)');
  console.log('- 5 Doctors (dr.chen@sina.health, dr.sarah@sina.health, dr.harrison@sina.health, etc.)');
  console.log('- 4 Pharmacists (pharm.city@sina.health, pharm.apex@sina.health, etc.)');
  console.log('- 10 Patients (including patient.mercer@sina.health with full medical timeline)');
  console.log('All passwords: password123');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
