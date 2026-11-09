import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RecordAccessRequest } from '../../types';
import {
  Share2,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText
} from 'lucide-react';

export const ConsentCenter: React.FC = () => {
  const { user } = useAuth();
  const [facilityRequests, setFacilityRequests] = useState<RecordAccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/consent/facility');
      if (res.success) {
        setFacilityRequests(res.data);
      }
    } catch (err) {
      console.error('Error loading consent requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleFacilityDecision = async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res: any = await api.post(`/consent/requests/${requestId}/facility-decision`, {
        decision,
      });

      if (res.success) {
        setFeedbackMsg(`Facility transfer ${decision === 'APPROVE' ? 'Approved' : 'Rejected'}.`);
        setTimeout(() => {
          setFeedbackMsg('');
          loadRequests();
        }, 1500);
      }
    } catch (err: any) {
      alert(`Decision error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-card border border-clinical-border bg-white shadow-subtle">
        <div>
          <span className="text-[11px] font-mono text-clinical-teal uppercase tracking-wider font-semibold">
            Inter-Facility Transfer Control
          </span>
          <h2 className="text-base font-semibold text-clinical-text-primary mt-0.5">
            Cross-Hospital Record Access Management
          </h2>
          <p className="text-xs text-clinical-text-secondary mt-0.5">
            Multi-organization consent verification pipeline. Both patient consent and source facility approval are required before clinical records are unlocked.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="h-8 px-3 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-xs font-medium text-clinical-text-primary"
        >
          Refresh queue
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-control bg-clinical-status-success-bg border border-green-200 text-xs text-clinical-status-success">
          {feedbackMsg}
        </div>
      )}

      {/* Requests Table */}
      <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
        <div className="pb-3 border-b border-clinical-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-clinical-text-primary">
            Active Cross-Hospital Transfer Requests
          </h3>
          <span className="font-mono text-xs text-clinical-text-muted">
            {facilityRequests.length} requests in ledger
          </span>
        </div>

        {facilityRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-clinical-text-muted italic">
            No pending or active inter-facility requests currently registered for this organization.
          </div>
        ) : (
          <div className="space-y-3">
            {facilityRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-control border border-clinical-border bg-white hover:border-clinical-darkBorder transition-colors space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-clinical-text-primary text-xs">
                      {req.patient?.firstName} {req.patient?.lastName}
                    </span>
                    <span className="font-mono text-[10px] text-clinical-teal bg-clinical-teal-light px-2 py-0.5 rounded">
                      {req.patient?.sinaId}
                    </span>
                    <span className="text-clinical-text-muted text-xs">·</span>
                    <span className="text-xs text-clinical-text-secondary">
                      From {req.sourceOrg.name} → {req.requestingOrg.name}
                    </span>
                  </div>

                  <span className={`font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    req.status === 'FACILITY_APPROVED'
                      ? 'bg-clinical-status-success-bg text-clinical-status-success border border-green-200'
                      : req.status === 'PENDING_FACILITY_APPROVAL'
                      ? 'bg-amber-50 text-clinical-status-warning border border-amber-200'
                      : 'bg-clinical-raised text-clinical-text-secondary border border-clinical-border'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="text-xs text-clinical-text-secondary">
                  <p><strong className="text-clinical-text-primary font-medium">Clinical purpose:</strong> {req.purpose}</p>
                  <p className="text-[11px] text-clinical-text-muted mt-0.5 font-mono">
                    Categories: {req.requestedCategories}
                  </p>
                </div>

                {/* Facility Decision Action (if awaiting facility approval) */}
                {req.status === 'PENDING_FACILITY_APPROVAL' && (user?.role === 'HOSPITAL_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-clinical-border">
                    <button
                      onClick={() => handleFacilityDecision(req.id, 'REJECT')}
                      className="h-8 px-3 rounded-control border border-red-200 text-clinical-status-error hover:bg-red-50 text-xs font-medium"
                    >
                      Reject transfer
                    </button>
                    <button
                      onClick={() => handleFacilityDecision(req.id, 'APPROVE')}
                      className="h-8 px-3.5 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-medium"
                    >
                      Verify policy & approve transfer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
