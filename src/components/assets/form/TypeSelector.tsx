
import React from 'react';
import { Banknote, Briefcase, Building2, CreditCard, Landmark, LineChart, Wallet, BookText, FileCheck } from 'lucide-react';
import { AssetType } from '@/types/assets';

interface TypeSelectorProps {
  type: AssetType;
  setType: (type: AssetType) => void;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({ type, setType }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium mb-2">Type d'actif</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setType('bank-account')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'bank-account' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Wallet size={20} />
          <span className="text-xs">Compte bancaire</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('savings-account')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'savings-account' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <BookText size={20} />
          <span className="text-xs">Livret d'épargne</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('investment-account')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'investment-account' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <FileCheck size={20} />
          <span className="text-xs">Compte-titres</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('stock')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'stock' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <LineChart size={20} />
          <span className="text-xs">Action/ETF</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('crypto')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'crypto' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Briefcase size={20} />
          <span className="text-xs">Crypto</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('real-estate')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'real-estate' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Building2 size={20} />
          <span className="text-xs">Immobilier</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('cash')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Banknote size={20} />
          <span className="text-xs">Liquidités</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('bonds')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'bonds' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <CreditCard size={20} />
          <span className="text-xs">Obligations</span>
        </button>
        
        <button
          type="button"
          onClick={() => setType('commodities')}
          className={`p-3 rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${
            type === 'commodities' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          <Landmark size={20} />
          <span className="text-xs">Mat. premières</span>
        </button>
      </div>
    </div>
  );
};

export default TypeSelector;
