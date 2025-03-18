
import React, { useState, useMemo } from 'react';
import { Building2, Plus, Map, LineChart, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Wallet, Percent, Coins, Shield, TrendingUp, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/formatters';
import { Asset, AssetType } from '@/types/assets';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import LineChartComponent from '@/components/charts/LineChart';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AssetForm from '@/components/assets/AssetForm';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import TimeFrameSelector, { TimeFrame } from '@/components/charts/TimeFrameSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RealEstatePageProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

// Define the property filter types
type PropertyFilter = 'all' | 'residential' | 'rental';

const RealEstatePage: React.FC<RealEstatePageProps> = ({ assets, onAddAsset, onUpdateAsset, onDeleteAsset }) => {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>('all');
  
  // Properties are real estate assets
  const properties = assets.filter(asset => asset.type === 'real-estate');

  // Separate properties by usage type
  const residentialProperties = properties.filter(property => 
    property.usageType === 'main' || property.usageType === 'secondary'
  );

  const rentalProperties = properties.filter(property => 
    property.usageType === 'rental'
  );

  // Get filtered properties based on the selected filter
  const filteredProperties = useMemo(() => {
    switch (propertyFilter) {
      case 'residential':
        return residentialProperties;
      case 'rental':
        return rentalProperties;
      case 'all':
      default:
        return properties;
    }
  }, [properties, residentialProperties, rentalProperties, propertyFilter]);

  // Calculate financials based on filtered properties
  const realEstateMetrics = useMemo(() => {
    const totalValue = filteredProperties.reduce((sum, property) => sum + property.value, 0);
    
    // Calculate annual income (rent)
    const annualIncome = filteredProperties.reduce((sum, property) => {
      return sum + (property.annualRent || 0);
    }, 0);
    
    // Calculate annual costs (property tax, annual fees, annual charges)
    const annualCosts = filteredProperties.reduce((sum, property) => {
      return sum + (property.propertyTax || 0) + (property.annualFees || 0) + (property.annualCharges || 0) + (property.housingTax || 0);
    }, 0);
    
    // Calculate gross yield
    const grossYield = totalValue > 0 ? (annualIncome / totalValue) * 100 : 0;
    
    // Calculate net income
    const netIncome = annualIncome - annualCosts;
    const netYield = totalValue > 0 ? (netIncome / totalValue) * 100 : 0;
    
    return {
      totalValue,
      annualIncome,
      annualCosts,
      netIncome,
      grossYield,
      netYield,
    };
  }, [filteredProperties]);

  const avgPerformance = filteredProperties.length > 0 
    ? filteredProperties.reduce((sum, property) => sum + (property.performance || 0), 0) / filteredProperties.length
    : 0;

  // Get filter label for the UI
  const getFilterLabel = () => {
    switch (propertyFilter) {
      case 'residential':
        return 'Résidences principales et secondaires';
      case 'rental':
        return 'Biens locatifs';
      case 'all':
      default:
        return 'Ensemble du patrimoine immobilier';
    }
  };

  // Get filter icon for the UI
  const getFilterIcon = () => {
    switch (propertyFilter) {
      case 'residential':
        return <Home className="h-4 w-4 mr-2" />;
      case 'rental':
        return <Building2 className="h-4 w-4 mr-2" />;
      case 'all':
      default:
        return <Wallet className="h-4 w-4 mr-2" />;
    }
  };

  // Générer un historique cohérent basé sur la valeur totale actuelle et la timeframe
  const generateChartData = () => {
    const baseValue = realEstateMetrics.totalValue > 0 ? realEstateMetrics.totalValue : 0;
    
    // Déterminer le nombre de points de données selon la timeframe
    let numDataPoints;
    let labels;
    
    // Créer des dates basées sur la timeframe sélectionnée
    const currentDate = new Date();
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (timeFrame) {
      case '1M':
        // Jours du mois
        numDataPoints = 30;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1));
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '3M':
        // Points hebdomadaires sur 3 mois
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 7);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '6M':
        // Bi-hebdomadaire sur 6 mois
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setDate(currentDate.getDate() - (numDataPoints - i - 1) * 14);
          return `${date.getDate()} ${months[date.getMonth()]}`;
        });
        break;
      case '5Y':
        // Mensuel sur 5 ans
        numDataPoints = 60;
        labels = Array.from({ length: Math.min(numDataPoints, 24) }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (Math.min(numDataPoints, 24) - i - 1));
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        });
        break;
      case 'ALL':
        // Annuel
        numDataPoints = 5;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setFullYear(currentDate.getFullYear() - (numDataPoints - i - 1));
          return date.getFullYear().toString();
        });
        break;
      case '1Y':
      default:
        // Mensuel sur 1 an
        numDataPoints = 12;
        labels = Array.from({ length: numDataPoints }, (_, i) => {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - (numDataPoints - i - 1));
          return months[date.getMonth()];
        });
        break;
    }
    
    // Si aucun bien immobilier, retourner des valeurs à zéro
    if (baseValue === 0) {
      return {
        labels,
        datasets: [
          {
            label: getFilterLabel(),
            data: Array(labels.length).fill(0),
            color: '#FA5003',
            fill: true,
          }
        ]
      };
    }
    
    // L'immobilier est généralement moins volatile que les actions ou les cryptos
    const volatilityFactor = timeFrame === '1M' ? 0.01 : 
                             timeFrame === '3M' ? 0.02 : 
                             timeFrame === '6M' ? 0.03 : 
                             timeFrame === '5Y' ? 0.10 : 
                             timeFrame === 'ALL' ? 0.15 : 0.05; // 1Y
    
    const generateRandomWalk = (steps: number, finalValue: number, volatility: number) => {
      // Commencer avec une valeur initiale inférieure à la valeur finale pour simuler une croissance
      let initialValue = finalValue * (1 - Math.random() * volatility);
      const result = [initialValue];
      
      for (let i = 1; i < steps - 1; i++) {
        // Calculer la prochaine valeur avec une tendance vers la valeur finale
        const progress = i / (steps - 1);
        const trend = initialValue + progress * (finalValue - initialValue);
        
        // Ajouter une variation aléatoire autour de la tendance
        const randomFactor = 1 + (Math.random() * 2 - 1) * volatility * (1 - progress);
        result.push(trend * randomFactor);
      }
      
      // Ajouter la valeur finale
      result.push(finalValue);
      
      return result.map(val => Math.round(val));
    };
    
    const values = generateRandomWalk(labels.length, baseValue, volatilityFactor);
    
    return {
      labels,
      datasets: [
        {
          label: getFilterLabel(),
          data: values,
          color: '#FA5003',
          fill: true,
        }
      ]
    };
  };

  const chartData = generateChartData();

  const handleAddProperty = (newProperty: Omit<Asset, 'id'>) => {
    // Make sure we're adding a real-estate asset
    const realEstateAsset = {
      ...newProperty,
      type: 'real-estate' as AssetType
    };
    
    // Call the parent's onAddAsset function
    onAddAsset(realEstateAsset);
    setAddDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Bien immobilier ajouté",
      description: `${newProperty.name} a été ajouté à votre portefeuille`,
    });
  };

  const handleEditProperty = (editedProperty: Omit<Asset, 'id'>) => {
    if (selectedAsset) {
      const updatedProperty = {
        ...editedProperty,
        id: selectedAsset.id,
        type: 'real-estate' as AssetType
      };
      
      onUpdateAsset(updatedProperty);
      setEditDialogOpen(false);
      setSelectedAsset(null);
      
      toast({
        title: "Bien immobilier modifié",
        description: `${editedProperty.name} a été mis à jour avec succès`,
      });
    }
  };

  const handleDeleteProperty = () => {
    if (selectedAsset) {
      onDeleteAsset(selectedAsset.id);
      setDeleteDialogOpen(false);
      setSelectedAsset(null);
      
      toast({
        title: "Bien immobilier supprimé",
        description: "Le bien immobilier a été supprimé avec succès",
      });
    }
  };

  const openEditDialog = (property: Asset) => {
    setSelectedAsset(property);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (property: Asset) => {
    setSelectedAsset(property);
    setDeleteDialogOpen(true);
  };

  // Debug to check if values are present
  console.log("Properties:", properties);
  console.log("Metrics:", realEstateMetrics);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patrimoine Immobilier</h1>
          <p className="text-muted-foreground">Gérez vos biens immobiliers et suivez leur performance</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="wealth-btn wealth-btn-primary flex items-center gap-2">
              <Plus size={16} />
              <span>Ajouter un bien</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un bien immobilier</DialogTitle>
              <DialogDescription>
                Renseignez les informations de votre bien immobilier
              </DialogDescription>
            </DialogHeader>
            <AssetForm 
              onSubmit={handleAddProperty} 
              onCancel={() => setAddDialogOpen(false)} 
              defaultType="real-estate" 
              showTypeSelector={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet size={16} />
              Valeur Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realEstateMetrics.totalValue)}</div>
            <div className={cn(
              "text-xs flex items-center mt-1",
              avgPerformance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {avgPerformance >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{avgPerformance > 0 ? "+" : ""}{avgPerformance.toFixed(1)}% cette année</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} />
              Rendement Brut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realEstateMetrics.annualIncome)}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <Percent size={14} className="mr-1" />
              {realEstateMetrics.grossYield.toFixed(2)}% par an
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins size={16} />
              Coût Annuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realEstateMetrics.annualCosts)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Taxes, charges, frais divers
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield size={16} />
              Rendement Net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              realEstateMetrics.netYield >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(realEstateMetrics.netIncome)}
            </div>
            <div className={cn(
              "text-xs mt-1 flex items-center",
              realEstateMetrics.netYield >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <Percent size={14} className="mr-1" />
              {realEstateMetrics.netYield.toFixed(2)}% par an
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Évolution de la valeur</CardTitle>
            <CardDescription>
              {timeFrame === '1Y' ? 'Sur les 12 derniers mois' : 
               timeFrame === '1M' ? 'Sur le dernier mois' : 
               timeFrame === '3M' ? 'Sur les 3 derniers mois' : 
               timeFrame === '6M' ? 'Sur les 6 derniers mois' : 
               timeFrame === '5Y' ? 'Sur les 5 dernières années' : 
               'Historique complet'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={propertyFilter} 
              onValueChange={(value: PropertyFilter) => setPropertyFilter(value)}
            >
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Type de bien">
                  <div className="flex items-center">
                    {getFilterIcon()}
                    {getFilterLabel()}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 mr-2" />
                    Ensemble du patrimoine immobilier
                  </div>
                </SelectItem>
                <SelectItem value="residential">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Résidences principales et secondaires
                  </div>
                </SelectItem>
                <SelectItem value="rental">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Biens locatifs
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <TimeFrameSelector 
              selectedTimeFrame={timeFrame} 
              onTimeFrameChange={setTimeFrame} 
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChartComponent data={chartData} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Vos Résidences Principales et Secondaires</h2>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Type d'usage</TableHead>
                <TableHead>Taxe foncière</TableHead>
                <TableHead>Taxe d'habitation</TableHead>
                <TableHead>Date d'acquisition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentialProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.description}</TableCell>
                  <TableCell>{formatCurrency(property.value)}</TableCell>
                  <TableCell>
                    {property.usageType === 'main' ? 'Résidence principale' : 'Résidence secondaire'}
                  </TableCell>
                  <TableCell>{formatCurrency(property.propertyTax || 0)}</TableCell>
                  <TableCell>{formatCurrency(property.housingTax || 0)}</TableCell>
                  <TableCell>
                    {property.createdAt 
                      ? new Date(property.createdAt).toLocaleDateString() 
                      : 'Non spécifiée'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditDialog(property)}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-blue-600"
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(property)}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {residentialProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    Aucune résidence principale ou secondaire enregistrée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Vos Biens Locatifs</h2>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Revenu annuel</TableHead>
                <TableHead>Coût annuel</TableHead>
                <TableHead>Rendement net</TableHead>
                <TableHead>Date d'acquisition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentalProperties.map((property) => {
                // Calculate individual property metrics
                const annualIncome = property.annualRent || 0;
                const annualCosts = (property.propertyTax || 0) + (property.annualFees || 0) + (property.annualCharges || 0);
                const netIncome = annualIncome - annualCosts;
                const netYield = property.value > 0 ? (netIncome / property.value) * 100 : 0;
                
                return (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{property.description}</TableCell>
                    <TableCell>{formatCurrency(property.value)}</TableCell>
                    <TableCell>{formatCurrency(annualIncome)}</TableCell>
                    <TableCell>{formatCurrency(annualCosts)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center",
                        netYield >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {netYield.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {property.createdAt 
                        ? new Date(property.createdAt).toLocaleDateString() 
                        : 'Non spécifiée'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditDialog(property)}
                          className="p-2 rounded-full hover:bg-muted transition-colors text-blue-600"
                          title="Modifier"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(property)}
                          className="p-2 rounded-full hover:bg-muted transition-colors text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rentalProperties.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    Aucun bien locatif enregistré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialogue de modification */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un bien immobilier</DialogTitle>
            <DialogDescription>
              Modifiez les informations de votre bien immobilier
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <AssetForm 
              onSubmit={handleEditProperty} 
              onCancel={() => setEditDialogOpen(false)} 
              defaultType="real-estate" 
              showTypeSelector={false}
              initialValues={selectedAsset}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement {selectedAsset?.name} de votre portefeuille.
              Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RealEstatePage;
