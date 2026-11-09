import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Activity,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Pill,
  Hospital,
} from 'lucide-react';
import { Role } from '../../types';

interface Facility {
  id: string;
  name: string;
  type: string;
  pharmacyType?: string;
  address: string;
}

export const SignupPage: React.FC = () => {
  const { registerPatient, registerStaff, isLoading } = useAuth();
  const navigate = useNavigate();

  const [signupType, setSignupType] = useState<'PATIENT' | 'STAFF'>('PATIENT');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successPatient, setSuccessPatient] = useState<any | null>(null);

  // Patient Form State
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dob: '1995-06-15',
    gender: 'MALE',
    bloodGroup: 'O+',
    phone: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    primaryFacilityId: '',
    allergyKnown: 'None',
  });

  // Staff Form State
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'DOCTOR' as Role,
    licenseNumber: '',
    specialty: 'Cardiology',
    organizationId: '',
  });

  useEffect(() => {
    async function loadFacilities() {
      try {
        const res: any = await api.get('/auth/facilities');
        if (res.success && res.data) {
          setFacilities(res.data);
          if (res.data.length > 0) {
            setPatientForm(prev => ({ ...prev, primaryFacilityId: res.data[0].id }));
            setStaffForm(prev => ({ ...prev, organizationId: res.data[0].id }));
          }
        }
      } catch (err) {
        console.warn('Could not load facilities list, using defaults:', err);
      }
    }
    loadFacilities();
  }, []);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const allergies = patientForm.allergyKnown && patientForm.allergyKnown !== 'None'
      ? [{ allergen: patientForm.allergyKnown, severity: 'MODERATE', reaction: 'Reported during registration' }]
      : [];

    try {
      const result = await registerPatient({
        firstName: patientForm.firstName.trim(),
        lastName: patientForm.lastName.trim(),
        email: patientForm.email.trim(),
        password: patientForm.password,
        dob: patientForm.dob,
        gender: patientForm.gender,
        bloodGroup: patientForm.bloodGroup,
        phone: patientForm.phone.trim(),
        address: patientForm.address.trim(),
        emergencyContactName: patientForm.emergencyContactName.trim(),
        emergencyContactPhone: patientForm.emergencyContactPhone.trim(),
        primaryFacilityId: patientForm.primaryFacilityId || undefined,
        allergies,
      });

      setSuccessPatient(result.patient);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await registerStaff({
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
        email: staffForm.email.trim(),
        password: staffForm.password,
        phone: staffForm.phone.trim(),
        role: staffForm.role,
        licenseNumber: staffForm.licenseNumber.trim(),
        specialty: staffForm.role === 'DOCTOR' ? staffForm.specialty : undefined,
        organizationId: staffForm.organizationId || undefined,
      });

      if (staffForm.role === 'DOCTOR') navigate('/doctor');
      else if (staffForm.role === 'PHARMACIST') navigate('/pharmacy');
      else navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Staff registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2 mb-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-clinical-teal text-white shadow-subtle">
          <Activity className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-clinical-text-primary">
          Register with SINA Clinical Network
        </h2>
        <p className="text-xs text-clinical-text-secondary max-w-md mx-auto">
          Create a verified digital medical identity or affiliate your healthcare practice to the nationwide longitudinal record network.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-6 px-6 sm:px-8 rounded-panel border border-clinical-border shadow-subtle space-y-6">
          {/* Success Banner if Patient Registered */}
          {successPatient ? (
            <div className="space-y-4 py-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-clinical-text-primary">
                  Medical Record Successfully Created
                </h3>
                <p className="text-xs text-clinical-text-secondary">
                  Your longitudinal healthcare file has been securely initialized with a unique ID:
                </p>
              </div>

              <div className="p-3 bg-clinical-bg rounded-control border border-clinical-teal/30 inline-block">
                <p className="text-[11px] font-mono text-clinical-text-secondary">Assigned SINA ID</p>
                <p className="text-base font-bold font-mono text-clinical-teal tracking-wide">
                  {successPatient.sinaId}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/patient')}
                  className="w-full h-9 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
                >
                  <span>Open Patient Health Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Type Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-clinical-bg rounded-control border border-clinical-border text-xs">
                <button
                  type="button"
                  onClick={() => { setSignupType('PATIENT'); setError(null); }}
                  className={`py-2 text-center font-medium rounded-control transition-colors flex items-center justify-center gap-1.5 ${
                    signupType === 'PATIENT'
                      ? 'bg-white text-clinical-teal shadow-subtle border border-clinical-border/60'
                      : 'text-clinical-text-secondary hover:text-clinical-text-primary'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Patient Registration</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSignupType('STAFF'); setError(null); }}
                  className={`py-2 text-center font-medium rounded-control transition-colors flex items-center justify-center gap-1.5 ${
                    signupType === 'STAFF'
                      ? 'bg-white text-clinical-teal shadow-subtle border border-clinical-border/60'
                      : 'text-clinical-text-secondary hover:text-clinical-text-primary'
                  }`}
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Healthcare Provider</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-control bg-clinical-status-error-bg border border-red-200 text-xs text-clinical-status-error flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>{error}</span>
                </div>
              )}

              {/* PATIENT REGISTRATION FORM */}
              {signupType === 'PATIENT' && (
                <form onSubmit={handlePatientSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                        placeholder="e.g. Robert"
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                        placeholder="e.g. Mercer"
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="email"
                          required
                          value={patientForm.email}
                          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                          placeholder="patient@example.com"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={patientForm.password}
                          onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Date of Birth *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="date"
                          required
                          value={patientForm.dob}
                          onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Gender *</label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Blood Group</label>
                      <select
                        value={patientForm.bloodGroup}
                        onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal font-mono"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="tel"
                          required
                          value={patientForm.phone}
                          onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                          placeholder="+1 (555) 019-2831"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Residential Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="text"
                          required
                          value={patientForm.address}
                          onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                          placeholder="e.g. 100 Medical Plaza Way"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-clinical-bg rounded-control border border-clinical-border space-y-2.5">
                    <p className="font-semibold text-clinical-text-primary text-[11px]">Emergency Contact Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-clinical-text-muted mb-1 text-[11px]">Contact Name *</label>
                        <input
                          type="text"
                          required
                          value={patientForm.emergencyContactName}
                          onChange={(e) => setPatientForm({ ...patientForm, emergencyContactName: e.target.value })}
                          placeholder="e.g. Jane Mercer"
                          className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-clinical-text-primary bg-white focus:outline-none focus:border-clinical-teal text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-clinical-text-muted mb-1 text-[11px]">Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          value={patientForm.emergencyContactPhone}
                          onChange={(e) => setPatientForm({ ...patientForm, emergencyContactPhone: e.target.value })}
                          placeholder="+1 (555) 019-2832"
                          className="w-full h-8 px-2.5 rounded-control border border-clinical-border text-clinical-text-primary bg-white focus:outline-none focus:border-clinical-teal text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Primary Healthcare Facility</label>
                      <select
                        value={patientForm.primaryFacilityId}
                        onChange={(e) => setPatientForm({ ...patientForm, primaryFacilityId: e.target.value })}
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      >
                        {facilities.length > 0 ? (
                          facilities.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.type})</option>
                          ))
                        ) : (
                          <option value="">Apex Central University Hospital</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Known Drug Allergy</label>
                      <select
                        value={patientForm.allergyKnown}
                        onChange={(e) => setPatientForm({ ...patientForm, allergyKnown: e.target.value })}
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      >
                        <option value="None">No Known Drug Allergies (NKDA)</option>
                        <option value="Penicillin">Penicillin (Severe / Anaphylaxis)</option>
                        <option value="Sulfa">Sulfa Antibiotics</option>
                        <option value="Aspirin">Aspirin / NSAIDs</option>
                        <option value="Morphine">Morphine / Opioids</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-9 mt-2 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
                  >
                    <span>{isLoading ? 'Creating Health Record...' : 'Complete Patient Registration'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}

              {/* HEALTHCARE STAFF REGISTRATION FORM */}
              {signupType === 'STAFF' && (
                <form onSubmit={handleStaffSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-clinical-text-secondary mb-1">Professional Role *</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffForm({ ...staffForm, role: 'DOCTOR' })}
                        className={`p-2 rounded-control border text-center transition-colors ${
                          staffForm.role === 'DOCTOR'
                            ? 'border-clinical-teal bg-teal-50/60 text-clinical-teal font-medium'
                            : 'border-clinical-border bg-clinical-bg text-clinical-text-secondary hover:bg-clinical-border'
                        }`}
                      >
                        <Stethoscope className="h-4 w-4 mx-auto mb-1" />
                        <span>Doctor / Physician</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffForm({ ...staffForm, role: 'PHARMACIST' })}
                        className={`p-2 rounded-control border text-center transition-colors ${
                          staffForm.role === 'PHARMACIST'
                            ? 'border-clinical-teal bg-teal-50/60 text-clinical-teal font-medium'
                            : 'border-clinical-border bg-clinical-bg text-clinical-text-secondary hover:bg-clinical-border'
                        }`}
                      >
                        <Pill className="h-4 w-4 mx-auto mb-1" />
                        <span>Pharmacist</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffForm({ ...staffForm, role: 'HOSPITAL_ADMIN' })}
                        className={`p-2 rounded-control border text-center transition-colors ${
                          staffForm.role === 'HOSPITAL_ADMIN'
                            ? 'border-clinical-teal bg-teal-50/60 text-clinical-teal font-medium'
                            : 'border-clinical-border bg-clinical-bg text-clinical-text-secondary hover:bg-clinical-border'
                        }`}
                      >
                        <Hospital className="h-4 w-4 mx-auto mb-1" />
                        <span>Facility Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={staffForm.firstName}
                        onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                        placeholder="e.g. Arthur"
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={staffForm.lastName}
                        onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                        placeholder="e.g. Chen"
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Institutional Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="email"
                          required
                          value={staffForm.email}
                          onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                          placeholder="doctor@hospital.health"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          placeholder="Min. 6 characters"
                          className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">Professional License ID *</label>
                      <input
                        type="text"
                        required
                        value={staffForm.licenseNumber}
                        onChange={(e) => setStaffForm({ ...staffForm, licenseNumber: e.target.value })}
                        placeholder={staffForm.role === 'DOCTOR' ? 'e.g. MD-9281-CARD' : 'e.g. RPH-6119'}
                        className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-clinical-text-secondary mb-1">
                        {staffForm.role === 'DOCTOR' ? 'Clinical Specialty' : 'Direct Phone'}
                      </label>
                      {staffForm.role === 'DOCTOR' ? (
                        <select
                          value={staffForm.specialty}
                          onChange={(e) => setStaffForm({ ...staffForm, specialty: e.target.value })}
                          className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        >
                          <option value="Cardiology">Cardiology</option>
                          <option value="Internal Medicine">Internal Medicine</option>
                          <option value="Pulmonology">Pulmonology</option>
                          <option value="Neurology">Neurology</option>
                          <option value="Family Medicine">Family Medicine / GP</option>
                          <option value="Emergency Medicine">Emergency Medicine</option>
                          <option value="Pediatrics">Pediatrics</option>
                        </select>
                      ) : (
                        <input
                          type="tel"
                          value={staffForm.phone}
                          onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                          placeholder="+1 (555) 019-2831"
                          className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-clinical-text-secondary mb-1">Facility Affiliation</label>
                    <select
                      value={staffForm.organizationId}
                      onChange={(e) => setStaffForm({ ...staffForm, organizationId: e.target.value })}
                      className="w-full h-9 px-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                    >
                      {facilities.length > 0 ? (
                        facilities.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.type}{f.pharmacyType ? ` - ${f.pharmacyType}` : ''})
                          </option>
                        ))
                      ) : (
                        <option value="">Apex Central University Hospital</option>
                      )}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-9 mt-2 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
                  >
                    <span>{isLoading ? 'Verifying Credentials...' : 'Register Healthcare Provider Account'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </>
          )}

          {/* Navigation to Login */}
          <div className="pt-4 border-t border-clinical-border text-center text-xs text-clinical-text-secondary">
            <span>Already have an authorized SINA account? </span>
            <Link to="/login" className="text-clinical-teal font-medium hover:underline">
              Sign in to clinical network
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
