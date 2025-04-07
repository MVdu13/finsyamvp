
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import LineChart from "@/components/charts/LineChart";
import { formatCurrency } from '@/lib/formatters';

const CompoundInterestPage = () => {
  const [initialAmount, setInitialAmount] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(100);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(20);
  const [chartData, setChartData] = useState<any[]>([]);
  const [finalAmount, setFinalAmount] = useState<number>(0);
  const [totalContributions, setTotalContributions] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  useEffect(() => {
    calculateCompoundInterest();
  }, [initialAmount, monthlyContribution, annualInterestRate, years]);

  const calculateCompoundInterest = () => {
    const data = [];
    let balance = initialAmount;
    let totalDeposited = initialAmount;
    
    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        const monthlyRate = annualInterestRate / 100 / 12;
        
        for (let month = 0; month < 12; month++) {
          balance = balance * (1 + monthlyRate) + monthlyContribution;
          totalDeposited += monthlyContribution;
        }
      }
      
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalDeposited),
        interest: Math.round(balance - totalDeposited)
      });
    }
    
    setChartData(data);
    setFinalAmount(balance);
    setTotalContributions(totalDeposited);
    setTotalInterest(balance - totalDeposited);
  };
  
  // Prepare data for our custom LineChart component
  const prepareChartData = () => {
    return {
      labels: chartData.map(item => `Année ${item.year}`),
      datasets: [
        {
          label: 'Capital total',
          data: chartData.map(item => item.balance),
          color: '#1d4ed8',
          fill: false,
        },
        {
          label: 'Versements cumulés',
          data: chartData.map(item => item.contributions),
          color: '#4b5563',
          fill: false,
        },
        {
          label: 'Intérêts cumulés',
          data: chartData.map(item => item.interest),
          color: '#16a34a',
          fill: false,
        }
      ]
    };
  };

  // Handlers for input changes
  const handleInitialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setInitialAmount(value);
  };

  const handleMonthlyContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setMonthlyContribution(value);
  };

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAnnualInterestRate(value);
  };

  const handleInterestRateSlider = (value: number[]) => {
    setAnnualInterestRate(value[0]);
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setYears(value);
  };

  const handleYearsSlider = (value: number[]) => {
    setYears(value[0]);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calculateur d'intérêts composés</h1>
            <p className="text-muted-foreground">Planifiez votre épargne et visualisez la croissance de votre capital</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Personnalisez votre simulation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialAmount">Capital initial (€)</Label>
                <Input 
                  id="initialAmount" 
                  type="number" 
                  value={initialAmount} 
                  onChange={handleInitialAmountChange}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Versement mensuel (€)</Label>
                <Input 
                  id="monthlyContribution" 
                  type="number" 
                  value={monthlyContribution} 
                  onChange={handleMonthlyContributionChange}
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="interestRate">Taux d'intérêt annuel (%)</Label>
                  <span className="text-sm font-medium">{annualInterestRate.toFixed(2)}%</span>
                </div>
                <Input 
                  id="interestRate" 
                  type="number" 
                  value={annualInterestRate} 
                  onChange={handleInterestRateChange}
                  min={0}
                  max={20}
                  step={0.1}
                />
                <Slider
                  value={[annualInterestRate]}
                  onValueChange={handleInterestRateSlider}
                  max={20}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="years">Durée (années)</Label>
                  <span className="text-sm font-medium">{years} ans</span>
                </div>
                <Input 
                  id="years" 
                  type="number" 
                  value={years} 
                  onChange={handleYearsChange}
                  min={1}
                  max={50}
                />
                <Slider
                  value={[years]}
                  onValueChange={handleYearsSlider}
                  min={1}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution de votre épargne</CardTitle>
              <CardDescription>Projection sur {years} ans</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="chart">Graphique</TabsTrigger>
                  <TabsTrigger value="table">Tableau</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chart" className="space-y-4">
                  <div className="h-80">
                    {chartData.length > 0 && (
                      <LineChart 
                        data={prepareChartData()} 
                        height={300}
                        title="Évolution des montants"
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Capital final</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(finalAmount)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Versements totaux</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(totalContributions)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Intérêts gagnés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalInterest)}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="table">
                  <div className="rounded-md border overflow-auto max-h-96">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Année</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Capital</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Versements</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Intérêts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {chartData.map((entry) => (
                          <tr key={entry.year}>
                            <td className="px-4 py-2 text-sm">{entry.year}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(entry.balance)}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(entry.contributions)}</td>
                            <td className="px-4 py-2 text-sm text-right text-emerald-600">{formatCurrency(entry.interest)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestPage;
