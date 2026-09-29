/**
 * ORBIS Auth — Login Page
 * Supports both username/password and mock SSO login.
 * Uses the existing ORBIS Neo-Clay design system.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { LogIn, Key, Eye, EyeOff, ShieldCheck, Fingerprint } from 'lucide-react';

type AuthMode = 'credentials' | 'sso';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, ssoLogin, loading, error } = useAuth();
  const from = (location.state as any)?.from?.pathname || '/measure/dashboard';

  const [mode, setMode] = useState<AuthMode>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ssoToken, setSsoToken] = useState('');

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch {
      // Error is set in the hook
    }
  };

  const handleSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ssoLogin(ssoToken);
      navigate(from, { replace: true });
    } catch {
      // Error is set in the hook
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-syne text-5xl font-[900] text-structural tracking-tight">
            ORBIS
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-grotesk font-bold tracking-widest uppercase"
              style={{
                background: '#2547F4',
                color: '#fff',
                border: '2px solid #121316',
                boxShadow: '2px 2px 0px #121316',
              }}
            >
              <ShieldCheck size={14} />
              COMPETENCY INTELLIGENCE
            </span>
          </div>
          <p className="text-on-surface-variant font-jakarta mt-4 text-sm">
            India's Official Statistical System
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('credentials')}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-grotesk font-bold tracking-wide border-2 border-structural transition-all duration-150 ${
              mode === 'credentials'
                ? 'bg-structural text-white shadow-[3px_3px_0px_#121316]'
                : 'bg-surface text-structural hover:bg-canvas-subtle'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Key size={16} />
              Credentials
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('sso')}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-grotesk font-bold tracking-wide border-2 border-structural transition-all duration-150 ${
              mode === 'sso'
                ? 'bg-structural text-white shadow-[3px_3px_0px_#121316]'
                : 'bg-surface text-structural hover:bg-canvas-subtle'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Fingerprint size={16} />
              iGOT SSO
            </span>
          </button>
        </div>

        {/* Login Card */}
        <div className="clay-card bg-surface p-8">
          {mode === 'credentials' ? (
            <form onSubmit={handleCredentialLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-username"
                  className="block font-grotesk text-sm font-bold text-structural mb-2"
                >
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="arjun.sharma"
                  required
                  className="w-full px-4 py-3 border-2 border-structural rounded-xl font-jakarta text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block font-grotesk text-sm font-bold text-structural mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 border-2 border-structural rounded-xl font-jakarta text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-structural transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-jakarta"
                  style={{
                    background: '#FFE8ED',
                    border: '2px solid #FF5376',
                    color: '#CC294D',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="clay-btn w-full bg-cobalt text-white py-3 px-6 font-grotesk font-bold tracking-wide flex items-center justify-center gap-2 hover:shadow-[6px_6px_0px_#121316] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_#121316] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSSOLogin} className="space-y-5">
              <div className="p-4 rounded-xl bg-canvas-subtle border-2 border-dashed border-structural/20">
                <p className="text-xs font-jakarta text-on-surface-variant leading-relaxed">
                  <strong className="text-structural">Mock SSO:</strong> In production, this
                  would redirect to iGOT/TPAC for OIDC-based single sign-on. For the
                  prototype, enter your Employee ID to simulate SSO authentication.
                </p>
              </div>

              <div>
                <label
                  htmlFor="sso-token"
                  className="block font-grotesk text-sm font-bold text-structural mb-2"
                >
                  Employee ID
                </label>
                <input
                  id="sso-token"
                  type="text"
                  value={ssoToken}
                  onChange={(e) => setSsoToken(e.target.value)}
                  placeholder="CSO-2024-001"
                  required
                  className="w-full px-4 py-3 border-2 border-structural rounded-xl font-jakarta text-sm bg-canvas focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
                />
              </div>

              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-jakarta"
                  style={{
                    background: '#FFE8ED',
                    border: '2px solid #FF5376',
                    color: '#CC294D',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="clay-btn w-full bg-cobalt text-white py-3 px-6 font-grotesk font-bold tracking-wide flex items-center justify-center gap-2 hover:shadow-[6px_6px_0px_#121316] hover:-translate-y-0.5 active:shadow-[2px_2px_0px_#121316] active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    Authenticate via SSO
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Demo credentials */}
        <div className="mt-6 clay-card-sm bg-surface p-5">
          <p className="font-grotesk text-xs font-bold text-structural mb-3 tracking-wide uppercase">
            Demo Accounts
          </p>
          <div className="space-y-2 font-jakarta text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span>
                <strong className="text-structural">arjun.sharma</strong> — Statistical
                Officer
              </span>
              <span className="px-2 py-0.5 rounded-full bg-mint/20 text-mint-dark font-bold text-[10px]">
                OFFICIAL
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                <strong className="text-structural">vikram.reddy</strong> — Deputy Director
              </span>
              <span className="px-2 py-0.5 rounded-full bg-lilac/20 text-lilac-dark font-bold text-[10px]">
                TRAINER
              </span>
            </div>
            <div className="flex justify-between">
              <span>
                <strong className="text-structural">orbis_admin</strong> — Platform Admin
              </span>
              <span className="px-2 py-0.5 rounded-full bg-coral/20 text-coral-dark font-bold text-[10px]">
                ADMIN
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-structural/10">
              <span className="text-on-surface-variant">
                All passwords: <code className="bg-canvas px-1.5 py-0.5 rounded text-structural font-bold">orbis2026</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
