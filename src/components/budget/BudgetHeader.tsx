
import React from 'react';

const BudgetHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Budget & Épargne</h1>
        <p className="text-muted-foreground">Gérez vos finances mensuelles</p>
      </div>
    </div>
  );
};

export default BudgetHeader;
