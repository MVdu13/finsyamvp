
import React from 'react';
import { AlertCircle, CheckCircle, ShieldAlert, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

interface SecurityCushionProps {
  currentAmount: number;
  targetAmount: number;
  expenseAmount: number;
  riskProfile: 'high' | 'medium' | 'low';
  onEditClick: () => void;
}

const SecurityCushion: React.FC<SecurityCushionProps> = ({ 
  currentAmount, 
  targetAmount, 
  expenseAmount,
  riskProfile,
  onEditClick
}) => {
  const percentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);
  
  const statusColor = 
    percentage >= 90 ? 'bg-green-500' : 
    percentage >= 50 ? 'bg-yellow-500' : 
    'bg-red-500';
    
  const monthsCovered = Math.floor(currentAmount / expenseAmount);
  
  const recommendedMonths = 
    riskProfile === 'high' ? 3 :
    riskProfile === 'medium' ? 6 :
    9;
    
  const statusMessage = 
    percentage >= 90 ? (
      <span className="flex items-center gap-1 text-green-600">
        <CheckCircle size={16} />
        Votre matelas de sécurité est optimal
      </span>
    ) : percentage >= 50 ? (
      <span className="flex items-center gap-1 text-yellow-600">
        <AlertCircle size={16} />
        Matelas de sécurité à renforcer
      </span>
    ) : (
      <span className="flex items-center gap-1 text-red-600">
        <ShieldAlert size={16} />
        Matelas de sécurité insuffisant
      </span>
    );

  return (
    <div className="wealth-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Matelas de sécurité</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          onClick={onEditClick}
        >
          <Settings size={16} />
          Modifier mon matelas
        </Button>
      </div>
      
      <div className="space-y-5 flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full", statusColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Montant actuel</p>
            <p className="text-lg font-medium">{formatCurrency(currentAmount)}</p>
          </div>
          
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Montant cible</p>
            <p className="text-lg font-medium">{formatCurrency(targetAmount)}</p>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm">
              Profil de risque : <span className="font-medium capitalize">{riskProfile}</span>
            </p>
          </div>
          
          <div>
            <p className="text-sm">
              Recommandation : <span className="font-medium">{recommendedMonths} mois</span> de dépenses
            </p>
          </div>
          
          <div>
            <p className="text-sm">
              Couverture actuelle : <span className="font-medium">{monthsCovered} mois</span> de dépenses
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="text-sm">{statusMessage}</div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCushion;
