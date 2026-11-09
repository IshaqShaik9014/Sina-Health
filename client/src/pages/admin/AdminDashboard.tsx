import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  Users,
  Building2,
  Pill,
  Activity,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kpi' | 'facilities' | 'audit'>('kpi');
  const [auditPage, setAuditPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, logsRes, orgsRes]: any[] = await Promise.all([
        api.get('/admin/analytics'),
        api.get(`/admin/audit-logs?page=${auditPage}&limit=20`),
        api.get('/admin/organizations'),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data.logs);
      if (orgsRes.success) setOrganizations(orgsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [auditPage]);

  const handleOrgStatusToggle = async (orgId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    try {
      const res: any = await api.patch(`/admin/organizations/${orgId}/status`, { status: newStatus });
      if (res.success) {
        loadAdminData();
      }
    } catch (err: any) {
      alert(`Status update error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-5 rounded-card border border-clinical-border bg-white shadow-subtle">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono text-clinical-teal uppercase tracking-wider font-semibold">
            Network Governance
          </span>
          <h2 className="text-sm sm:text-base font-semibold text-clinical-text-primary mt-0.5">
            System Administration & Security Console
          </h2>
          <p className="text-[11px] sm:text-xs text-clinical-text-secondary mt-0.5">
            Platform-level oversight, facility verification, analytics, and immutable clinical audit logs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-clinical-raised rounded-control border border-clinical-border text-xs w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('kpi')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-control font-medium text-center whitespace-nowrap transition-colors ${
              activeTab === 'kpi' ? 'bg-white text-clinical-teal shadow-subtle' : 'text-clinical-text-secondary hover:text-clinical-text-primary'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-control font-medium text-center whitespace-nowrap transition-colors ${
              activeTab === 'facilities' ? 'bg-white text-clinical-teal shadow-subtle' : 'text-clinical-text-secondary hover:text-clinical-text-primary'
            }`}
          >
            Facilities
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-control font-medium text-center whitespace-nowrap transition-colors ${
              activeTab === 'audit' ? 'bg-white text-clinical-teal shadow-subtle' : 'text-clinical-text-secondary hover:text-clinical-text-primary'
            }`}
          >
            Audit trail
          </button>
        </div>
      </div>

      {/* TAB 1: KPI & Trends */}
      {activeTab === 'kpi' && analytics && (
        <div className="space-y-6">
          {/* Unslop Stat Cards: Numbers only, label, and clean comparison, 0 decoration */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
              <span className="text-[11px] font-medium text-clinical-text-muted">Total registered patients</span>
              <p className="text-2xl font-semibold text-clinical-text-primary mt-1 font-mono tabular-nums">
                {analytics.kpi.totalPatients}
              </p>
              <span className="text-[11px] text-clinical-status-success font-medium mt-1 inline-block">
                +18% vs last month
              </span>
            </div>

            <div className="p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
              <span className="text-[11px] font-medium text-clinical-text-muted">Participating hospitals</span>
              <p className="text-2xl font-semibold text-clinical-text-primary mt-1 font-mono tabular-nums">
                {analytics.kpi.totalHospitals}
              </p>
              <span className="text-[11px] text-clinical-text-secondary mt-1 inline-block">
                3 verified networks
              </span>
            </div>

            <div className="p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
              <span className="text-[11px] font-medium text-clinical-text-muted">Active community pharmacies</span>
              <p className="text-2xl font-semibold text-clinical-text-primary mt-1 font-mono tabular-nums">
                {analytics.kpi.totalPharmacies}
              </p>
              <span className="text-[11px] text-clinical-text-secondary mt-1 inline-block">
                Connected dispensaries
              </span>
            </div>

            <div className="p-4 rounded-card border border-clinical-border bg-white shadow-subtle">
              <span className="text-[11px] font-medium text-clinical-text-muted">Total clinical encounters</span>
              <p className="text-2xl font-semibold text-clinical-text-primary mt-1 font-mono tabular-nums">
                {analytics.kpi.totalEncounters}
              </p>
              <span className="text-[11px] text-clinical-status-success font-medium mt-1 inline-block">
                +24% vs last month
              </span>
            </div>
          </div>

          {/* Main Chart: Hospital-wide encounter and prescription trend */}
          <div className="p-5 rounded-card border border-clinical-border bg-white shadow-subtle space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Network Clinical Activity Trends
              </h3>
              <p className="text-xs text-clinical-text-secondary mt-0.5">
                Monthly progression of documented consultations and verified prescriptions across all organizations.
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#176B68" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#176B68" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5EAEE" />
                  <XAxis dataKey="month" stroke="#718096" fontSize={11} tickLine={false} />
                  <YAxis stroke="#718096" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5EAEE',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="encounters"
                    name="Encounters"
                    stroke="#176B68"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTeal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="prescriptions"
                    name="Prescriptions"
                    stroke="#258C85"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Facility Approvals */}
      {activeTab === 'facilities' && (
        <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-clinical-border">
            <h3 className="text-sm font-semibold text-clinical-text-primary">
              Registered Healthcare Facilities & Status
            </h3>
            <p className="text-xs text-clinical-text-secondary mt-0.5">
              Hospitals and pharmacies licensed to interact with patient health records.
            </p>
          </div>

          <div className="divide-y divide-clinical-border border border-clinical-border rounded-control overflow-hidden">
            {organizations.map((org) => (
              <div key={org.id} className="p-4 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-clinical-text-primary text-sm">{org.name}</span>
                    <span className="font-mono text-[10px] text-clinical-teal bg-clinical-teal-light px-2 py-0.5 rounded">
                      {org.type}
                    </span>
                    <span className="font-mono text-[10px] text-clinical-text-muted">
                      License: {org.licenseNumber}
                    </span>
                  </div>
                  <p className="text-clinical-text-secondary text-xs">
                    {org.address} · Phone: {org.phone}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-mono text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                    org.status === 'APPROVED' ? 'bg-clinical-status-success-bg text-clinical-status-success border border-green-200' : 'bg-red-50 text-clinical-status-error border border-red-200'
                  }`}>
                    {org.status}
                  </span>

                  <button
                    onClick={() => handleOrgStatusToggle(org.id, org.status)}
                    className="h-7 px-3 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-clinical-text-primary text-xs font-medium transition-colors"
                  >
                    {org.status === 'APPROVED' ? 'Suspend facility' : 'Approve facility'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-card border border-clinical-border bg-white p-5 shadow-subtle space-y-4">
          <div className="pb-3 border-b border-clinical-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Tamper-Resistant Security Audit Trail
              </h3>
              <p className="text-xs text-clinical-text-secondary mt-0.5">
                Every clinical record lookup, prescription creation, pharmacy check, and consent decision is recorded here.
              </p>
            </div>
            <span className="font-mono text-xs text-clinical-text-muted">
              Page {auditPage}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-clinical-raised border-b border-clinical-border text-clinical-text-secondary font-medium">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Record Category</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-clinical-raised/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-clinical-text-muted text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-clinical-text-primary whitespace-nowrap">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-clinical-text-secondary">
                      {log.userRole}
                    </td>
                    <td className="py-2.5 px-3 text-clinical-text-secondary whitespace-nowrap">
                      {log.organization?.name || 'Central'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-clinical-teal font-medium text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-clinical-text-muted text-[11px]">
                      {log.recordCategory}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-clinical-text-primary">
                      {log.patient?.sinaId || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono text-[10px] font-semibold text-clinical-status-success bg-clinical-status-success-bg px-1.5 py-0.5 rounded border border-green-200">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-clinical-border text-xs">
            <button
              disabled={auditPage <= 1}
              onClick={() => setAuditPage(p => Math.max(1, p - 1))}
              className="h-8 px-3 rounded-control border border-clinical-border disabled:opacity-50 hover:bg-clinical-raised"
            >
              Previous
            </button>
            <span className="text-clinical-text-muted font-mono">Page {auditPage}</span>
            <button
              onClick={() => setAuditPage(p => p + 1)}
              className="h-8 px-3 rounded-control border border-clinical-border hover:bg-clinical-raised"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
