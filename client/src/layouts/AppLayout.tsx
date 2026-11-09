import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Users,
  FileText,
  Pill,
  Building2,
  Share2,
  ShieldCheck,
  Search,
  LogOut,
  Clock,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;

    if (user?.role === 'PHARMACIST') {
      navigate(`/pharmacy?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    } else {
      navigate(`/doctor?search=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
    setIsMobileSearchExpanded(false);
    setIsMobileDrawerOpen(false);
  };

  const navItems = [
    {
      label: 'Clinical workstation',
      shortLabel: 'Clinical',
      path: '/doctor',
      icon: Activity,
      roles: ['DOCTOR', 'SUPER_ADMIN', 'HOSPITAL_ADMIN'],
    },
    {
      label: 'Pharmacy dispensary',
      shortLabel: 'Pharmacy',
      path: '/pharmacy',
      icon: Pill,
      roles: ['PHARMACIST', 'SUPER_ADMIN'],
    },
    {
      label: 'Patient health portal',
      shortLabel: 'My Health',
      path: '/patient',
      icon: Users,
      roles: ['PATIENT', 'SUPER_ADMIN'],
    },
    {
      label: 'Facility & access requests',
      shortLabel: 'Consent',
      path: '/consent',
      icon: Share2,
      roles: ['DOCTOR', 'HOSPITAL_ADMIN', 'SUPER_ADMIN', 'PATIENT'],
    },
    {
      label: 'Administration & audit',
      shortLabel: 'Admin',
      path: '/admin',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN'],
    },
  ];

  const allowedNav = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-clinical-bg text-clinical-text-primary">
      {/* DESKTOP SIDEBAR: 248px Persistent on lg screens */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r border-clinical-border bg-white select-none">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-clinical-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-control bg-clinical-teal text-white">
              <Activity className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-clinical-text-primary leading-tight">
                SINA Health
              </span>
              <span className="text-[10px] text-clinical-text-muted font-mono tracking-wider">
                NETWORK ACCESS
              </span>
            </div>
          </div>
        </div>

        {/* Facility Indicator */}
        <div className="px-4 py-3 border-b border-clinical-border bg-clinical-raised/40">
          <p className="text-[11px] font-medium text-clinical-text-muted">Active facility</p>
          <p className="text-xs font-medium text-clinical-text-primary truncate mt-0.5">
            {user?.organization?.name || 'Central Health Network'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-clinical-status-success"></span>
            <span className="text-[11px] text-clinical-text-secondary font-mono">
              {user?.role.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 py-1">
            <span className="text-[11px] font-medium text-clinical-text-muted tracking-normal">
              Main navigation
            </span>
          </div>

          {allowedNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-clinical-teal-light text-clinical-teal font-semibold'
                    : 'text-clinical-text-secondary hover:text-clinical-text-primary hover:bg-clinical-raised'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-clinical-teal' : 'text-clinical-text-muted'}`} strokeWidth={1.5} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Account / Footer */}
        <div className="p-3 border-t border-clinical-border bg-white">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-control bg-clinical-raised/60">
            <div className="flex flex-col truncate pr-2">
              <span className="text-xs font-medium text-clinical-text-primary truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest Clinician'}
              </span>
              <span className="text-[10px] text-clinical-text-muted truncate font-mono">
                {user?.email}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-clinical-text-muted hover:text-clinical-status-error hover:bg-white rounded-control transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OFF-CANVAS DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10">
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-5 border-b border-clinical-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-control bg-clinical-teal text-white">
                  <Activity className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-sm font-semibold tracking-tight text-clinical-text-primary">
                  SINA Health
                </span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-clinical-text-muted hover:text-clinical-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Facility pill on mobile */}
            <div className="p-4 border-b border-clinical-border bg-clinical-raised/50">
              <p className="text-[10px] font-medium text-clinical-text-muted">Active facility</p>
              <p className="text-xs font-semibold text-clinical-text-primary mt-0.5">
                {user?.organization?.name || 'Central Health Network'}
              </p>
              <span className="inline-block font-mono text-[10px] text-clinical-teal bg-clinical-teal-light px-1.5 py-0.5 rounded mt-1">
                {user?.role.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {allowedNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-control text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-clinical-teal-light text-clinical-teal font-semibold'
                        : 'text-clinical-text-secondary hover:bg-clinical-raised'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-clinical-teal' : 'text-clinical-text-muted'}`} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User profile & logout */}
            <div className="p-3 border-t border-clinical-border bg-white">
              <div className="flex items-center justify-between p-2 rounded-control bg-clinical-raised">
                <div className="truncate">
                  <p className="text-xs font-medium text-clinical-text-primary truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[10px] text-clinical-text-muted font-mono truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-clinical-status-error hover:bg-red-50 rounded-control transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT SHELL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* RESPONSIVE TOP NAV BAR */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-clinical-border bg-white px-4 sm:px-6">
          {/* Left: Mobile hamburger menu toggle & Logo on mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 -ml-1 text-clinical-text-secondary hover:text-clinical-text-primary rounded-control"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="flex lg:hidden items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-control bg-clinical-teal text-white">
                <Activity className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-clinical-text-primary">
                SINA
              </span>
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleGlobalSearch} className="hidden sm:flex items-center w-72 md:w-96">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                <input
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Patient ID (e.g. SINA-PAT-2026-000001)..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-clinical-bg border border-clinical-border rounded-control text-clinical-text-primary placeholder:text-clinical-text-muted focus:outline-none focus:border-clinical-teal focus:ring-1 focus:ring-clinical-teal transition-all font-sans"
                />
              </div>
            </form>
          </div>

          {/* Right: Quick Context / Mobile Search Toggle / Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Mobile search toggle button */}
            <button
              onClick={() => setIsMobileSearchExpanded(v => !v)}
              className="sm:hidden p-1.5 text-clinical-text-muted hover:text-clinical-text-primary rounded-control bg-clinical-bg border border-clinical-border"
              title="Search patient"
            >
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>

            {/* Facility pill on tablet/desktop */}
            <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-clinical-raised px-2.5 py-1 rounded-control border border-clinical-border">
              <Clock className="h-3 w-3 text-clinical-teal" strokeWidth={1.5} />
              <span className="truncate max-w-[150px]">{user?.organization?.name || 'Verified Session'}</span>
            </div>

            {/* User role badge */}
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-control bg-clinical-teal-light text-clinical-teal flex items-center justify-center font-semibold text-xs border border-clinical-border">
                {user?.firstName?.[0] || 'U'}
              </div>
              <span className="hidden sm:inline font-medium text-clinical-text-primary truncate max-w-[120px]">
                {user?.lastName ? `Dr. ${user.lastName}` : user?.firstName}
              </span>
            </div>
          </div>
        </header>

        {/* EXPANDABLE MOBILE SEARCH BAR */}
        {isMobileSearchExpanded && (
          <div className="sm:hidden p-3 bg-white border-b border-clinical-border shadow-subtle animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleGlobalSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-clinical-text-muted" strokeWidth={1.5} />
                <input
                  type="text"
                  autoFocus
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  placeholder="Patient ID (e.g. SINA-PAT-2026-000001)..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-clinical-bg border border-clinical-border rounded-control text-clinical-text-primary focus:outline-none focus:border-clinical-teal font-sans"
                />
              </div>
              <button
                type="submit"
                className="h-9 px-3 rounded-control bg-clinical-teal text-white text-xs font-medium"
              >
                Go
              </button>
            </form>
          </div>
        )}

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-clinical-bg p-3.5 sm:p-6 pb-20 lg:pb-6">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR (Sleek, thumb-friendly app bar) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-clinical-border flex items-center justify-around h-14 px-1 shadow-lg">
          {allowedNav.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] transition-colors relative ${
                  isActive
                    ? 'text-clinical-teal font-semibold'
                    : 'text-clinical-text-secondary hover:text-clinical-text-primary'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-clinical-teal' : 'text-clinical-text-muted'}`} strokeWidth={isActive ? 2 : 1.5} />
                <span className="mt-0.5 truncate max-w-[64px]">{item.shortLabel || item.label}</span>
                {isActive && (
                  <span className="absolute bottom-1 h-1 w-4 rounded-full bg-clinical-teal"></span>
                )}
              </NavLink>
            );
          })}

          {/* Quick Drawer opener for extra tabs */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] text-clinical-text-secondary"
          >
            <Menu className="h-4 w-4 text-clinical-text-muted" strokeWidth={1.5} />
            <span className="mt-0.5">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
