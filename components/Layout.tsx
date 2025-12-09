/** @jsx React.createElement */
/** @jsxFrag React.Fragment */
import React from 'react';
import { User } from '../types';
import { LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: 'details' | 'dashboard';
  setActiveTab: (tab: 'details' | 'dashboard') => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-200" />
            <h1 className="text-xl font-bold tracking-tight">Risk Management Award 2025</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-blue-100 bg-blue-800/50 px-3 py-1.5 rounded-full text-sm">
              <UserIcon className="w-4 h-4" />
              <span className="font-medium truncate max-w-[200px]">{user.division}</span>
              {user.isAdmin && <span className="bg-amber-400 text-blue-900 text-xs px-2 py-0.5 rounded-full font-bold ml-1">ADMIN</span>}
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200 text-blue-100 hover:text-white"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              รายละเอียดคะแนน
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard ภาพรวม
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
};