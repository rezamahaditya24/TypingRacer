'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthFormProps {
  onLogin: (username: string, password: string) => void;
  onSignup: (username: string, password: string) => void;
  error: string | null;
  loading: boolean;
}

export default function AuthForm({ onLogin, onSignup, error, loading }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') onLogin(username, password);
    else onSignup(username, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm p-5 rounded-3xl"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
    >
      <h3 className="text-base font-bold font-display mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
        {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-[10px] font-display font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>USERNAME</label>
          <input
            value={username} onChange={e => setUsername(e.target.value)}
            className="w-full mt-1.5 px-4 py-2.5 rounded-2xl font-sans text-sm focus:outline-none transition-all"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
            maxLength={20} placeholder="Nama pengguna" required
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <div>
          <label className="text-[10px] font-display font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>PASSWORD</label>
          <input
            value={password} onChange={e => setPassword(e.target.value)} type="password"
            className="w-full mt-1.5 px-4 py-2.5 rounded-2xl font-sans text-sm focus:outline-none transition-all"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }}
            minLength={4} placeholder="Minimal 4 karakter" required
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>

        {error && (
          <div className="p-3 rounded-2xl text-xs font-sans font-medium" style={{ background: 'var(--wrong-bg)', color: 'var(--wrong)', border: '1px solid var(--wrong)' }}>
            {error}
          </div>
        )}

        <button
          type="submit" disabled={loading || !username || password.length < 4}
          className="w-full py-3 rounded-2xl text-sm font-bold font-display transition-all btn-primary disabled:opacity-30"
        >
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>
      </form>

      <button
        onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setUsername(''); setPassword(''); }}
        className="w-full mt-3 text-xs font-sans font-medium underline text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </motion.div>
  );
}
