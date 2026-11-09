import React from 'react';
import { Encounter } from '../../types';
import {
  Calendar,
  Building2,
  User,
  Heart,
  Activity,
  FileCheck,
  Pill,
  ChevronDown,
  Stethoscope,
  AlertTriangle
} from 'lucide-react';

interface MedicalTimelineProps {
  encounters: Encounter[];
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ encounters }) => {
  if (!encounters || encounters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 rounded-card border border-clinical-border bg-white text-center">
        <Activity className="h-7 w-7 text-clinical-text-muted mb-2" strokeWidth={1.5} />
        <p className="text-sm font-medium text-clinical-text-primary">No clinical encounters recorded</p>
        <p className="text-xs text-clinical-text-secondary mt-1 max-w-sm">
          This patient does not have documented hospital encounters or external consultations in the shared network.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 sm:pl-6 space-y-4 sm:space-y-6 before:absolute before:left-[7px] sm:before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-clinical-border">
      {encounters.map((enc) => {
        const dateFormatted = new Date(enc.startedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        const timeFormatted = new Date(enc.startedAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={enc.id} className="relative group">
            {/* Signature continuity timeline node */}
            <div className="absolute -left-[23px] sm:-left-[29px] top-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white border-2 border-clinical-teal shadow-subtle">
              <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-clinical-teal"></span>
            </div>

            {/* Encounter Card */}
            <div className="rounded-card border border-clinical-border bg-white p-3.5 sm:p-5 shadow-subtle hover:border-clinical-darkBorder transition-colors">
              {/* Header: Date, Facility, Doctor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-clinical-border">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-semibold text-clinical-teal font-mono uppercase tracking-wider bg-clinical-teal-light px-2 py-0.5 rounded-control">
                    {enc.encounterType}
                  </span>
                  <span className="text-xs font-medium text-clinical-text-primary truncate">
                    {enc.department?.name || 'General Consultation'}
                  </span>
                  <span className="text-[11px] sm:text-xs text-clinical-text-muted font-mono">
                    {dateFormatted} at {timeFormatted}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-clinical-text-secondary">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-clinical-text-muted shrink-0" strokeWidth={1.5} />
                    <span className="font-medium text-clinical-text-primary truncate max-w-[180px] sm:max-w-none">{enc.organization.name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-clinical-text-muted shrink-0" strokeWidth={1.5} />
                    <span>Dr. {enc.doctor.firstName} {enc.doctor.lastName}</span>
                  </span>
                </div>
              </div>

              {/* Chief Complaint & Examination */}
              <div className="mt-3 space-y-2.5 sm:space-y-3">
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-medium text-clinical-text-muted">Chief complaint</h4>
                  <p className="text-xs text-clinical-text-primary mt-0.5 leading-relaxed font-normal">
                    {enc.chiefComplaint}
                  </p>
                </div>

                {enc.physicalExam && (
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-medium text-clinical-text-muted">Physical examination</h4>
                    <p className="text-xs text-clinical-text-secondary mt-0.5 leading-relaxed">
                      {enc.physicalExam}
                    </p>
                  </div>
                )}

                {/* Vitals Ribbon with Tabular Numbers */}
                {(enc.bpSys || enc.heartRate || enc.tempCelsius || enc.o2Saturation) && (
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-control bg-clinical-raised border border-clinical-border text-xs">
                    {enc.bpSys && enc.bpDia && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-clinical-text-muted text-[11px]">BP:</span>
                        <span className="font-mono font-medium text-clinical-text-primary tabular-nums">
                          {enc.bpSys}/{enc.bpDia}
                        </span>
                        <span className="text-[10px] text-clinical-text-muted">mmHg</span>
                      </div>
                    )}

                    {enc.heartRate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-clinical-text-muted text-[11px]">HR:</span>
                        <span className="font-mono font-medium text-clinical-text-primary tabular-nums">
                          {enc.heartRate}
                        </span>
                        <span className="text-[10px] text-clinical-text-muted">bpm</span>
                      </div>
                    )}

                    {enc.tempCelsius && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-clinical-text-muted text-[11px]">Temp:</span>
                        <span className="font-mono font-medium text-clinical-text-primary tabular-nums">
                          {enc.tempCelsius}°C
                        </span>
                      </div>
                    )}

                    {enc.o2Saturation && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-clinical-text-muted text-[11px]">SpO₂:</span>
                        <span className="font-mono font-medium text-clinical-text-primary tabular-nums">
                          {enc.o2Saturation}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Diagnoses */}
                {enc.diagnoses && enc.diagnoses.length > 0 && (
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-medium text-clinical-text-muted">Diagnoses</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {enc.diagnoses.map((diag) => (
                        <div
                          key={diag.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-control bg-clinical-raised border border-clinical-border text-xs text-clinical-text-primary"
                        >
                          <span className="font-mono text-[10px] sm:text-[11px] font-medium text-clinical-teal bg-white px-1 py-0.5 rounded border border-clinical-border">
                            {diag.code}
                          </span>
                          <span>{diag.description}</span>
                          {diag.isDefinitive && (
                            <span className="text-[10px] text-clinical-status-success font-medium">
                              (Definitive)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investigations */}
                {enc.investigations && enc.investigations.length > 0 && (
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-medium text-clinical-text-muted">Investigations & Diagnostics</h4>
                    <div className="space-y-1.5 mt-1">
                      {enc.investigations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-control bg-clinical-raised/60 border border-clinical-border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileCheck className="h-3.5 w-3.5 text-clinical-teal shrink-0" strokeWidth={1.5} />
                            <span className="font-medium text-clinical-text-primary">{inv.testName}</span>
                            <span className="text-[10px] text-clinical-text-muted uppercase font-mono">
                              [{inv.category}]
                            </span>
                          </div>
                          <span className="text-xs text-clinical-text-secondary pl-5 sm:pl-0">
                            {inv.resultSummary || 'Completed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptions Linked */}
                {enc.prescriptions && enc.prescriptions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-medium text-clinical-text-muted">Prescribed medications</h4>
                    <div className="space-y-1 mt-1">
                      {enc.prescriptions.flatMap((rx) => rx.items).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-control bg-white border border-clinical-border text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Pill className="h-3.5 w-3.5 text-clinical-teal shrink-0" strokeWidth={1.5} />
                            <span className="font-medium text-clinical-text-primary">
                              {item.medicationName} {item.strength}
                            </span>
                            <span className="text-clinical-text-muted">·</span>
                            <span className="text-clinical-text-secondary">{item.dosage}, {item.frequency}</span>
                          </div>
                          <span className="font-mono text-clinical-text-muted text-[10px] sm:text-[11px] pl-5 sm:pl-0">
                            {item.durationDays} days ({item.quantity} total)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
