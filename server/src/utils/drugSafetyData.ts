export interface DrugInteractionInfo {
  drugA: string;
  drugB: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'CONTRAINDICATED';
  description: string;
  mechanism: string;
  clinicalAction: string;
  source: string;
  lastUpdated: string;
}

export interface DrugAllergyCrossCheck {
  allergen: string;
  contraindicatedDrugPrefix: string;
  warningText: string;
}

export const KNOWN_DRUG_INTERACTIONS: DrugInteractionInfo[] = [
  {
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severity: 'CONTRAINDICATED',
    description: 'Concurrent use markedly increases the risk of major upper gastrointestinal and systemic hemorrhage.',
    mechanism: 'Additive antiplatelet and anticoagulant synergistic activity plus direct gastrointestinal mucosal erosion.',
    clinicalAction: 'Avoid co-administration unless specifically indicated under specialist hematology protocol with intensified INR monitoring.',
    source: 'National Clinical Drug Reference (BNF 86 / FDA MedWatch)',
    lastUpdated: '2026-01-15',
  },
  {
    drugA: 'Warfarin',
    drugB: 'Ibuprofen',
    severity: 'CONTRAINDICATED',
    description: 'NSAIDs displace warfarin from protein-binding sites and inhibit platelet aggregation, multiplying bleeding hazard.',
    mechanism: 'Pharmacokinetic displacement and dual inhibition of hemostasis.',
    clinicalAction: 'Switch to paracetamol/acetaminophen for analgesia.',
    source: 'Clinical Pharmacovigilance Bulletin Vol. 41',
    lastUpdated: '2026-02-10',
  },
  {
    drugA: 'Lisinopril',
    drugB: 'Spironolactone',
    severity: 'SEVERE',
    description: 'Concurrent administration causes life-threatening hyperkalemia, especially in patients with impaired renal function.',
    mechanism: 'Dual suppression of aldosterone production and reduced urinary potassium excretion.',
    clinicalAction: 'Monitor serum potassium and creatinine within 1 week of initiation and periodically thereafter.',
    source: 'Renal & Cardiovascular Drug Safety Committee',
    lastUpdated: '2026-03-01',
  },
  {
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severity: 'MODERATE',
    description: 'Omeprazole reduces the antiplatelet bioactivation of clopidogrel.',
    mechanism: 'Competitive inhibition of hepatic CYP2C19 required to convert clopidogrel into its active thiol metabolite.',
    clinicalAction: 'Consider pantoprazole or famotidine as alternative gastroprotective agents.',
    source: 'Cardiovascular Pharmacotherapy Guidelines 2025/2026',
    lastUpdated: '2026-01-20',
  },
  {
    drugA: 'Metformin',
    drugB: 'Iodinated Radiocontrast',
    severity: 'CONTRAINDICATED',
    description: 'Risk of contrast-induced nephropathy leading to acute metformin accumulation and fatal lactic acidosis.',
    mechanism: 'Acute renal impairment diminishes metformin clearance.',
    clinicalAction: 'Withhold metformin at the time of or prior to iodinated radiological procedure and for 48 hours following contrast administration.',
    source: 'American College of Radiology (ACR) Contrast Manual & BNF',
    lastUpdated: '2026-02-18',
  },
  {
    drugA: 'Ciprofloxacin',
    drugB: 'Amiodarone',
    severity: 'CONTRAINDICATED',
    description: 'Substantial additive prolongation of the QTc interval with elevated risk of Torsades de Pointes ventricular arrhythmia.',
    mechanism: 'Additive cardiac potassium I_Kr channel blockade.',
    clinicalAction: 'Contraindicated. Choose alternative non-quinolone antibacterial therapy.',
    source: 'CredibleMeds QT Drug Safety Database',
    lastUpdated: '2026-02-05',
  },
  {
    drugA: 'Simvastatin',
    drugB: 'Amlodipine',
    severity: 'MODERATE',
    description: 'Amlodipine increases systemic exposure to simvastatin, increasing the risk of rhabdomyolysis and myopathy.',
    mechanism: 'CYP3A4 weak inhibition by amlodipine.',
    clinicalAction: 'Limit simvastatin dose to a maximum of 20 mg daily or switch to atorvastatin/rosuvastatin.',
    source: 'FDA Drug Safety Communication / BNF Reference',
    lastUpdated: '2026-01-30',
  }
];

export const ALLERGY_CROSS_CHECKS: DrugAllergyCrossCheck[] = [
  {
    allergen: 'Penicillin',
    contraindicatedDrugPrefix: 'Amox',
    warningText: 'High risk of anaphylaxis. Amoxicillin is a member of the penicillin class.',
  },
  {
    allergen: 'Penicillin',
    contraindicatedDrugPrefix: 'Ampicil',
    warningText: 'High risk of severe hypersensitivity. Ampicillin shares the core beta-lactam structure.',
  },
  {
    allergen: 'Sulfa',
    contraindicatedDrugPrefix: 'Sulfameth',
    warningText: 'Patient documented with sulfonamide allergy. Sulfamethoxazole can induce severe Stevens-Johnson syndrome.',
  },
  {
    allergen: 'Aspirin',
    contraindicatedDrugPrefix: 'Ibuprofen',
    warningText: 'Cross-reactivity between NSAIDs in aspirin-sensitive patients can provoke bronchospasm or angioedema.',
  }
];

export function checkDrugInteractions(prescribedMeds: string[]): DrugInteractionInfo[] {
  const alerts: DrugInteractionInfo[] = [];

  for (let i = 0; i < prescribedMeds.length; i++) {
    for (let j = i + 1; j < prescribedMeds.length; j++) {
      const drug1 = prescribedMeds[i].toLowerCase();
      const drug2 = prescribedMeds[j].toLowerCase();

      for (const item of KNOWN_DRUG_INTERACTIONS) {
        const matchA = drug1.includes(item.drugA.toLowerCase()) || item.drugA.toLowerCase().includes(drug1);
        const matchB = drug2.includes(item.drugB.toLowerCase()) || item.drugB.toLowerCase().includes(drug2);
        
        const reverseMatchA = drug1.includes(item.drugB.toLowerCase()) || item.drugB.toLowerCase().includes(drug1);
        const reverseMatchB = drug2.includes(item.drugA.toLowerCase()) || item.drugA.toLowerCase().includes(drug2);

        if ((matchA && matchB) || (reverseMatchA && reverseMatchB)) {
          if (!alerts.some(a => a.drugA === item.drugA && a.drugB === item.drugB)) {
            alerts.push(item);
          }
        }
      }
    }
  }

  return alerts;
}

export function checkPatientAllergies(patientAllergies: string[], medications: string[]): string[] {
  const warnings: string[] = [];

  for (const allergy of patientAllergies) {
    const allergyLower = allergy.toLowerCase();
    for (const med of medications) {
      const medLower = med.toLowerCase();

      // Direct match
      if (medLower.includes(allergyLower) || allergyLower.includes(medLower)) {
        warnings.push(`CRITICAL ALLERGY ALERT: Patient is allergic to "${allergy}", which directly matches "${med}".`);
      }

      // Check cross-reactivity rules
      for (const rule of ALLERGY_CROSS_CHECKS) {
        if (allergyLower.includes(rule.allergen.toLowerCase()) && medLower.startsWith(rule.contraindicatedDrugPrefix.toLowerCase())) {
          warnings.push(`ALLERGY CROSS-REACTIVITY: ${rule.warningText} (Drug: ${med})`);
        }
      }
    }
  }

  return warnings;
}
