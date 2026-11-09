import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Patient, Encounter } from '../../types';
import { ClinicalSummaryCard } from '../../components/common/ClinicalSummaryCard';
import { MedicalTimeline } from '../../components/common/MedicalTimeline';
import {
  Search,
  PlusCircle,
  Pill,
  Share2,
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Stethoscope,
  ShieldAlert,
  CheckCircle2,
  X
} from 'lucide-react';

export const DoctorWorkstation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [patientQuery, setPatientQuery] = useState(searchParams.get('search') || 'SINA-PAT-2026-000001');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<Encounter[]>([]);
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [consentMessage, setConsentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  // Encounter form state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [bpSys, setBpSys] = useState<number | ''>(120);
  const [bpDia, setBpDia] = useState<number | ''>(80);
  const [heartRate, setHeartRate] = useState<number | ''>(72);
  const [tempCelsius, setTempCelsius] = useState<number | ''>(36.6);
  const [o2Sat, setO2Sat] = useState<number | ''>(99);
  const [diagnosisCode, setDiagnosisCode] = useState('I10');
  const [diagnosisDesc, setDiagnosisDesc] = useState('Essential (primary) hypertension');
  const [labOrder, setLabOrder] = useState('');

  // Prescription form state
  const [medName, setMedName] = useState('Amlodipine');
  const [medStrength, setMedStrength] = useState('5mg');
  const [medDosage, setMedDosage] = useState('1 tablet daily');
  const [medFrequency, setMedFrequency] = useState('Once daily');
  const [medRoute, setMedRoute] = useState('Oral');
  const [medDuration, setMedDuration] = useState(30);
  const [medQty, setMedQty] = useState(30);
  const [medInstructions, setMedInstructions] = useState('Take in the morning with water.');
  const [safetyReport, setSafetyReport] = useState<any>(null);

  // Consent request form state
  const [consentPurpose, setConsentPurpose] = useState('');
  const [consentCategories, setConsentCategories] = useState('CLINICAL_ENCOUNTERS,PRESCRIPTIONS,LABORATORY');
  const [consentSuccessMsg, setConsentSuccessMsg] = useState('');

  const handleSearch = async (query = patientQuery) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setRequiresConsent(false);
    setConsentMessage('');

    try {
      const res: any = await api.get(`/patients/${encodeURIComponent(query.trim())}`);
      if (res.success && res.data) {
        if (res.data.requiresConsentRequest) {
          setRequiresConsent(true);
          setConsentMessage(res.data.message);
          setPatient(res.data.patient);
          setTimeline([]);
        } else {
          setPatient(res.data.patient);
          // Fetch timeline
          const timeRes: any = await api.get(`/patients/${res.data.patient.id}/timeline`);
          if (timeRes.success && timeRes.data) {
            setTimeline(timeRes.data);
          }
        }
      } else {
        setError(res.error || 'Patient not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching patient medical records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch('SINA-PAT-2026-000001');
  }, []);

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    try {
      const payload: any = {
        patientId: patient.id,
        encounterType: 'OUTPATIENT',
        chiefComplaint,
        physicalExam: physicalExam || undefined,
        bpSys: bpSys !== '' ? Number(bpSys) : undefined,
        bpDia: bpDia !== '' ? Number(bpDia) : undefined,
        heartRate: heartRate !== '' ? Number(heartRate) : undefined,
        tempCelsius: tempCelsius !== '' ? Number(tempCelsius) : undefined,
        o2Saturation: o2Sat !== '' ? Number(o2Sat) : undefined,
        diagnoses: [
          {
            code: diagnosisCode,
            description: diagnosisDesc,
            isDefinitive: true,
          }
        ],
        investigations: labOrder.trim() ? [
          {
            testName: labOrder.trim(),
            category: 'LAB',
          }
        ] : undefined,
      };

      const res: any = await api.post('/encounters', payload);
      if (res.success) {
        setShowEncounterModal(false);
        setChiefComplaint('');
        setPhysicalExam('');
        // Reload timeline
        handleSearch(patient.sinaId);
      }
    } catch (err: any) {
      alert(`Encounter error: ${err.message}`);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    try {
      const payload = {
        patientId: patient.id,
        items: [
          {
            medicationName: medName,
            strength: medStrength,
            dosage: medDosage,
            frequency: medFrequency,
            route: medRoute,
            durationDays: Number(medDuration),
            quantity: Number(medQty),
            instructions: medInstructions,
          }
        ],
      };

      const res: any = await api.post('/prescriptions', payload);
      if (res.success) {
        setSafetyReport(res.data.safetyReport);
        if (!res.data.safetyReport?.hasAlerts) {
          setShowPrescriptionModal(false);
          handleSearch(patient.sinaId);
        }
      }
    } catch (err: any) {
      alert(`Prescribing error: ${err.message}`);
    }
  };

  const handleSendConsentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !patient.primaryFacility) return;
    try {
      const payload = {
        patientId: patient.id,
        sourceOrgId: patient.primaryFacility.id,
        purpose: consentPurpose,
        requestedCategories: consentCategories,
        durationDays: 7,
      };

      const res: any = await api.post('/consent/requests', payload);
      if (res.success) {
        setConsentSuccessMsg('Consent request dispatched. The patient will review and approve via their SINA Health Portal.');
        setTimeout(() => {
          setShowConsentModal(false);
          setConsentSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      alert(`Consent error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(patientQuery);
          }}
          className="flex items-center gap-2 w-full sm:flex-1 sm:max-w-md"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              placeholder="Search by Patient ID (e.g. SINA-PAT-2026-000001)..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-clinical-bg border border-clinical-border rounded-control text-clinical-text-primary focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-9 px-4 shrink-0 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-medium transition-colors"
          >
            {isLoading ? 'Searching...' : 'Lookup'}
          </button>
        </form>

        {/* Doctor Action Buttons */}
        {patient && !requiresConsent && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowEncounterModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-control bg-clinical-teal text-white hover:bg-clinical-teal-hover text-xs font-medium transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Document encounter</span>
            </button>

            <button
              onClick={() => {
                setSafetyReport(null);
                setShowPrescriptionModal(true);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-control bg-clinical-raised hover:bg-clinical-border text-clinical-text-primary text-xs font-medium border border-clinical-border transition-colors"
            >
              <Pill className="h-3.5 w-3.5 text-clinical-teal" strokeWidth={1.5} />
              <span>Write prescription</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-control bg-clinical-status-error-bg border border-red-200 text-xs text-clinical-status-error flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>{error}</span>
        </div>
      )}

      {/* Cross-Hospital Consent Boundary Notice */}
      {requiresConsent && patient && (
        <div className="p-5 rounded-card bg-clinical-status-info-bg/50 border border-blue-200 shadow-subtle space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-clinical-status-info mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-xs font-semibold text-clinical-text-primary">
                Cross-Facility Data Protection Notice
              </h3>
              <p className="text-xs text-clinical-text-secondary mt-1 leading-relaxed">
                {consentMessage}
              </p>
            </div>
          </div>

          <div className="pl-8 pt-1">
            <button
              onClick={() => setShowConsentModal(true)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-control bg-clinical-teal text-white hover:bg-clinical-teal-hover text-xs font-medium transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Submit cross-hospital consent request</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Clinical Content */}
      {patient && !requiresConsent && (
        <div className="space-y-6">
          <ClinicalSummaryCard patient={patient} />

          <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-clinical-border">
              <div>
                <h3 className="text-sm font-semibold text-clinical-text-primary">
                  Longitudinal Medical History
                </h3>
                <p className="text-xs text-clinical-text-secondary mt-0.5">
                  Chronological record of verified clinical encounters, laboratory diagnostics, and prescriptions.
                </p>
              </div>
              <span className="font-mono text-xs text-clinical-text-muted">
                {timeline.length} encounter{timeline.length !== 1 ? 's' : ''} on record
              </span>
            </div>

            <MedicalTimeline encounters={timeline} />
          </div>
        </div>
      )}

      {/* MODAL 1: Document Clinical Encounter */}
      {showEncounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-panel bg-white border border-clinical-border shadow-modal p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Document Clinical Encounter
              </h3>
              <button onClick={() => setShowEncounterModal(false)} className="text-clinical-text-muted hover:text-clinical-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEncounter} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-clinical-text-secondary mb-1">Chief complaint *</label>
                <textarea
                  required
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Primary symptoms or reason for visit..."
                  className="w-full p-2.5 rounded-control border border-clinical-border bg-clinical-bg text-clinical-text-primary focus:outline-none focus:border-clinical-teal"
                />
              </div>

              <div>
                <label className="block font-medium text-clinical-text-secondary mb-1">Physical examination findings</label>
                <textarea
                  rows={2}
                  value={physicalExam}
                  onChange={(e) => setPhysicalExam(e.target.value)}
                  placeholder="Clinical observations, cardiovascular, respiratory findings..."
                  className="w-full p-2.5 rounded-control border border-clinical-border bg-clinical-bg text-clinical-text-primary focus:outline-none focus:border-clinical-teal"
                />
              </div>

              {/* Vitals Ribbon Inputs */}
              <div>
                <label className="block font-medium text-clinical-text-secondary mb-1.5">Vital signs</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <span className="text-[10px] text-clinical-text-muted">BP Sys (mmHg)</span>
                    <input
                      type="number"
                      value={bpSys}
                      onChange={(e) => setBpSys(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-clinical-text-muted">BP Dia (mmHg)</span>
                    <input
                      type="number"
                      value={bpDia}
                      onChange={(e) => setBpDia(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-clinical-text-muted">Heart Rate (bpm)</span>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-clinical-text-muted">Temp (°C)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={tempCelsius}
                      onChange={(e) => setTempCelsius(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-clinical-text-muted">SpO₂ (%)</span>
                    <input
                      type="number"
                      value={o2Sat}
                      onChange={(e) => setO2Sat(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis and Investigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">ICD-10 Diagnosis code</label>
                  <input
                    type="text"
                    value={diagnosisCode}
                    onChange={(e) => setDiagnosisCode(e.target.value)}
                    placeholder="e.g. I10"
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Diagnosis description</label>
                  <input
                    type="text"
                    value={diagnosisDesc}
                    onChange={(e) => setDiagnosisDesc(e.target.value)}
                    placeholder="e.g. Essential hypertension"
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-clinical-text-secondary mb-1">Diagnostic test order (optional)</label>
                <input
                  type="text"
                  value={labOrder}
                  onChange={(e) => setLabOrder(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC) or 12-Lead ECG"
                  className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-clinical-border">
                <button
                  type="button"
                  onClick={() => setShowEncounterModal(false)}
                  className="h-8 px-3 rounded-control border border-clinical-border text-clinical-text-secondary hover:bg-clinical-raised"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium"
                >
                  Save encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Write Prescription */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-panel bg-white border border-clinical-border shadow-modal p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Write Prescription
              </h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-clinical-text-muted hover:text-clinical-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Medication name *</label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Lisinopril, Warfarin, Amoxicillin"
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Strength *</label>
                  <input
                    type="text"
                    required
                    value={medStrength}
                    onChange={(e) => setMedStrength(e.target.value)}
                    placeholder="e.g. 10mg, 500mg"
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full h-8 px-2 rounded-control border border-clinical-border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Frequency</label>
                  <input
                    type="text"
                    value={medFrequency}
                    onChange={(e) => setMedFrequency(e.target.value)}
                    className="w-full h-8 px-2 rounded-control border border-clinical-border text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Route</label>
                  <input
                    type="text"
                    value={medRoute}
                    onChange={(e) => setMedRoute(e.target.value)}
                    className="w-full h-8 px-2 rounded-control border border-clinical-border text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Duration (days)</label>
                  <input
                    type="number"
                    value={medDuration}
                    onChange={(e) => setMedDuration(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Total quantity</label>
                  <input
                    type="number"
                    value={medQty}
                    onChange={(e) => setMedQty(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-control border border-clinical-border font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-clinical-text-secondary mb-1">Clinical instructions</label>
                <input
                  type="text"
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                />
              </div>

              {/* Safety alerts if flagged */}
              {safetyReport?.hasAlerts && (
                <div className="p-3 rounded-control bg-clinical-status-warning-bg border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-clinical-status-warning">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Clinical safety warning triggered:</span>
                  </div>

                  {safetyReport.allergyWarnings?.map((w: string, i: number) => (
                    <p key={i} className="text-clinical-status-error font-medium pl-5 text-[11px]">
                      • {w}
                    </p>
                  ))}

                  {safetyReport.interactionAlerts?.map((ia: any, i: number) => (
                    <div key={i} className="pl-5 text-[11px] text-clinical-text-secondary space-y-0.5">
                      <p className="font-semibold text-clinical-status-warning">
                        • {ia.drugA} + {ia.drugB} ({ia.severity})
                      </p>
                      <p>{ia.description}</p>
                      <p className="italic text-clinical-text-muted">Source: {ia.source}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-clinical-border">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="h-8 px-3 rounded-control border border-clinical-border text-clinical-text-secondary hover:bg-clinical-raised"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium"
                >
                  Issue prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Cross-Hospital Consent Request */}
      {showConsentModal && patient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-panel bg-white border border-clinical-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Cross-Hospital Record Access Request
              </h3>
              <button onClick={() => setShowConsentModal(false)} className="text-clinical-text-muted hover:text-clinical-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            {consentSuccessMsg ? (
              <div className="p-4 rounded-control bg-clinical-status-success-bg border border-green-200 text-xs text-clinical-status-success flex items-center gap-2 mt-4">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{consentSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendConsentRequest} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Target patient</label>
                  <p className="font-medium text-clinical-text-primary">
                    {patient.firstName} {patient.lastName} ({patient.sinaId})
                  </p>
                  <p className="text-[11px] text-clinical-text-muted">
                    Source facility: {patient.primaryFacility?.name}
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Clinical reason / purpose *</label>
                  <textarea
                    required
                    rows={2}
                    value={consentPurpose}
                    onChange={(e) => setConsentPurpose(e.target.value)}
                    placeholder="e.g. Inpatient admission evaluation, specialized surgical referral, allergy history..."
                    className="w-full p-2.5 rounded-control border border-clinical-border bg-clinical-bg text-clinical-text-primary focus:outline-none focus:border-clinical-teal"
                  />
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Requested record categories</label>
                  <input
                    type="text"
                    value={consentCategories}
                    onChange={(e) => setConsentCategories(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs font-mono"
                  />
                  <p className="text-[10px] text-clinical-text-muted mt-0.5">
                    Separated categories: CLINICAL_ENCOUNTERS, PRESCRIPTIONS, LABORATORY, DIAGNOSES
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-clinical-border">
                  <button
                    type="button"
                    onClick={() => setShowConsentModal(false)}
                    className="h-8 px-3 rounded-control border border-clinical-border text-clinical-text-secondary hover:bg-clinical-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium"
                  >
                    Submit request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
