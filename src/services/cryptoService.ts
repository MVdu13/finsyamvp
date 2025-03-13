
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
    // Commençons par une recherche générale qui retourne des IDs
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${query}`
    );
    
    if (!searchResponse.ok) {
      console.error("Erreur lors de la recherche de cryptomonnaies:", searchResponse.status);
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    // Si aucun résultat, on retourne un tableau vide
    if (!searchData.coins || searchData.coins.length === 0) {
      console.log("Aucune crypto trouvée pour:", query);
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
        console.error("Erreur lors de la récupération des détails des cryptomonnaies:", detailedResponse.status);
        return [];
      }
      
      const detailedData = await detailedResponse.json();
      console.log("Résultats détaillés:", detailedData);
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
      console.error("Erreur lors de la récupération des détails de la cryptomonnaie:", response.status);
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
