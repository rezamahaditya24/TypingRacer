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
      className="w-full max-w-sm p-4 rounded-xl"
      style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}
    >
      <h3 className="text-sm font-bold font-sans mb-3 text-center" style={{ color: 'var(--text-primary)' }}>
        {mode === 'login' ? '🔑 Masuk' : '📝 Daftar Akun'}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-[10px] font-sans font-bold" style={{ color: 'var(--text-muted)' }}>USERNAME</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            className="w-full mt-1 p-2 rounded-lg font-sans text-sm focus:outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            maxLength={20} placeholder="Nama pengguna" required />
        </div>
        <div>
          <label className="text-[10px] font-sans font-bold" style={{ color: 'var(--text-muted)' }}>PASSWORD</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password"
            className="w-full mt-1 p-2 rounded-lg font-sans text-sm focus:outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            minLength={4} placeholder="Minimal 4 karakter" required />
        </div>

        {error && (
          <div className="p-2 rounded-lg text-xs font-sans" style={{ background: 'var(--wrong-bg)', color: 'var(--wrong)', border: '1px solid var(--wrong)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !username || password.length < 4}
          className="w-full p-2 rounded-lg text-sm font-medium transition-transform hover:scale-105 disabled:opacity-50 glass-accent"
          style={{ color: 'var(--accent)' }}>
          {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
        </button>
      </form>

      <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setUsername(''); setPassword(''); }}
        className="w-full mt-2 text-xs font-sans underline text-center"
        style={{ color: 'var(--text-muted)' }}>
        {mode === 'login' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </motion.div>
  );
}
