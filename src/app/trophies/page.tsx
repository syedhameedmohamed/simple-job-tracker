'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Star, Lock, Calendar, Target, RotateCcw } from 'lucide-react';
import { trophyDefinitions, useTrophy } from '../contexts/TrophyContext';

interface Job {
  id: number;
  company: string;
  position: string;
  link: string;
  status: string;
  date_added: string;
  notes: string;
}

interface UnlockedTrophy {
  trophy_id: string;
  unlocked_date: string;
}

interface TrophyData {
  id: string;
  name: string;
  description: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirement: number;
  category: 'applications' | 'interviews' | 'offers' | 'special';
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  rarity: number;
}

const TrophiesPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [trophies, setTrophies] = useState<TrophyData[]>(trophyDefinitions);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum'>('all');
  const { resetAllTrophies, revokeTrophy } = useTrophy();

  // Handle manual trophy removal
  const handleRevokeTrophy = async (trophyId: string, trophyName: string) => {
    const confirmed = window.confirm(
      `Remove "${trophyName}" trophy?\n\nThis should only be used if the trophy was unlocked by mistake. This action cannot be undone.`
    );
    
    if (confirmed) {
      const success = await revokeTrophy(trophyId);
      if (success) {
        // Refresh the page data
        window.location.reload();
      } else {
        alert('Failed to remove trophy. Please try again.');
      }
    }
  };

  // Fetch jobs and unlocked trophies, then calculate progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch('/api/jobs');
        const jobsData = jobsResponse.ok ? await jobsResponse.json() : [];
        
        // Fetch unlocked trophies
        const trophiesResponse = await fetch('/api/trophies');
        const unlockedTrophies = trophiesResponse.ok ? await trophiesResponse.json() : [];
        
        setJobs(jobsData);
        calculateTrophyProgress(jobsData, unlockedTrophies);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateTrophyProgress = (jobsData: Job[], unlockedTrophies: UnlockedTrophy[]) => {
    const totalApplications = jobsData.length;
    const interviews = jobsData.filter(job => 
      ['In Interview', 'Technical Round', 'Final Round', 'Offer'].includes(job.status)
    ).length;
    const technicalRounds = jobsData.filter(job => job.status === 'Technical Round').length;
    const offers = jobsData.filter(job => job.status === 'Offer').length;

    // Create a set of unlocked trophy IDs
    const unlockedIds = new Set(unlockedTrophies.map(t => t.trophy_id));

    const updatedTrophies = trophyDefinitions.map(trophy => {
      let currentProgress = 0;
      
      switch (trophy.category) {
        case 'applications':
          currentProgress = totalApplications;
          break;
        case 'interviews':
          currentProgress = trophy.id === 'technical_ace' ? technicalRounds : interviews;
          break;
        case 'offers':
          currentProgress = offers;
          break;
        case 'special':
          currentProgress = offers > 0 ? 1 : 0;
          break;
      }

      const isUnlocked = unlockedIds.has(trophy.id);
      const unlockedTrophy = unlockedTrophies.find(t => t.trophy_id === trophy.id);

      return {
        ...trophy,
        progress: Math.min(currentProgress, trophy.requirement),
        unlocked: isUnlocked,
        unlockedDate: unlockedTrophy?.unlocked_date,
      };
    });

    setTrophies(updatedTrophies);
  };

  const handleResetTrophies = async () => {
    if (window.confirm('Are you sure you want to reset all trophies? This action cannot be undone.')) {
      await resetAllTrophies();
      // Refresh the page data
      window.location.reload();
    }
  };

  const getTrophyIcon = (type: string, unlocked: boolean) => {
    const iconProps = { size: 32, className: unlocked ? 'text-white' : 'text-slate-500' };
    
    switch (type) {
      case 'platinum':
        return unlocked ? <Trophy {...iconProps} className="text-cyan-300" /> : <Lock {...iconProps} />;
      case 'gold':
        return unlocked ? <Trophy {...iconProps} className="text-yellow-400" /> : <Lock {...iconProps} />;
      case 'silver':
        return unlocked ? <Medal {...iconProps} className="text-gray-300" /> : <Lock {...iconProps} />;
      case 'bronze':
        return unlocked ? <Award {...iconProps} className="text-amber-600" /> : <Lock {...iconProps} />;
      default:
        return <Lock {...iconProps} />;
    }
  };

  const getTrophyCardStyle = (type: string, unlocked: boolean) => {
    if (!unlocked) {
      return 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/30';
    }
    
    switch (type) {
      case 'platinum':
        return 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-cyan-500/30 shadow-cyan-500/20';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-900/60 to-orange-900/60 border-yellow-500/30 shadow-yellow-500/20';
      case 'silver':
        return 'bg-gradient-to-r from-gray-700/60 to-slate-700/60 border-gray-400/30 shadow-gray-400/20';
      case 'bronze':
        return 'bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-amber-600/30 shadow-amber-600/20';
      default:
        return 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-slate-600/30';
    }
  };

  const filteredTrophies = selectedCategory === 'all' 
    ? trophies 
    : trophies.filter(trophy => trophy.type === selectedCategory);

  const stats = {
    total: trophies.length,
    unlocked: trophies.filter(t => t.unlocked).length,
    bronze: trophies.filter(t => t.type === 'bronze' && t.unlocked).length,
    silver: trophies.filter(t => t.type === 'silver' && t.unlocked).length,
    gold: trophies.filter(t => t.type === 'gold' && t.unlocked).length,
    platinum: trophies.filter(t => t.type === 'platinum' && t.unlocked).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* PS5 Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(59,130,246,0.03)_49%,rgba(59,130,246,0.03)_51%,transparent_52%)] bg-[length:20px_20px]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 pl-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md rounded-2xl border border-slate-600/30 p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Trophy Collection
                </h1>
                <p className="text-slate-300 mt-1">Track your career achievements</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stats.unlocked}/{stats.total}</div>
                <div className="text-slate-400 text-sm">Trophies Unlocked</div>
                <div className="text-purple-400 text-sm">{Math.round((stats.unlocked / stats.total) * 100)}% Complete</div>
              </div>
              
              {/* Reset Button for Testing */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={handleResetTrophies}
                  className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                  title="Reset all trophies (development only)"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trophy Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-amber-600">{stats.bronze}</div>
                <div className="text-slate-300 text-sm">Bronze</div>
              </div>
              <Award className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-gray-300">{stats.silver}</div>
                <div className="text-slate-300 text-sm">Silver</div>
              </div>
              <Medal className="w-6 h-6 text-gray-300" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-yellow-400">{stats.gold}</div>
                <div className="text-slate-300 text-sm">Gold</div>
              </div>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-cyan-300">{stats.platinum}</div>
                <div className="text-slate-300 text-sm">Platinum</div>
              </div>
              <Trophy className="w-6 h-6 text-cyan-300" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold text-purple-400">{Math.round((stats.unlocked / stats.total) * 100)}%</div>
                <div className="text-slate-300 text-sm">Complete</div>
              </div>
              <Target className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8">
          {['all', 'bronze', 'silver', 'gold', 'platinum'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Trophy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrophies.map((trophy) => (
            <div
              key={trophy.id}
              className={`backdrop-blur-md rounded-2xl border p-6 shadow-xl transition-all duration-300 hover:scale-105 ${getTrophyCardStyle(trophy.type, trophy.unlocked)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${trophy.unlocked ? 'bg-white/10' : 'bg-slate-800/50'}`}>
                    {getTrophyIcon(trophy.type, trophy.unlocked)}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${trophy.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {trophy.name}
                    </h3>
                    <p className={`text-sm ${trophy.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                      {trophy.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full ${trophy.unlocked ? 'bg-green-500/20 text-green-300' : 'bg-slate-700/50 text-slate-400'}`}>
                    {trophy.rarity}% rare
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-slate-300">{trophy.progress}/{trophy.requirement}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      trophy.unlocked 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min((trophy.progress / trophy.requirement) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Unlock Date */}
              {trophy.unlocked && trophy.unlockedDate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-green-300">
                    <Calendar size={14} />
                    <span>Unlocked {trophy.unlockedDate}</span>
                  </div>
                  
                  {/* Manual Remove Button - Only show for unlocked trophies */}
                  <button
                    onClick={() => handleRevokeTrophy(trophy.id, trophy.name)}
                    className="text-xs text-red-400 hover:text-red-300 underline opacity-50 hover:opacity-100 transition-opacity"
                    title="Remove this trophy (use only if unlocked by mistake)"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrophiesPage;