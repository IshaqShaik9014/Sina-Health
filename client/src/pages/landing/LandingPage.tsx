import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  Building2,
  Pill,
  Users,
  Share2,
  Lock,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const handleQuickEnter = async (role: any, path: string) => {
    try {
      await quickLoginAs(role);
      navigate(path);
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg text-clinical-text-primary selection:bg-clinical-teal/15 selection:text-clinical-teal-dark">
      {/* Quiet Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-clinical-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-control bg-clinical-teal text-white">
              <Activity className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold tracking-tight text-clinical-text-primary">
                SINA Health
              </span>
              <span className="text-[9px] sm:text-[10px] text-clinical-text-muted font-mono tracking-wider">
                NETWORK ACCESS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <Link
              to="/login"
              className="text-clinical-text-secondary hover:text-clinical-text-primary font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="h-8 px-3 sm:px-3.5 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium transition-colors text-[11px] sm:text-xs flex items-center justify-center shadow-subtle"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Exact, Restrained, Trustworthy */}
      <section className="pt-10 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 border-b border-clinical-border bg-white">
        <div className="mx-auto max-w-4xl text-center space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-control bg-clinical-raised border border-clinical-border text-[11px] sm:text-xs text-clinical-text-secondary font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-clinical-teal shrink-0" strokeWidth={1.5} />
            <span className="truncate">Consent-Governed Clinical Network</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-clinical-text-primary leading-[1.2] sm:leading-[1.15]">
            Unified patient medical records connecting hospitals and pharmacies.
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-clinical-text-secondary leading-relaxed font-normal">
            SINA provides a centralized longitudinal medical history where every patient has a unique ID. Healthcare facilities access diagnostic reports, encounters, and prescriptions strictly through patient consent.
          </p>

          {/* Quick Interactive Demo Personas */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => handleQuickEnter('DOCTOR', '/doctor')}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-control bg-clinical-teal text-white hover:bg-clinical-teal-hover text-xs font-medium transition-colors shadow-subtle"
            >
              <span>Explore as Doctor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => handleQuickEnter('PHARMACIST', '/pharmacy')}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-control bg-clinical-raised hover:bg-clinical-border text-clinical-text-primary text-xs font-medium border border-clinical-border transition-colors"
            >
              <Pill className="h-3.5 w-3.5 text-clinical-teal" strokeWidth={1.5} />
              <span>Explore as Pharmacist</span>
            </button>

            <button
              onClick={() => handleQuickEnter('PATIENT', '/patient')}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-control bg-clinical-raised hover:bg-clinical-border text-clinical-text-primary text-xs font-medium border border-clinical-border transition-colors"
            >
              <Users className="h-3.5 w-3.5 text-clinical-teal" strokeWidth={1.5} />
              <span>Explore as Patient</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg font-semibold text-clinical-text-primary">
              Engineered for clinical precision and data sovereignty
            </h2>
            <p className="text-xs text-clinical-text-secondary leading-relaxed">
              Designed around strict role boundaries, automated interaction checking, and patient-first authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card border border-clinical-border bg-white shadow-subtle space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-control bg-clinical-teal-light text-clinical-teal">
                <Activity className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Chronological Medical Timeline
              </h3>
              <p className="text-xs text-clinical-text-secondary leading-relaxed">
                Consolidated timeline of admissions, chief complaints, ICD-10 diagnoses, laboratory tests, and treatment notes across all participating healthcare networks.
              </p>
            </div>

            <div className="p-6 rounded-card border border-clinical-border bg-white shadow-subtle space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-control bg-clinical-teal-light text-clinical-teal">
                <Pill className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Pharmacist 2-Prescription Safety
              </h3>
              <p className="text-xs text-clinical-text-secondary leading-relaxed">
                Dispensary privacy enforcement: pharmacists access strictly the last two eligible prescriptions, active allergy cross-checks, and drug-drug contraindication alerts.
              </p>
            </div>

            <div className="p-6 rounded-card border border-clinical-border bg-white shadow-subtle space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-control bg-clinical-teal-light text-clinical-teal">
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-clinical-text-primary">
                Cross-Hospital Consent Protocol
              </h3>
              <p className="text-xs text-clinical-text-secondary leading-relaxed">
                Zero automatic record transfers. Hospital Y must request access with a stated clinical purpose, approved by the patient and verified by the source hospital.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-clinical-border bg-white py-8 px-6 text-center text-xs text-clinical-text-muted">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-clinical-text-primary">SINA</span>
            <span>· Smart Integrated Network for Healthcare Access</span>
          </div>
          <p className="font-mono text-[11px]">
            Unslop design architecture · Clinical precision & data sovereignty
          </p>
        </div>
      </footer>
    </div>
  );
};
