
import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import AssetsList from './AssetsList';

interface InvestmentAccountsListProps {
  accounts: Asset[];
  stocks: Asset[];
  onEditAccount: (account: Asset) => void;
  onDeleteAccount: (accountId: string) => void;
  onAddStock: (accountId: string) => void;
  onEditStock: (stock: Asset) => void;
  onDeleteStock: (stockId: string) => void;
}

const InvestmentAccountsList: React.FC<InvestmentAccountsListProps> = ({
  accounts,
  stocks,
  onEditAccount,
  onDeleteAccount,
  onAddStock,
  onEditStock,
  onDeleteStock,
}) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>(
    accounts.reduce((acc, account) => ({ ...acc, [account.id]: true }), {})
  );

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getAccountStocks = (accountId: string) => {
    return stocks.filter(stock => stock.parentAccountId === accountId);
  };

  const getAccountTotalValue = (accountId: string) => {
    const accountStocks = getAccountStocks(accountId);
    return accountStocks.reduce((sum, stock) => sum + stock.value, 0);
  };

  const getAccountPerformance = (accountId: string) => {
    const accountStocks = getAccountStocks(accountId);
    if (accountStocks.length === 0) return 0;
    
    const totalValue = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
    const weightedPerformance = accountStocks.reduce(
      (sum, stock) => sum + (stock.performance || 0) * (stock.value / totalValue),
      0
    );
    
    return weightedPerformance;
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <p className="text-lg text-muted-foreground mb-4">
          Aucun compte d'investissement disponible
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.map(account => {
        const accountStocks = getAccountStocks(account.id);
        const isExpanded = expandedAccounts[account.id];
        const totalValue = getAccountTotalValue(account.id);
        const performance = getAccountPerformance(account.id);

        return (
          <div key={account.id} className="border rounded-lg overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleAccount(account.id)}
            >
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center",
                  "bg-blue-100"
                )}>
                  <span className="font-medium text-sm">
                    {account.accountType?.substring(0, 2) || 'AC'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {account.accountType} - {accountStocks.length} {accountStocks.length > 1 ? 'titres' : 'titre'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(totalValue)}</p>
                  <p className={cn(
                    "text-xs",
                    performance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {performance >= 0 ? "+" : ""}{performance.toFixed(2)}%
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount(account);
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors text-wealth-primary"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAccount(account.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddStock(account.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors text-green-500"
                    title="Ajouter une action"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="p-4 border-t">
                {accountStocks.length > 0 ? (
                  <AssetsList 
                    assets={accountStocks}
                    title=""
                    showActions={false}
                    onEdit={onEditStock}
                    onDelete={onDeleteStock}
                  />
                ) : (
                  <div className="text-center py-6 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      Aucune action ou ETF dans ce compte
                    </p>
                    <button 
                      className="wealth-btn"
                      onClick={() => onAddStock(account.id)}
                    >
                      Ajouter une action
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvestmentAccountsList;
