
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";
import { ShieldAlert } from 'lucide-react';

interface SecurityCushionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {currentAmount: number, riskProfile: 'high' | 'medium' | 'low'}) => void;
  currentAmount: number;
  riskProfile: 'high' | 'medium' | 'low';
}

const SecurityCushionForm: React.FC<SecurityCushionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  currentAmount,
  riskProfile
}) => {
  const [amount, setAmount] = useState(currentAmount.toString());
  const [risk, setRisk] = useState<'high' | 'medium' | 'low'>(riskProfile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez renseigner le montant de votre matelas de sécurité.",
        variant: "destructive",
      });
      return;
    }

    try {
      const numAmount = parseFloat(amount);
      
      if (isNaN(numAmount) || numAmount < 0) {
        toast({
          title: "Montant invalide",
          description: "Le montant doit être un nombre positif.",
          variant: "destructive",
        });
        return;
      }

      onSave({
        currentAmount: numAmount,
        riskProfile: risk
      });

      onClose();
      toast({
        title: "Modification réussie",
        description: "Votre matelas de sécurité a été mis à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-blue-500" />
            <span>Ajuster votre matelas de sécurité</span>
          </DialogTitle>
          <DialogDescription>
            Configurez votre matelas de sécurité selon votre profil de risque.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cushion-amount">Montant actuel (€)</Label>
            <Input 
              id="cushion-amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 10000"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="risk-profile">Profil de risque</Label>
            <Select 
              value={risk} 
              onValueChange={(value) => setRisk(value as 'high' | 'medium' | 'low')}
            >
              <SelectTrigger id="risk-profile">
                <SelectValue placeholder="Sélectionner un profil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex flex-col">
                    <span>Prudent (9 mois)</span>
                    <span className="text-xs text-muted-foreground">Couverture élevée, sécurité maximale</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col">
                    <span>Équilibré (6 mois)</span>
                    <span className="text-xs text-muted-foreground">Couverture moyenne, bon équilibre</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex flex-col">
                    <span>Dynamique (3 mois)</span>
                    <span className="text-xs text-muted-foreground">Couverture minimale, plus d'investissement</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-sm">
            <p className="text-blue-800">
              <strong>Note:</strong> Le matelas de sécurité recommandé dépend de votre profil de risque:
            </p>
            <ul className="list-disc ml-5 mt-1 text-blue-700">
              <li>Profil prudent: 9 mois de dépenses</li>
              <li>Profil équilibré: 6 mois de dépenses</li>
              <li>Profil dynamique: 3 mois de dépenses</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityCushionForm;
