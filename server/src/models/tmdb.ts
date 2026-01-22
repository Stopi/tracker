const apiKey: string = process.env.TMDB_API_KEY || 'wrong key';

const TMDB = {

  apiCall: async (endpoint: string, params: Record<string, string>): Promise<any> => {
    const baseUrl: string = 'https://api.themoviedb.org/3';

    const urlParams: URLSearchParams = new URLSearchParams({
      api_key: apiKey,
      ...params // Merge additional params
    });

    try {
      const response: Response = await fetch(baseUrl + endpoint + '?' + urlParams);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error: unknown) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  },

  searchTVShow: async (query:string, language = 'en-US', page:number = 1): Promise<any> =>  await TMDB.apiCall(
    '/search/tv', {
      query,
      language,
      page: page + '',
    }
  ),

  getShowDetails: async (series_id:number, language = 'en-US'): Promise<any> => await TMDB.apiCall(
    '/tv/' + series_id, {
      language,
    }
  ),

  getSeasonDetails: async (series_id:number, season_number: number, language = 'en-US'): Promise<any> => await TMDB.apiCall(
    '/tv/' + series_id + '/season/' + season_number, {
      language,
    }
  ),

};
export default TMDB;