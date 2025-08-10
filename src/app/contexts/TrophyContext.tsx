'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TrophyData {
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

export interface TrophyNotification {
  id: string;
  trophy: TrophyData;
  timestamp: number;
}

interface TrophyContextType {
  notifications: TrophyNotification[];
  addNotification: (trophy: TrophyData) => void;
  removeNotification: (id: string) => void;
  checkTrophyUnlocks: (jobs: any[]) => Promise<TrophyData[]>;
  resetAllTrophies: () => Promise<void>;
  revokeTrophy: (trophyId: string) => Promise<boolean>;
  trophiesLoaded: boolean;
}

const TrophyContext = createContext<TrophyContextType | undefined>(undefined);

// Trophy definitions (shared across components)
export const trophyDefinitions: TrophyData[] = [
  // Bronze Trophies
  { id: 'first_steps', name: 'First Steps', description: 'Submit your first job application', type: 'bronze', requirement: 1, category: 'applications', unlocked: false, progress: 0, rarity: 95 },
  { id: 'getting_started', name: 'Getting Started', description: 'Apply to 10 jobs', type: 'bronze', requirement: 10, category: 'applications', unlocked: false, progress: 0, rarity: 85 },
  { id: 'building_momentum', name: 'Building Momentum', description: 'Apply to 20 jobs', type: 'bronze', requirement: 20, category: 'applications', unlocked: false, progress: 0, rarity: 75 },
  { id: 'persistent_hunter', name: 'Persistent Hunter', description: 'Apply to 30 jobs', type: 'bronze', requirement: 30, category: 'applications', unlocked: false, progress: 0, rarity: 65 },
  { id: 'job_seeker', name: 'Job Seeker', description: 'Apply to 40 jobs', type: 'bronze', requirement: 40, category: 'applications', unlocked: false, progress: 0, rarity: 55 },
  
  // Silver Trophies
  { id: 'half_century', name: 'Half Century', description: 'Apply to 50 jobs', type: 'silver', requirement: 50, category: 'applications', unlocked: false, progress: 0, rarity: 45 },
  { id: 'interview_ready', name: 'Interview Ready', description: 'Get your first interview', type: 'silver', requirement: 1, category: 'interviews', unlocked: false, progress: 0, rarity: 40 },
  { id: 'technical_ace', name: 'Technical Ace', description: 'Complete 5 technical rounds', type: 'silver', requirement: 5, category: 'interviews', unlocked: false, progress: 0, rarity: 35 },
  { id: 'networking_pro', name: 'Networking Pro', description: 'Apply to 75 jobs', type: 'silver', requirement: 75, category: 'applications', unlocked: false, progress: 0, rarity: 30 },
  
  // Gold Trophies
  { id: 'century_club', name: 'Century Club', description: 'Apply to 100 jobs', type: 'gold', requirement: 100, category: 'applications', unlocked: false, progress: 0, rarity: 25 },
  { id: 'interview_expert', name: 'Interview Expert', description: 'Complete 10 interviews', type: 'gold', requirement: 10, category: 'interviews', unlocked: false, progress: 0, rarity: 20 },
  { id: 'offer_magnet', name: 'Offer Magnet', description: 'Receive your first offer', type: 'gold', requirement: 1, category: 'offers', unlocked: false, progress: 0, rarity: 15 },
  { id: 'triple_digits', name: 'Triple Digits', description: 'Apply to 150 jobs', type: 'gold', requirement: 150, category: 'applications', unlocked: false, progress: 0, rarity: 10 },
  
  // Platinum Trophy
  { id: 'career_master', name: 'Career Master', description: 'Land your dream job', type: 'platinum', requirement: 1, category: 'special', unlocked: false, progress: 0, rarity: 5 },
];

export function TrophyProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<TrophyNotification[]>([]);
  const [unlockedTrophyIds, setUnlockedTrophyIds] = useState<Set<string>>(new Set());
  const [notificationsShownThisSession, setNotificationsShownThisSession] = useState<Set<string>>(new Set());
  const [trophiesLoaded, setTrophiesLoaded] = useState(false);

  // Load unlocked trophies from database on mount
  useEffect(() => {
    loadUnlockedTrophies();
  }, []);

  const loadUnlockedTrophies = async () => {
    try {
      const response = await fetch('/api/trophies');
      if (response.ok) {
        const unlockedTrophies: { trophy_id: string }[] = await response.json();
        const unlockedIds = new Set<string>(unlockedTrophies.map(t => t.trophy_id));
        setUnlockedTrophyIds(unlockedIds);
        
        // Mark all existing unlocked trophies as "already shown" to prevent re-showing on page load
        setNotificationsShownThisSession(new Set(unlockedIds));
        
        console.log('📋 Loaded unlocked trophies:', Array.from(unlockedIds));
        console.log('🔕 Marked as already shown:', Array.from(unlockedIds));
      }
    } catch (error) {
      console.error('Error loading unlocked trophies:', error);
    } finally {
      // Mark as loaded regardless of success/failure
      setTrophiesLoaded(true);
      console.log('✅ Trophy loading complete');
    }
  };

  const unlockTrophyInDatabase = async (trophy: TrophyData) => {
    try {
      const response = await fetch('/api/trophies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trophy_id: trophy.id,
          trophy_name: trophy.name,
          trophy_type: trophy.type,
        }),
      });

      if (response.ok) {
        console.log('💾 Trophy saved to database:', trophy.name);
        // Add to local state
        setUnlockedTrophyIds(prev => new Set([...prev, trophy.id]));
        return true;
      } else {
        const error = await response.json();
        console.log('ℹ️ Trophy response:', error.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving trophy to database:', error);
      return false;
    }
  };

  const addNotification = (trophy: TrophyData) => {
    console.log('🏆 Adding notification for trophy:', trophy.name);
    
    const notification: TrophyNotification = {
      id: `${trophy.id}-${Date.now()}`,
      trophy,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const checkTrophyUnlocks = async (jobs: any[]) => {
    // Don't check for unlocks until we've loaded existing trophies from database
    if (!trophiesLoaded) {
      console.log('⏳ Waiting for trophies to load before checking unlocks...');
      return trophyDefinitions; // Return default trophies without checking
    }

    console.log('🔍 Checking trophy unlocks for', jobs.length, 'jobs');
    
    // Calculate current stats
    const currentStats = {
      applications: jobs.length,
      interviews: jobs.filter(job => 
        ['In Interview', 'Technical Round', 'Final Round', 'Offer'].includes(job.status)
      ).length,
      technicalRounds: jobs.filter(job => job.status === 'Technical Round').length,
      offers: jobs.filter(job => job.status === 'Offer').length
    };

    console.log('📊 Current stats:', currentStats);

    // Grace period: 5 minutes in milliseconds
    const GRACE_PERIOD = 5 * 60 * 1000;
    const now = new Date().getTime();

    // Check for trophies that should be revoked (grace period)
    const unlockedTrophies = await fetch('/api/trophies').then(res => res.json()).catch(() => []);
    
    for (const unlockedTrophy of unlockedTrophies) {
      const trophy = trophyDefinitions.find(t => t.id === unlockedTrophy.trophy_id);
      if (!trophy) continue;

      // Check if trophy was unlocked recently (within grace period)
      const unlockedAt = new Date(unlockedTrophy.unlocked_at || unlockedTrophy.created_at).getTime();
      const isWithinGracePeriod = (now - unlockedAt) < GRACE_PERIOD;

      if (isWithinGracePeriod) {
        // Check if trophy conditions are still met
        let currentProgress = 0;
        switch (trophy.category) {
          case 'applications':
            currentProgress = currentStats.applications;
            break;
          case 'interviews':
            currentProgress = trophy.id === 'technical_ace' ? currentStats.technicalRounds : currentStats.interviews;
            break;
          case 'offers':
            currentProgress = currentStats.offers;
            break;
          case 'special':
            currentProgress = currentStats.offers > 0 ? 1 : 0;
            break;
        }

        const stillMeetsRequirement = currentProgress >= trophy.requirement;

        // If within grace period and no longer meets requirement, revoke it
        if (!stillMeetsRequirement) {
          console.log('⏰ Revoking trophy within grace period:', trophy.name);
          try {
            await fetch(`/api/trophies/${trophy.id}`, { method: 'DELETE' });
            // Remove from local state
            setUnlockedTrophyIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(trophy.id);
              return newSet;
            });
            // Also remove from notifications shown this session
            setNotificationsShownThisSession(prev => {
              const newSet = new Set(prev);
              newSet.delete(trophy.id);
              return newSet;
            });
          } catch (error) {
            console.error('Error revoking trophy:', error);
          }
        }
      }
    }

    // Check for new unlocks (existing logic)
    const newlyUnlocked: TrophyData[] = [];

    const updatedTrophies = trophyDefinitions.map(trophy => {
      let currentProgress = 0;
      
      switch (trophy.category) {
        case 'applications':
          currentProgress = currentStats.applications;
          break;
        case 'interviews':
          currentProgress = trophy.id === 'technical_ace' ? currentStats.technicalRounds : currentStats.interviews;
          break;
        case 'offers':
          currentProgress = currentStats.offers;
          break;
        case 'special':
          currentProgress = currentStats.offers > 0 ? 1 : 0;
          break;
      }

      const meetsRequirement = currentProgress >= trophy.requirement;
      const isAlreadyUnlocked = unlockedTrophyIds.has(trophy.id);

      // Debug logging for key trophies
      if (trophy.id === 'first_steps' || trophy.id === 'offer_magnet') {
        console.log(`🎯 Trophy ${trophy.name}:`, {
          currentProgress,
          requirement: trophy.requirement,
          meetsRequirement,
          isAlreadyUnlocked
        });
      }

      // If meets requirement and not already unlocked, it's newly unlocked
      if (meetsRequirement && !isAlreadyUnlocked) {
        console.log('🎉 New trophy unlocked:', trophy.name);
        
        const unlockedTrophy = {
          ...trophy,
          progress: Math.min(currentProgress, trophy.requirement),
          unlocked: true,
          unlockedDate: new Date().toISOString().split('T')[0],
        };
        
        newlyUnlocked.push(unlockedTrophy);
      }

      return {
        ...trophy,
        progress: Math.min(currentProgress, trophy.requirement),
        unlocked: isAlreadyUnlocked || meetsRequirement,
        unlockedDate: isAlreadyUnlocked || meetsRequirement ? new Date().toISOString().split('T')[0] : undefined,
      };
    });

    // Save newly unlocked trophies to database and show notifications
    for (const trophy of newlyUnlocked) {
      const saved = await unlockTrophyInDatabase(trophy);
      if (saved) {
        // Only show notification if we haven't shown it this session
        if (!notificationsShownThisSession.has(trophy.id)) {
          // Mark as shown this session
          setNotificationsShownThisSession(prev => new Set([...prev, trophy.id]));
          
          // Add notification with staggered timing
          setTimeout(() => {
            addNotification(trophy);
          }, newlyUnlocked.indexOf(trophy) * 1000);
        } else {
          console.log('🔕 Skipping notification for already shown trophy:', trophy.name);
        }
      }
    }

    console.log('🏆 Newly unlocked trophies:', newlyUnlocked.map(t => t.name));

    return updatedTrophies;
  };

  const resetAllTrophies = async () => {
    try {
      const response = await fetch('/api/trophies', {
        method: 'DELETE',
      });

      if (response.ok) {
        setUnlockedTrophyIds(new Set());
        setNotificationsShownThisSession(new Set());
        console.log('🔄 All trophies reset');
      }
    } catch (error) {
      console.error('Error resetting trophies:', error);
    }
  };

  const revokeTrophy = async (trophyId: string) => {
    try {
      const response = await fetch(`/api/trophies/${trophyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from local state
        setUnlockedTrophyIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(trophyId);
          return newSet;
        });
        // Also remove from notifications shown this session
        setNotificationsShownThisSession(prev => {
          const newSet = new Set(prev);
          newSet.delete(trophyId);
          return newSet;
        });
        console.log('🗑️ Trophy revoked:', trophyId);
        return true;
      } else {
        console.error('Failed to revoke trophy');
        return false;
      }
    } catch (error) {
      console.error('Error revoking trophy:', error);
      return false;
    }
  };

  return (
    <TrophyContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      checkTrophyUnlocks,
      resetAllTrophies,
      revokeTrophy,
      trophiesLoaded,
    }}>
      {children}
    </TrophyContext.Provider>
  );
}

export function useTrophy() {
  const context = useContext(TrophyContext);
  if (context === undefined) {
    throw new Error('useTrophy must be used within a TrophyProvider');
  }
  return context;
}