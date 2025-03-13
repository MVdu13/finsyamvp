
/**
 * Service pour interagir avec l'API CoinGecko
 */

export interface CryptoInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

export const searchCryptos = async (query: string): Promise<CryptoInfo[]> => {
  try {
    // On utilise l'API CoinGecko qui ne nécessite pas de clé API pour les requêtes de base
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${query}&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=fr`
    );
    
    if (!response.ok) {
      const searchResponse = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${query}`
      );
      
      if (!searchResponse.ok) {
        throw new Error("Erreur lors de la recherche de cryptomonnaies");
      }
      
      const searchData = await searchResponse.json();
      const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
      
      if (coinIds) {
        const detailedResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=fr`
        );
        
        if (!detailedResponse.ok) {
          throw new Error("Erreur lors de la récupération des détails des cryptomonnaies");
        }
        
        return await detailedResponse.json();
      }
      
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur de recherche de crypto:", error);
    return [];
  }
};

export const getCryptoDetails = async (id: string): Promise<CryptoInfo | null> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${id}&order=market_cap_desc&per_page=1&page=1&sparkline=false&locale=fr`
    );
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des détails de la cryptomonnaie");
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error("Erreur de récupération des détails:", error);
    return null;
  }
};
