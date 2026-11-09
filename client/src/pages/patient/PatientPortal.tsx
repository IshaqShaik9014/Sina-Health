import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Patient, Encounter, RecordAccessRequest } from '../../types';
import { ClinicalSummaryCard } from '../../components/common/ClinicalSummaryCard';
import { MedicalTimeline } from '../../components/common/MedicalTimeline';
import {
  Share2,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Activity,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const PatientPortal: React.FC = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<Encounter[]>([]);
  const [consentRequests, setConsentRequests] = useState<RecordAccessRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'consent' | 'access-history'>('timeline');
  const [isLoading, setIsLoading] = useState(true);
  const [decisionMsg, setDecisionMsg] = useState('');

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      // Default to Robert Mercer if logged in as patient or demo
      const patientIdentifier = (user as any)?.patientId || (user as any)?.sinaId || 'SINA-PAT-2026-000001';
      const pRes: any = await api.get(`/patients/${patientIdentifier}`);
      if (pRes.success && pRes.data) {
        setPatient(pRes.data.patient);

        // Fetch timeline
        const tRes: any = await api.get(`/patients/${pRes.data.patient.id}/timeline`);
        if (tRes.success) {
          setTimeline(tRes.data);
        }

        // Fetch consent requests
        const cRes: any = await api.get(`/consent/patient/${pRes.data.patient.id}`);
        if (cRes.success) {
          setConsentRequests(cRes.data);
        }
      }
    } catch (err) {
      console.error('Error loading patient portal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [user]);

  const handleConsentDecision = async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res: any = await api.post(`/consent/requests/${requestId}/patient-decision`, {
        decision,
      });

      if (res.success) {
        setDecisionMsg(`Consent request ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}.`);
        setTimeout(() => {
          setDecisionMsg('');
          loadPatientData();
        }, 1500);
      }
    } catch (err: any) {
      alert(`Decision error: ${err.message}`);
    }
  };

  const handleRevokeGrant = async (grantId: string) => {
    if (!confirm('Are you sure you want to immediately revoke access for this hospital?')) return;
    try {
      const res: any = await api.post(`/consent/grants/${grantId}/revoke`);
      if (res.success) {
        alert('Access grant successfully revoked.');
        loadPatientData();
      }
    } catch (err: any) {
      alert(`Revoke error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Greeting & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 rounded-card border border-clinical-border bg-white shadow-subtle">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono text-clinical-teal uppercase tracking-wider font-semibold">
            Universal Health Record
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-clinical-text-primary mt-0.5">
            {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient Health Portal'}
          </h2>
          <p className="text-[11px] sm:text-xs text-clinical-text-secondary mt-0.5">
            Your single longitudinal medical record. Controlled by your consent across all participating hospitals and pharmacies.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-clinical-raised rounded-control border border-clinical-border text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-control font-medium text-center transition-colors ${
              activeTab === 'timeline' ? 'bg-white text-clinical-teal shadow-subtle' : 'text-clinical-text-secondary hover:text-clinical-text-primary'
            }`}
          >
            Medical history
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-control font-medium text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'consent' ? 'bg-white text-clinical-teal shadow-subtle' : 'text-clinical-text-secondary hover:text-clinical-text-primary'
            }`}
          >
            <span>Sharing & consent</span>
            {consentRequests.filter(r => r.status === 'PENDING_PATIENT_CONSENT').length > 0 && (
              <span className="h-4 w-4 rounded-full bg-clinical-status-warning text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {consentRequests.filter(r => r.status === 'PENDING_PATIENT_CONSENT').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {decisionMsg && (
        <div className="p-3.5 rounded-control bg-clinical-status-success-bg border border-green-200 text-xs text-clinical-status-success">
          {decisionMsg}
        </div>
      )}

      {patient && (
        <div className="space-y-6">
          <ClinicalSummaryCard patient={patient} />

          {activeTab === 'timeline' && (
            <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle">
              <div className="pb-4 mb-4 border-b border-clinical-border">
                <h3 className="text-sm font-semibold text-clinical-text-primary">
                  Clinical Timeline & Encounters
                </h3>
                <p className="text-xs text-clinical-text-secondary mt-0.5">
                  Complete history of doctor consultations, diagnoses, and treatments.
                </p>
              </div>

              <MedicalTimeline encounters={timeline} />
            </div>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-6">
              {/* Pending Requests */}
              <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
                <div className="pb-3 border-b border-clinical-border">
                  <h3 className="text-sm font-semibold text-clinical-text-primary">
                    Pending Hospital Access Requests
                  </h3>
                  <p className="text-xs text-clinical-text-secondary mt-0.5">
                    Review and authorize external healthcare facilities requesting access to your medical history.
                  </p>
                </div>

                {consentRequests.filter(r => r.status === 'PENDING_PATIENT_CONSENT').length === 0 ? (
                  <p className="text-xs text-clinical-text-muted italic py-4 text-center">
                    No pending consent requests at this time.
                  </p>
                ) : (
                  consentRequests
                    .filter(r => r.status === 'PENDING_PATIENT_CONSENT')
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-4 rounded-control border border-blue-200 bg-clinical-status-info-bg/30 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-clinical-text-primary text-xs">
                              {req.requestingOrg.name}
                            </span>
                            <span className="text-clinical-text-muted text-xs">·</span>
                            <span className="text-xs text-clinical-text-secondary">
                              Dr. {req.requestingDoctor.firstName} {req.requestingDoctor.lastName} ({req.requestingDoctor.specialty || 'Clinician'})
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-clinical-text-muted">
                            Expires: {new Date(req.expiresAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <p className="text-clinical-text-secondary">
                            <strong className="text-clinical-text-primary font-medium">Stated purpose:</strong> {req.purpose}
                          </p>
                          <p className="text-clinical-text-muted text-[11px]">
                            <strong className="text-clinical-text-primary font-medium">Requested data:</strong> {req.requestedCategories}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                          <button
                            onClick={() => handleConsentDecision(req.id, 'REJECT')}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-control border border-red-200 bg-white text-clinical-status-error hover:bg-red-50 text-xs font-medium transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject access</span>
                          </button>
                          <button
                            onClick={() => handleConsentDecision(req.id, 'APPROVE')}
                            className="flex items-center gap-1.5 h-8 px-3.5 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-medium transition-colors"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Authorize record transfer</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Active & Historical Grants */}
              <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
                <div className="pb-3 border-b border-clinical-border">
                  <h3 className="text-sm font-semibold text-clinical-text-primary">
                    Active & Past Sharing Authorizations
                  </h3>
                  <p className="text-xs text-clinical-text-secondary mt-0.5">
                    Facilities that currently have time-limited read access, or past revoked authorizations.
                  </p>
                </div>

                <div className="divide-y divide-clinical-border border border-clinical-border rounded-control overflow-hidden">
                  {consentRequests
                    .filter(r => r.status !== 'PENDING_PATIENT_CONSENT')
                    .map((req) => (
                      <div key={req.id} className="p-3.5 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-clinical-text-primary">{req.requestingOrg.name}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-clinical-raised text-clinical-text-secondary">
                              {req.status}
                            </span>
                          </div>
                          <p className="text-clinical-text-secondary text-[11px] mt-0.5">
                            Purpose: {req.purpose}
                          </p>
                        </div>

                        {req.accessGrant && !req.accessGrant.isRevoked && (
                          <button
                            onClick={() => handleRevokeGrant(req.accessGrant!.id)}
                            className="h-7 px-2.5 rounded-control border border-red-200 text-clinical-status-error hover:bg-red-50 text-[11px] font-medium"
                          >
                            Revoke access now
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
