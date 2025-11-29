"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanyNavbar from '@/component/CompanyNavbar';
import { Building2, TrendingUp, Shield, Users, BarChart3 } from 'lucide-react';

export default function CompanyMainPage() {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/company-auth/company', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
      } else {
        router.push('/company-login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/company-login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <CompanyNavbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, <span className="text-purple-500">{company?.name}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your enterprise verification and compliance tools.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: TrendingUp, label: 'Active Verifications', value: '234', color: 'text-green-500' },
              { icon: Shield, label: 'Security Score', value: '98%', color: 'text-blue-500' },
              { icon: Users, label: 'Team Members', value: '12', color: 'text-purple-500' },
              { icon: BarChart3, label: 'API Calls', value: '1.2k', color: 'text-orange-500' }
            ].map((stat, index) => (
              <div key={index} className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className={`${stat.color} w-8 h-8`} />
                </div>
                <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-all">
                New Verification
              </button>
              <button className="bg-[#1a1a1a] hover:bg-[#252525] text-white px-6 py-4 rounded-lg font-medium transition-all border border-white/10">
                View Reports
              </button>
              <button className="bg-[#1a1a1a] hover:bg-[#252525] text-white px-6 py-4 rounded-lg font-medium transition-all border border-white/10">
                Team Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-12 bg-[#111] border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'Verification completed', item: 'Document #1234', time: '2 minutes ago', status: 'success' },
                { action: 'New team member added', item: 'john@company.com', time: '1 hour ago', status: 'info' },
                { action: 'API key generated', item: 'Production Key', time: '3 hours ago', status: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-400">{activity.item}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
