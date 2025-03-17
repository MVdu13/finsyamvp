
import React from 'react';
import { Transaction } from '@/types/assets';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { format } from 'date-fns';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface StockTransactionsListProps {
  transactions: Transaction[];
}

const StockTransactionsList: React.FC<StockTransactionsListProps> = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Aucune transaction à afficher</p>
      </div>
    );
  }

  // Trier les transactions par date (la plus récente en premier)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Historique des transactions</h4>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix unitaire</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Montant total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {transaction.date ? format(new Date(transaction.date), 'dd/MM/yyyy') : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {transaction.type === 'buy' ? (
                      <>
                        <ArrowDownRight size={16} className="text-green-600" />
                        <span>Achat</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight size={16} className="text-red-600" />
                        <span>Vente</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{formatCurrency(transaction.price)}</TableCell>
                <TableCell>
                  {transaction.performance !== undefined && (
                    <div className={`flex items-center gap-1 ${transaction.performance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.performance >= 0 ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      <span>{formatPercentage(transaction.performance)}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(transaction.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockTransactionsList;
