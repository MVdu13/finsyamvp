
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

// Fonction pour gérer les erreurs d'API limites de taux
const handleRateLimitError = async (retryAfter: number = 1000): Promise<void> => {
  console.log(`Rate limit atteint, on attend ${retryAfter}ms avant de réessayer...`);
  return new Promise(resolve => setTimeout(resolve, retryAfter));
};

export const searchCryptos = async (query: string): Promise<CryptoInfo[]> => {
  if (!query || query.trim().length < 1) {
    return [];
  }

  try {
    console.log(`Recherche de cryptomonnaies pour: "${query}"`);
    
    // Si l'utilisateur entre un symbole court (comme BTC, ETH), on utilise une approche différente
    if (query.length <= 4) {
      // Récupérer directement la liste des principales cryptomonnaies
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=50&page=1&sparkline=false&locale=fr`
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit atteint
          await handleRateLimitError();
          return searchCryptos(query); // Réessayer après délai
        }
        
        console.error(`Erreur API (${response.status}): ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      
      // Filtrer par symbole ou nom qui correspond partiellement à la requête
      const filteredCoins = data.filter((coin: any) => 
        coin.symbol.toLowerCase().includes(query.toLowerCase()) || 
        coin.name.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log(`Trouvé ${filteredCoins.length} correspondances pour "${query}"`);
      return filteredCoins.slice(0, 10);
    } 
    
    // Pour les requêtes plus longues, utiliser l'API de recherche
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    );
    
    if (!searchResponse.ok) {
      if (searchResponse.status === 429) {
        // Rate limit atteint
        await handleRateLimitError();
        return searchCryptos(query); // Réessayer après délai
      }
      
      console.error(`Erreur API recherche (${searchResponse.status}): ${searchResponse.statusText}`);
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    // Si aucun résultat, on retourne un tableau vide
    if (!searchData.coins || searchData.coins.length === 0) {
      console.log(`Aucune crypto trouvée pour: "${query}"`);
      return [];
    }
    
    // On limite à 10 résultats
    const coinIds = searchData.coins.slice(0, 10).map((coin: any) => coin.id).join(',');
    
    // Maintenant on récupère les détails de ces cryptos
    if (coinIds) {
      const detailedResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=${coinIds}&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=fr`
      );
      
      if (!detailedResponse.ok) {
        if (detailedResponse.status === 429) {
          // Rate limit atteint
          await handleRateLimitError();
          return searchCryptos(query); // Réessayer après délai
        }
        
        console.error(`Erreur API détails (${detailedResponse.status}): ${detailedResponse.statusText}`);
        return [];
      }
      
      const detailedData = await detailedResponse.json();
      console.log(`Résultats détaillés pour "${query}":`, detailedData.length, "cryptos trouvées");
      return detailedData;
    }
    
    return [];
  } catch (error) {
    console.error("Erreur de recherche de crypto:", error);
    return [];
  }
};

export const getCryptoDetails = async (id: string): Promise<CryptoInfo | null> => {
  try {
    // Nous utilisons l'endpoint coins pour obtenir plus d'informations
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit atteint
        await handleRateLimitError();
        return getCryptoDetails(id); // Réessayer après délai
      }
      
      console.error(`Erreur API détails crypto (${response.status}): ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Formatons les données dans notre format attendu
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || '',
      current_price: data.market_data?.current_price?.eur || 0,
      market_cap: data.market_data?.market_cap?.eur || 0,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0
    };
  } catch (error) {
    console.error("Erreur de récupération des détails:", error);
    return null;
  }
};
