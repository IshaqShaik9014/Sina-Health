import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Prescription } from '../../types';
import {
  Pill,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ClipboardList,
  Building2,
  Clock,
  Check,
  X
} from 'lucide-react';

export const PharmacyConsole: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [patientLookup, setPatientLookup] = useState(searchParams.get('search') || 'SINA-PAT-2026-000001');
  const [pharmacyData, setPharmacyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dispensing Modal State
  const [dispensingRx, setDispensingRx] = useState<Prescription | null>(null);
  const [dispenseQty, setDispenseQty] = useState<number>(30);
  const [dispenseNotes, setDispenseNotes] = useState('Patient verified in person. Instructions provided.');
  const [dispenseSuccess, setDispenseSuccess] = useState('');

  // Adverse Drug Reaction (ADR) Modal State
  const [showAdrModal, setShowAdrModal] = useState(false);
  const [adrMedName, setAdrMedName] = useState('');
  const [adrSeverity, setAdrSeverity] = useState('MODERATE');
  const [adrSymptoms, setAdrSymptoms] = useState('');
  const [adrSuccess, setAdrSuccess] = useState('');

  const handleLookup = async (id = patientLookup) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError(null);
    setDispenseSuccess('');

    try {
      const res: any = await api.get(`/pharmacy/lookup/${encodeURIComponent(id.trim())}`);
      if (res.success && res.data) {
        setPharmacyData(res.data);
      } else {
        setError(res.error || 'No matching active prescriptions');
      }
    } catch (err: any) {
      setError(err.message || 'Error conducting pharmacy lookup');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleLookup('SINA-PAT-2026-000001');
  }, []);

  const handleDispenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispensingRx) return;
    try {
      const res: any = await api.post(`/prescriptions/${dispensingRx.id}/dispense`, {
        prescriptionId: dispensingRx.id,
        dispensedQty: Number(dispenseQty),
        dispensedNotes: dispenseNotes,
      });

      if (res.success) {
        setDispenseSuccess('Medication successfully dispensed and logged to the central clinical ledger.');
        setTimeout(() => {
          setDispensingRx(null);
          setDispenseSuccess('');
          handleLookup(patientLookup);
        }, 1500);
      }
    } catch (err: any) {
      alert(`Dispensing error: ${err.message}`);
    }
  };

  const handleAdrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyData?.patient) return;
    try {
      const res: any = await api.post('/pharmacy/adr', {
        patientId: pharmacyData.patient.id,
        medicationName: adrMedName,
        severity: adrSeverity,
        symptoms: adrSymptoms,
        onsetDate: new Date().toISOString(),
      });

      if (res.success) {
        setAdrSuccess('Adverse drug reaction report filed to central pharmacovigilance network.');
        setTimeout(() => {
          setShowAdrModal(false);
          setAdrSuccess('');
          setAdrSymptoms('');
        }, 1500);
      }
    } catch (err: any) {
      alert(`ADR report error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Pharmacy Operations & Compliance Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-control bg-clinical-teal-light text-clinical-teal">
            <Pill className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-clinical-text-primary">
              Pharmacy Dispensary & Safety Console
            </h2>
            <p className="text-[11px] sm:text-xs text-clinical-text-secondary mt-0.5">
              Secure dispensary portal. Strictly limited to the last two eligible prescriptions per patient privacy protocol.
            </p>
          </div>
        </div>

        {/* Patient ID Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(patientLookup);
          }}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={patientLookup}
              onChange={(e) => setPatientLookup(e.target.value)}
              placeholder="Enter Patient ID (e.g. SINA-PAT-2026-000001)..."
              className="h-9 w-full pl-9 pr-3 text-xs bg-clinical-bg border border-clinical-border rounded-control text-clinical-text-primary focus:outline-none focus:border-clinical-teal font-sans"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-9 px-4 shrink-0 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-medium transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Lookup'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-3.5 rounded-control bg-clinical-status-error-bg border border-red-200 text-xs text-clinical-status-error">
          {error}
        </div>
      )}

      {/* Patient & Prescriptions Result */}
      {pharmacyData && (
        <div className="space-y-6">
          {/* Patient Header Block */}
          <div className="rounded-card border border-clinical-border bg-white p-3.5 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-clinical-text-primary">
                  {pharmacyData.patient.firstName} {pharmacyData.patient.lastName}
                </h3>
                <span className="font-mono text-xs font-medium text-clinical-teal bg-clinical-teal-light px-2 py-0.5 rounded-control">
                  {pharmacyData.patient.sinaId}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-clinical-text-secondary mt-1">
                Verified identification verified at dispensing workstation.
              </p>
            </div>

            {/* Documented Allergies Tag */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs text-clinical-text-muted">Documented allergies:</span>
              {pharmacyData.patient.allergies?.length > 0 ? (
                pharmacyData.patient.allergies.map((a: any, idx: number) => (
                  <span key={idx} className="font-mono text-[11px] sm:text-xs font-semibold text-clinical-status-error bg-clinical-status-error-bg px-2 py-0.5 rounded-control border border-red-200">
                    {a.allergen} ({a.severity})
                  </span>
                ))
              ) : (
                <span className="text-xs text-clinical-text-secondary">None on file</span>
              )}
            </div>

            {/* File ADR Action */}
            <button
              onClick={() => {
                setAdrMedName(pharmacyData.prescriptions[0]?.items[0]?.medicationName || '');
                setShowAdrModal(true);
              }}
              className="h-8 px-3 w-full sm:w-auto rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-clinical-text-primary text-xs font-medium transition-colors"
            >
              Report adverse drug reaction
            </button>
          </div>

          {/* Safety Warning Ribbons if Interactions Found */}
          {pharmacyData.safetyOverview && (pharmacyData.safetyOverview.allergyWarnings?.length > 0 || pharmacyData.safetyOverview.interactionAlerts?.length > 0) && (
            <div className="p-4 rounded-card bg-clinical-status-warning-bg/60 border border-amber-200 shadow-subtle space-y-2">
              <div className="flex items-center gap-2 font-semibold text-clinical-status-warning text-xs">
                <ShieldAlert className="h-4 w-4" strokeWidth={1.5} />
                <span>Active Safety & Interaction Alerts</span>
              </div>

              {pharmacyData.safetyOverview.allergyWarnings?.map((w: string, idx: number) => (
                <p key={idx} className="text-xs text-clinical-status-error font-medium pl-6">
                  • {w}
                </p>
              ))}

              {pharmacyData.safetyOverview.interactionAlerts?.map((ia: any, idx: number) => (
                <div key={idx} className="pl-6 text-xs text-clinical-text-primary space-y-0.5">
                  <p className="font-semibold text-clinical-status-warning">
                    • Interaction: {ia.drugA} + {ia.drugB} ({ia.severity})
                  </p>
                  <p className="text-clinical-text-secondary">{ia.description}</p>
                  <p className="text-[11px] text-clinical-teal italic">Action: {ia.clinicalAction}</p>
                </div>
              ))}
            </div>
          )}

          {/* Prescriptions Section (Exactly 2 Max) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-clinical-text-muted uppercase tracking-wider">
                Eligible Prescriptions for Dispensing ({pharmacyData.prescriptions.length} of max 2 shown)
              </h4>
              <span className="text-[11px] font-mono text-clinical-text-muted">
                Audit event recorded
              </span>
            </div>

            {pharmacyData.prescriptions.length === 0 ? (
              <div className="p-8 rounded-card border border-clinical-border bg-white text-center text-xs text-clinical-text-muted">
                No active or unfulfilled prescriptions found for this patient.
              </div>
            ) : (
              pharmacyData.prescriptions.map((rx: Prescription) => (
                <div key={rx.id} className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-clinical-border">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-clinical-teal bg-clinical-teal-light px-2 py-0.5 rounded-control">
                        {rx.status}
                      </span>
                      <span className="text-xs text-clinical-text-muted font-mono">
                        Prescribed: {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-clinical-text-secondary">
                      <span>Doctor: Dr. {rx.doctor.firstName} {rx.doctor.lastName} ({rx.doctor.licenseNumber || 'MD'})</span>
                      <span>·</span>
                      <span>Facility: {rx.organization.name}</span>
                    </div>
                  </div>

                  {/* Prescription Items */}
                  <div className="divide-y divide-clinical-border border border-clinical-border rounded-control overflow-hidden">
                    {rx.items.map((item) => (
                      <div key={item.id} className="p-3.5 bg-clinical-raised/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-clinical-text-primary text-sm">
                              {item.medicationName}
                            </span>
                            <span className="font-mono text-xs text-clinical-teal bg-white px-1.5 py-0.5 rounded border border-clinical-border">
                              {item.strength}
                            </span>
                          </div>
                          <p className="text-clinical-text-secondary">
                            Dosage: {item.dosage} · Frequency: {item.frequency} · Route: {item.route}
                          </p>
                          {item.instructions && (
                            <p className="text-[11px] text-clinical-text-muted italic">
                              Instructions: {item.instructions}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-semibold text-clinical-text-primary tabular-nums">
                            {item.remainingQty} / {item.quantity}
                          </span>
                          <p className="text-[10px] text-clinical-text-muted">units remaining</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispense Action */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setDispensingRx(rx);
                        setDispenseQty(rx.items[0]?.remainingQty || 30);
                      }}
                      className="flex items-center gap-1.5 h-8 px-4 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-medium transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      <span>Dispense prescription</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Dispense Medication */}
      {dispensingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-panel bg-white border border-clinical-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Record Prescription Dispensing
              </h3>
              <button onClick={() => setDispensingRx(null)} className="text-clinical-text-muted hover:text-clinical-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            {dispenseSuccess ? (
              <div className="p-4 rounded-control bg-clinical-status-success-bg border border-green-200 text-xs text-clinical-status-success flex items-center gap-2 mt-4">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{dispenseSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleDispenseSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Medication to dispense</label>
                  <p className="font-semibold text-clinical-text-primary">
                    {dispensingRx.items.map(i => `${i.medicationName} (${i.strength})`).join(', ')}
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Quantity dispensed *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={dispenseQty}
                    onChange={(e) => setDispenseQty(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Pharmacist clinical notes</label>
                  <input
                    type="text"
                    value={dispenseNotes}
                    onChange={(e) => setDispenseNotes(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-clinical-border">
                  <button
                    type="button"
                    onClick={() => setDispensingRx(null)}
                    className="h-8 px-3 rounded-control border border-clinical-border text-clinical-text-secondary hover:bg-clinical-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium"
                  >
                    Confirm & Record Dispensing
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Report Adverse Drug Reaction */}
      {showAdrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-panel bg-white border border-clinical-border shadow-modal p-6">
            <div className="flex items-center justify-between pb-3 border-b border-clinical-border">
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Report Adverse Drug Reaction (ADR)
              </h3>
              <button onClick={() => setShowAdrModal(false)} className="text-clinical-text-muted hover:text-clinical-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            {adrSuccess ? (
              <div className="p-4 rounded-control bg-clinical-status-success-bg border border-green-200 text-xs text-clinical-status-success flex items-center gap-2 mt-4">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{adrSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleAdrSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Suspect medication *</label>
                  <input
                    type="text"
                    required
                    value={adrMedName}
                    onChange={(e) => setAdrMedName(e.target.value)}
                    placeholder="e.g. Warfarin, Lisinopril"
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Severity *</label>
                  <select
                    value={adrSeverity}
                    onChange={(e) => setAdrSeverity(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-control border border-clinical-border bg-white text-xs"
                  >
                    <option value="MILD">Mild (Transient, no treatment needed)</option>
                    <option value="MODERATE">Moderate (Requires dose adjustment/treatment)</option>
                    <option value="SEVERE">Severe (Significant disability or intervention)</option>
                    <option value="LIFE_THREATENING">Life-Threatening</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-clinical-text-secondary mb-1">Symptoms & Clinical observation *</label>
                  <textarea
                    required
                    rows={3}
                    value={adrSymptoms}
                    onChange={(e) => setAdrSymptoms(e.target.value)}
                    placeholder="Describe reaction, onset latency, and patient status..."
                    className="w-full p-2 rounded-control border border-clinical-border bg-clinical-bg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-clinical-border">
                  <button
                    type="button"
                    onClick={() => setShowAdrModal(false)}
                    className="h-8 px-3 rounded-control border border-clinical-border text-clinical-text-secondary hover:bg-clinical-raised"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-control bg-clinical-status-error text-white font-medium hover:bg-red-700"
                  >
                    Submit ADR report
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
