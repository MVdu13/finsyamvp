
import React, { useState, useEffect } from 'react';
import { 
  Command,
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList
} from "@/components/ui/command";
import { searchCryptos, CryptoInfo } from '@/services/cryptoService';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CryptoSearchProps {
  onSelect: (crypto: CryptoInfo) => void;
}

const CryptoSearch: React.FC<CryptoSearchProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CryptoInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const cryptos = await searchCryptos(query);
        setResults(cryptos);
        
        if (cryptos.length === 0) {
          setError("Aucune cryptomonnaie trouvée. Essayez un autre terme de recherche.");
        }
      } catch (err) {
        console.error("Erreur de recherche:", err);
        setError("Une erreur est survenue lors de la recherche. Veuillez réessayer.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative w-full">
      <div 
        className="flex items-center border rounded-md px-3 py-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Input
          type="text" 
          placeholder="Rechercher une crypto..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Rechercher une crypto..." 
            value={query}
            onValueChange={setQuery}
          />
          
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-6 text-muted-foreground">
                  {error}
                </div>
              ) : (
                "Aucune crypto trouvée"
              )}
            </CommandEmpty>

            <CommandGroup heading="Résultats">
              {results.map((crypto) => (
                <CommandItem
                  key={crypto.id}
                  onSelect={() => {
                    onSelect(crypto);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {crypto.image && (
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium">{crypto.name}</span>
                  <span className="text-muted-foreground">{crypto.symbol.toUpperCase()}</span>
                  <span className="ml-auto font-mono">
                    {crypto.current_price.toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    })}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
};

export default CryptoSearch;
