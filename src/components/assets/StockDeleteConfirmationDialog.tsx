
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StockDeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stockName?: string;
}

const StockDeleteConfirmationDialog: React.FC<StockDeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stockName
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle size={20} />
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            {stockName 
              ? <p>Êtes-vous sûr de vouloir supprimer "{stockName}" ?</p>
              : <p>Êtes-vous sûr de vouloir supprimer cette action ?</p>}
            
            <p className="font-medium text-red-500">Cette action est irréversible.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StockDeleteConfirmationDialog;
