import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Role } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('dr.chen@sina.health');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/doctor');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleQuickLogin = async (role: Role, redirectPath: string) => {
    setError(null);
    try {
      await quickLoginAs(role);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-clinical-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-clinical-teal text-white shadow-subtle">
          <Activity className="h-5 w-5" strokeWidth={2} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-clinical-text-primary">
          SINA Clinical Network Sign In
        </h2>
        <p className="text-xs text-clinical-text-secondary">
          Authorized personnel, healthcare providers, and patient portal access.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 rounded-panel border border-clinical-border shadow-subtle space-y-6">
          {error && (
            <div className="p-3 rounded-control bg-clinical-status-error-bg border border-red-200 text-xs text-clinical-status-error flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-clinical-text-secondary mb-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-clinical-text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-control border border-clinical-border text-clinical-text-primary bg-clinical-bg focus:outline-none focus:border-clinical-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-control bg-clinical-teal hover:bg-clinical-teal-hover text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign in to clinical network'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-clinical-border space-y-2.5">
            <p className="text-[11px] font-medium text-clinical-text-muted text-center">
              Quick 1-Click Demo Accounts (Pre-configured)
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('DOCTOR', '/doctor')}
                className="p-2 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-left transition-colors"
              >
                <p className="font-semibold text-clinical-text-primary text-[11px]">Dr. Arthur Chen</p>
                <p className="text-[10px] text-clinical-text-muted">Cardiologist (Doctor)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PHARMACIST', '/pharmacy')}
                className="p-2 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-left transition-colors"
              >
                <p className="font-semibold text-clinical-text-primary text-[11px]">Maya Lin</p>
                <p className="text-[10px] text-clinical-text-muted">Pharmacist (Dispensary)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PATIENT', '/patient')}
                className="p-2 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-left transition-colors"
              >
                <p className="font-semibold text-clinical-text-primary text-[11px]">Robert Mercer</p>
                <p className="text-[10px] text-clinical-text-muted">Patient (Self-Access)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('HOSPITAL_ADMIN', '/admin')}
                className="p-2 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-left transition-colors"
              >
                <p className="font-semibold text-clinical-text-primary text-[11px]">Eleanor Vance</p>
                <p className="text-[10px] text-clinical-text-muted">Hospital Administrator</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('SUPER_ADMIN', '/admin')}
              className="w-full p-2 rounded-control border border-clinical-border bg-clinical-raised hover:bg-clinical-border text-center transition-colors text-[11px] font-semibold text-clinical-text-primary"
            >
              Sign in as Super Administrator (Al-Farabi Ibn Sina)
            </button>
          </div>

          <div className="pt-3 border-t border-clinical-border text-center text-xs text-clinical-text-secondary">
            <span>New patient or healthcare facility? </span>
            <Link to="/signup" className="text-clinical-teal font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
