
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Asset } from '@/types/assets';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InvestmentAccountFormFields from './InvestmentAccountFormFields';

interface StockFormFieldsProps {
  ticker: string;
  shares: string;
  purchasePrice: string;
  investmentAccountId: string;
  setTicker: (value: string) => void; 
  setShares: (value: string) => void;
  setPurchasePrice: (value: string) => void;
  setInvestmentAccountId: (value: string) => void;
  investmentAccounts: Asset[];
  onAddAccount?: (account: Omit<Asset, 'id'>) => void;
}

const StockFormFields: React.FC<StockFormFieldsProps> = ({ 
  ticker, 
  shares, 
  purchasePrice,
  investmentAccountId,
  setTicker, 
  setShares,
  setPurchasePrice,
  setInvestmentAccountId,
  investmentAccounts,
  onAddAccount
}) => {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'PEA' | 'CTO' | 'Assurance Vie' | 'PER' | 'Autre'>('PEA');
  const [lastAddedAccountId, setLastAddedAccountId] = useState<string | null>(null);

  const handleAddAccount = () => {
    if (onAddAccount && newAccountName.trim()) {
      const newAccount = {
        name: newAccountName.trim(),
        type: 'investment-account' as const,
        accountType: newAccountType,
        value: 0,
        performance: 0,
      };
      
      // Ajouter le compte
      const addedAccount = onAddAccount(newAccount);
      
      // On réinitialise le formulaire mais on ne ferme PAS la dialog
      setNewAccountName('');
      
      // Si l'ID est disponible immédiatement (si onAddAccount retourne le compte créé)
      if (addedAccount && 'id' in addedAccount) {
        setInvestmentAccountId(addedAccount.id);
        setAccountDialogOpen(false); // Fermer seulement si on a l'ID
      } else {
        // Sinon, on utilisera l'effet pour sélectionner le compte quand il sera disponible
        setLastAddedAccountId('pending');
      }
    }
  };

  // Effet pour sélectionner automatiquement le compte nouvellement ajouté
  React.useEffect(() => {
    if (lastAddedAccountId === 'pending' && investmentAccounts.length > 0) {
      // On cherche le compte le plus récemment ajouté (qui aura l'ID le plus récent)
      const mostRecentAccount = investmentAccounts[investmentAccounts.length - 1];
      if (mostRecentAccount) {
        setInvestmentAccountId(mostRecentAccount.id);
        setLastAddedAccountId(null); // On réinitialise pour ne pas refaire la sélection
        setAccountDialogOpen(false); // Fermer la dialog après avoir sélectionné le compte
      }
    }
  }, [investmentAccounts, lastAddedAccountId, setInvestmentAccountId]);

  return (
    <>
      <div className="mb-4">
        <Label htmlFor="investmentAccount" className="block text-sm font-medium mb-1">
          Compte d'investissement <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <select
            id="investmentAccount"
            value={investmentAccountId}
            onChange={(e) => setInvestmentAccountId(e.target.value)}
            className={`wealth-input flex-grow ${!investmentAccountId ? 'border-red-300 focus:border-red-500' : ''}`}
            required
          >
            <option value="">-- Sélectionner un compte --</option>
            {investmentAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} ({account.accountType})
              </option>
            ))}
          </select>
          <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
            <DialogTrigger asChild>
              <button 
                type="button"
                className="wealth-btn flex items-center gap-1 px-3"
              >
                <Plus size={16} />
                <span>Nouveau</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un compte d'investissement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <InvestmentAccountFormFields
                  accountName={newAccountName}
                  accountType={newAccountType}
                  setAccountName={setNewAccountName}
                  setAccountType={setNewAccountType}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    type="button" 
                    className="wealth-btn"
                    onClick={() => setAccountDialogOpen(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="wealth-btn wealth-btn-primary"
                    onClick={handleAddAccount}
                  >
                    Ajouter le compte
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {!investmentAccountId && (
          <p className="text-red-500 text-xs mt-1">Un compte d'investissement est requis</p>
        )}
      </div>

      <div>
        <Label htmlFor="ticker" className="block text-sm font-medium mb-1">
          Nom de l'action/ETF
        </Label>
        <Input
          id="ticker"
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: AAPL"
        />
      </div>
      <div>
        <Label htmlFor="shares" className="block text-sm font-medium mb-1">
          Quantité d'actions
        </Label>
        <Input
          id="shares"
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 10"
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="purchasePrice" className="block text-sm font-medium mb-1">
          Prix d'achat par action (€)
        </Label>
        <Input
          id="purchasePrice"
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          className="wealth-input w-full"
          placeholder="Ex: 150"
          min="0"
          step="0.01"
        />
      </div>
    </>
  );
};

export default StockFormFields;
