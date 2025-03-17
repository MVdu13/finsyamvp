
import React, { useState } from 'react';
import { FileCheck, ChevronDown, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Asset } from '@/types/assets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InvestmentAccountsListProps {
  accounts: Asset[];
  stocks: Asset[];
  onAddStock: () => void;
  onAddAccount: () => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

const InvestmentAccountsList: React.FC<InvestmentAccountsListProps> = ({
  accounts,
  stocks,
  onAddStock,
  onAddAccount,
  onEditAsset,
  onDeleteAsset
}) => {
  const [openAccounts, setOpenAccounts] = useState<Record<string, boolean>>({});

  const toggleAccount = (accountId: string) => {
    setOpenAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // Group stocks by parent account
  const stocksByAccount: Record<string, Asset[]> = {};
  
  // Initialize with empty arrays for all accounts
  accounts.forEach(account => {
    stocksByAccount[account.id] = [];
  });
  
  // Add stocks to their parent accounts
  stocks.forEach(stock => {
    if (stock.parentAccountId && stocksByAccount[stock.parentAccountId]) {
      stocksByAccount[stock.parentAccountId].push(stock);
    }
  });
  
  // Get stocks without a parent account
  const unassignedStocks = stocks.filter(stock => !stock.parentAccountId);

  // Get account type label
  const getAccountTypeLabel = (type?: string) => {
    switch (type) {
      case 'cto': return 'Compte-Titres Ordinaire';
      case 'pea': return 'Plan d\'Épargne en Actions';
      case 'per': return 'Plan d\'Épargne Retraite';
      case 'assurance-vie': return 'Assurance Vie';
      default: return 'Compte d\'investissement';
    }
  };

  return (
    <div className="space-y-6">
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-4">Aucun compte d'investissement</h3>
            <Button onClick={onAddAccount} className="wealth-btn wealth-btn-primary">
              Créer un compte d'investissement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {accounts.map(account => {
            const accountStocks = stocksByAccount[account.id] || [];
            const accountTotal = accountStocks.reduce((sum, stock) => sum + stock.value, 0);
            const isOpen = openAccounts[account.id] || false;
            
            return (
              <Card key={account.id} className="overflow-hidden">
                <Collapsible open={isOpen} onOpenChange={() => toggleAccount(account.id)}>
                  <CollapsibleTrigger asChild>
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <div className="flex flex-col">
                          <h3 className="font-medium">{account.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {getAccountTypeLabel(account.accountType)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{formatCurrency(accountTotal)}</span>
                        <div className="flex items-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditAsset(account);
                            }}
                            className="p-1 rounded-full hover:bg-muted"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAsset(account.id);
                            }}
                            className="p-1 rounded-full hover:bg-muted text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-0 pl-10 space-y-3">
                      {accountStocks.length === 0 ? (
                        <div className="py-3 text-center text-muted-foreground">
                          <p>Aucune action dans ce compte</p>
                          <Button 
                            onClick={onAddStock} 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                          >
                            <Plus size={16} className="mr-1" />
                            Ajouter une action
                          </Button>
                        </div>
                      ) : (
                        <>
                          {accountStocks.map(stock => (
                            <div 
                              key={stock.id} 
                              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                            >
                              <div>
                                <h4>{stock.name}</h4>
                                <p className="text-xs text-muted-foreground">{stock.description}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span>{formatCurrency(stock.value)}</span>
                                <div className="flex items-center">
                                  <button 
                                    onClick={() => onEditAsset(stock)}
                                    className="p-1 rounded-full hover:bg-muted"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button 
                                    onClick={() => onDeleteAsset(stock.id)}
                                    className="p-1 rounded-full hover:bg-muted text-red-500"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button 
                            onClick={onAddStock} 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto block mt-3"
                          >
                            <Plus size={16} className="mr-1" />
                            Ajouter une action
                          </Button>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
          
          <Button onClick={onAddAccount} className="wealth-btn wealth-btn-secondary">
            <Plus size={16} className="mr-1" />
            Créer un nouveau compte d'investissement
          </Button>
          
          {unassignedStocks.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Actions sans compte assigné</h3>
                <div className="space-y-2">
                  {unassignedStocks.map(stock => (
                    <div 
                      key={stock.id} 
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                    >
                      <div>
                        <h4>{stock.name}</h4>
                        <p className="text-xs text-muted-foreground">{stock.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{formatCurrency(stock.value)}</span>
                        <div className="flex items-center">
                          <button 
                            onClick={() => onEditAsset(stock)}
                            className="p-1 rounded-full hover:bg-muted"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => onDeleteAsset(stock.id)}
                            className="p-1 rounded-full hover:bg-muted text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentAccountsList;
