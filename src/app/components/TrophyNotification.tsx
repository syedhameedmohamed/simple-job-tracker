'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, X, Sparkles } from 'lucide-react';
import { useTrophy, TrophyNotification as TrophyNotificationType } from '../contexts/TrophyContext';

// Move helper functions to the top
const getTrophyIcon = (type: string) => {
  const iconProps = { size: 24, className: 'text-white' };
  
  switch (type) {
    case 'platinum':
      return <Trophy {...iconProps} className="text-cyan-300" />;
    case 'gold':
      return <Trophy {...iconProps} className="text-yellow-400" />;
    case 'silver':
      return <Medal {...iconProps} className="text-gray-300" />;
    case 'bronze':
      return <Award {...iconProps} className="text-amber-600" />;
    default:
      return <Award {...iconProps} />;
  }
};

const getTrophyColors = (type: string) => {
  switch (type) {
    case 'platinum':
      return {
        gradient: 'from-cyan-600 to-blue-600',
        border: 'border-cyan-400/50',
        shadow: 'shadow-cyan-500/30',
        glow: 'shadow-cyan-500/50'
      };
    case 'gold':
      return {
        gradient: 'from-yellow-600 to-orange-600',
        border: 'border-yellow-400/50',
        shadow: 'shadow-yellow-500/30',
        glow: 'shadow-yellow-500/50'
      };
    case 'silver':
      return {
        gradient: 'from-gray-500 to-gray-600',
        border: 'border-gray-400/50',
        shadow: 'shadow-gray-500/30',
        glow: 'shadow-gray-500/50'
      };
    case 'bronze':
      return {
        gradient: 'from-amber-600 to-orange-600',
        border: 'border-amber-400/50',
        shadow: 'shadow-amber-500/30',
        glow: 'shadow-amber-500/50'
      };
    default:
      return {
        gradient: 'from-blue-600 to-purple-600',
        border: 'border-blue-400/50',
        shadow: 'shadow-blue-500/30',
        glow: 'shadow-blue-500/50'
      };
  }
};

const TrophyNotifications = () => {
  const { notifications, removeNotification } = useTrophy();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
      {notifications.map((notification, index) => (
        <TrophyNotificationCard 
          key={notification.id} 
          notification={notification} 
          index={index}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface TrophyNotificationCardProps {
  notification: TrophyNotificationType;
  index: number;
  onClose: () => void;
}

const TrophyNotificationCard: React.FC<TrophyNotificationCardProps> = ({ 
  notification, 
  index, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { trophy } = notification;
  const colors = getTrophyColors(trophy.type);

  useEffect(() => {
    // Stagger the entrance of multiple notifications
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [index]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`pointer-events-auto transform transition-all duration-500 ease-out ${
        isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}
      style={{ transitionDelay: isExiting ? '0ms' : `${index * 100}ms` }}
    >
      <div 
        className={`
          relative w-96 bg-gradient-to-r ${colors.gradient} 
          backdrop-blur-md border ${colors.border} 
          rounded-2xl p-6 shadow-2xl ${colors.shadow}
          hover:${colors.glow} transition-all duration-300
          trophy-notification-card
        `}
        onClick={handleClose}
      >
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 animate-shine"></div>
        
        {/* Sparkles for Platinum */}
        {trophy.type === 'platinum' && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
        >
          <X size={16} className="text-white" />
        </button>

        {/* Notification Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {getTrophyIcon(trophy.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-bold text-lg">Trophy Unlocked!</h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                trophy.type === 'platinum' ? 'bg-cyan-500/30 text-cyan-200' :
                trophy.type === 'gold' ? 'bg-yellow-500/30 text-yellow-200' :
                trophy.type === 'silver' ? 'bg-gray-500/30 text-gray-200' :
                'bg-amber-500/30 text-amber-200'
              }`}>
                {trophy.type.toUpperCase()}
              </div>
            </div>
            <p className="text-white/90 text-sm">{trophy.rarity}% of users have this</p>
          </div>
        </div>

        {/* Trophy Info */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xl">{trophy.name}</h4>
          <p className="text-white/80 text-sm">{trophy.description}</p>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/70">Progress</span>
            <span className="text-white font-medium">{trophy.progress}/{trophy.requirement}</span>
          </div>
          <div className="mt-2 w-full bg-white/20 rounded-full h-2">
            <div 
              className="h-2 bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Achievement Date */}
        <div className="mt-3 text-right">
          <span className="text-white/60 text-xs">
            Achieved {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrophyNotifications;