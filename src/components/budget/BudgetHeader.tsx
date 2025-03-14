
import React from 'react';
import { Download } from 'lucide-react';

const BudgetHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Budget & Épargne</h1>
        <p className="text-muted-foreground">Gérez vos finances mensuelles</p>
      </div>
      
      <div className="flex gap-3">
        <button className="wealth-btn wealth-btn-secondary flex items-center gap-2">
          <Download size={18} />
          <span>Exporter</span>
        </button>
      </div>
    </div>
  );
};

export default BudgetHeader;
