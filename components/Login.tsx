/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { LoginCredentials } from '../types';

interface LoginProps {
  onLogin: (creds: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-800 to-blue-600 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                 <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          <h1 className="text-2xl font-bold text-white mb-2">Risk Management Award</h1>
          <p className="text-blue-100">ระบบบริหารจัดการความเสี่ยง 2025</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสพนักงาน / Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="กรอกชื่อผู้ใช้ (เช่น 1111)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            © 2025 Risk Management Department
          </div>
        </div>
      </div>
    </div>
  );
};