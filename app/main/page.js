"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/component/Navbar';
import { Hexagon, BarChart3, Users, Shield, TrendingUp } from 'lucide-react';

export default function MainPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // User not authenticated, redirect to home
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="pt-20">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <Hexagon size={24} fill="white" className="rotate-90 text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">Veritas Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome back, {user.name?.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Your intelligent verification and analytics platform is ready to help you make informed decisions.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">Verified</span>
              </div>
              <p className="text-2xl font-bold text-white">1,247</p>
              <p className="text-sm text-gray-400">Total verifications</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Analytics</span>
              </div>
              <p className="text-2xl font-bold text-white">94.7%</p>
              <p className="text-sm text-gray-400">Accuracy rate</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-medium">Team</span>
              </div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm text-gray-400">Active members</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-orange-400" />
                </div>
                <span className="text-orange-400 text-sm font-medium">Growth</span>
              </div>
              <p className="text-2xl font-bold text-white">+23%</p>
              <p className="text-sm text-gray-400">This month</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                  <Shield size={20} className="text-purple-400" />
                </div>
                <span className="text-lg font-semibold">New Verification</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Start a new verification process for your data or content.
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                Start Verification
              </button>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                  <BarChart3 size={20} className="text-blue-400" />
                </div>
                <span className="text-lg font-semibold">View Analytics</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Access detailed reports and insights about your verifications.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                View Reports
              </button>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 hover:border-purple-500/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                  <Users size={20} className="text-green-400" />
                </div>
                <span className="text-lg font-semibold">Team Management</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Manage your team members and their access permissions.
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Manage Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}