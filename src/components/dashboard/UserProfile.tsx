
import React, { useState } from 'react';
import { Shield, User, PenLine } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import InvestorProfileQuestionnaire, { InvestorProfileType } from './InvestorProfileQuestionnaire';

interface UserProfileProps {
  username?: string;
  profileImage?: string;
  netWorth: number;
  riskProfile?: InvestorProfileType;
  onUpdateRiskProfile?: (profile: InvestorProfileType) => void;
}

// Function to determine wealth tier based on net worth
const getWealthTier = (netWorth: number): {
  label: string;
  color: string;
} => {
  if (netWorth < 50000) {
    return {
      label: 'Crevette 🦐',
      color: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
    };
  } else if (netWorth < 250000) {
    return {
      label: 'Dauphin 🐬',
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    };
  } else {
    return {
      label: 'Baleine 🐋',
      color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100',
    };
  }
};

// Function to get risk profile label and color
const getRiskProfile = (riskProfile?: InvestorProfileType) => {
  switch (riskProfile) {
    case 'conservative':
      return {
        label: 'Prudent',
        color: 'bg-green-100 text-green-800 hover:bg-green-100',
      };
    case 'balanced':
      return {
        label: 'Équilibré',
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      };
    case 'aggressive':
      return {
        label: 'Dynamique',
        color: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      };
    case 'offensive':
      return {
        label: 'Offensif',
        color: 'bg-red-100 text-red-800 hover:bg-red-100',
      };
    default:
      return {
        label: 'Équilibré',
        color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      };
  }
};

const UserProfile: React.FC<UserProfileProps> = ({
  username = 'Utilisateur',
  profileImage,
  netWorth,
  riskProfile = 'balanced',
  onUpdateRiskProfile,
}) => {
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  
  const wealthTier = getWealthTier(netWorth);
  const riskProfileData = getRiskProfile(riskProfile);

  const handleOpenQuestionnaire = () => {
    setIsQuestionnaireOpen(true);
  };

  const handleCloseQuestionnaire = () => {
    setIsQuestionnaireOpen(false);
  };

  const handleUpdateProfile = (newProfile: InvestorProfileType) => {
    if (onUpdateRiskProfile) {
      onUpdateRiskProfile(newProfile);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 mr-4 border-2 border-primary/20">
            <AvatarImage src={profileImage} />
            <AvatarFallback className="bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{username}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className={wealthTier.color}>
                {wealthTier.label}
              </Badge>
              
              <Badge variant="outline" className={riskProfileData.color}>
                <Shield className="h-3 w-3 mr-1" />
                {riskProfileData.label}
              </Badge>
            </div>
          </div>
        </div>
        
        <div>
          {onUpdateRiskProfile && (
            <Button
              onClick={handleOpenQuestionnaire}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <PenLine className="h-4 w-4" />
              Mettre à jour son profil investisseur
            </Button>
          )}
        </div>
      </div>

      <InvestorProfileQuestionnaire
        isOpen={isQuestionnaireOpen}
        onClose={handleCloseQuestionnaire}
        onUpdateProfile={handleUpdateProfile}
        currentProfile={riskProfile}
      />
    </div>
  );
};

export default UserProfile;
