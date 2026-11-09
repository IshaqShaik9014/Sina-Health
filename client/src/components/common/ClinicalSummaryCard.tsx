import React from 'react';
import { Patient } from '../../types';
import { User, ShieldAlert, Heart, Building2, Phone, Calendar } from 'lucide-react';

interface ClinicalSummaryCardProps {
  patient: Patient;
}

export const ClinicalSummaryCard: React.FC<ClinicalSummaryCardProps> = ({ patient }) => {
  const calculateAge = (dobString: string) => {
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const age = calculateAge(patient.dob);

  return (
    <div className="rounded-card border border-clinical-border bg-white p-3.5 sm:p-5 shadow-subtle">
      {/* Patient Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-clinical-border">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-control bg-clinical-teal-light text-clinical-teal font-semibold text-sm sm:text-base">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-clinical-text-primary">
                {patient.firstName} {patient.lastName}
              </h2>
              <span className="font-mono text-[11px] sm:text-xs font-medium text-clinical-teal bg-clinical-teal-light px-2 py-0.5 rounded-control">
                {patient.sinaId}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs text-clinical-text-secondary mt-1">
              <span>{age} yrs ({patient.gender})</span>
              <span>·</span>
              <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
              {patient.bloodGroup && (
                <>
                  <span>·</span>
                  <span className="font-mono font-medium text-clinical-text-primary">
                    Blood: {patient.bloodGroup}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs text-clinical-text-secondary pt-2 sm:pt-0 border-t sm:border-t-0 border-clinical-border/50">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-clinical-text-muted">Primary facility:</span>
            <span className="font-medium text-clinical-text-primary flex items-center gap-1">
              <Building2 className="h-3 w-3 text-clinical-teal shrink-0" strokeWidth={1.5} />
              {patient.primaryFacility?.name || 'Network Registered'}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-clinical-text-muted mt-0.5">
            Emergency: {patient.emergencyContactName} ({patient.emergencyContactPhone})
          </span>
        </div>
      </div>

      {/* Grid: Allergies & Confirmed Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4">
        {/* Allergies Block */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-clinical-status-error" strokeWidth={1.5} />
            <span className="text-xs font-medium text-clinical-text-primary">Documented allergies</span>
          </div>

          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="space-y-1.5">
              {patient.allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-center justify-between p-2 rounded-control bg-clinical-status-error-bg/60 border border-red-200 text-xs"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-medium text-clinical-status-error">{allergy.allergen}</span>
                    <span className="text-clinical-text-secondary text-[10px] sm:text-[11px]">({allergy.reaction})</span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-white text-clinical-status-error border border-red-200">
                    {allergy.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-clinical-text-muted italic bg-clinical-raised p-2 rounded-control border border-clinical-border">
              No known drug or environmental allergies documented.
            </p>
          )}
        </div>

        {/* Existing Medical Conditions */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-clinical-teal" strokeWidth={1.5} />
            <span className="text-xs font-medium text-clinical-text-primary">Active medical conditions</span>
          </div>

          {patient.conditions && patient.conditions.length > 0 ? (
            <div className="space-y-1.5">
              {patient.conditions.map((cond) => (
                <div
                  key={cond.id}
                  className="flex items-center justify-between p-2 rounded-control bg-clinical-raised border border-clinical-border text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-clinical-text-primary">{cond.conditionName}</span>
                    {cond.icd10Code && (
                      <span className="font-mono text-[10px] text-clinical-text-muted bg-white px-1.5 py-0.5 rounded border border-clinical-border">
                        {cond.icd10Code}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-clinical-teal bg-clinical-teal-light px-1.5 py-0.5 rounded">
                    {cond.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-clinical-text-muted italic bg-clinical-raised p-2 rounded-control border border-clinical-border">
              No chronic conditions recorded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
