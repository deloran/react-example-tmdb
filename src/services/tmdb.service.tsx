import { IGridData } from "../components/grid";
import { CacheService } from "./cache.service";

export interface IMovie
{
    id?: number,
    title?: string,
    release_date?: string,
    overview?: string,
    // etc.
}

export class TMDBService
{
    private static _instance: TMDBService;
    private static _cache = new CacheService<IGridData<IMovie>>();

    static get Instance()
    {
        if (!TMDBService._instance) { TMDBService._instance = new TMDBService(); }
        return TMDBService._instance;
    }

    private query(term: string, page: number): Promise<IGridData<IMovie>>
    {
        return TMDBService._cache.get(`**${term}**_${page}`, () => new Promise<IGridData<IMovie>>((res, rej) =>
        {
            let url = `${process.env.REACT_APP_TMDB_APIURL}/search/movie?api_key=${process.env.REACT_APP_TMDB_APIKEY}&query=${term}&page=${page}`;
            fetch(url, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } } as RequestInit).then(r =>
            {
                if (!r.ok) { rej(r.statusText); return; }
                r.json().then(res).catch(rej);
            });
        }));
    }

    async list(term: string, page: number, pageSize: number): Promise<IGridData<IMovie>>
    {
        if (term === "") { return Promise.resolve({} as IGridData<IMovie>); };
        return new Promise<IGridData<IMovie>>(async (res, rej) =>
        {
            try {
                let part1 = await this.query(term, 1);

                let total = part1.total_results;
                let sourcePageSize = total / part1.total_pages;
                let startIdx = (page - 1) * pageSize + 1;
                let endIdx = page * pageSize;
                let startPage = Math.ceil(startIdx / sourcePageSize);
                let endPage = Math.ceil(endIdx / sourcePageSize);

                let list = [] as IMovie[];
                for (let p = startPage; p <= endPage; p++)
                {
                    let part = await this.query(term, p);
                    list = list.concat(part.results);
                }
                let offset = (startPage - 1) * sourcePageSize;
                list = list.slice(startIdx - offset - 1, endIdx - offset);

                res({ results: list, page: page, total_pages: Math.ceil(total / pageSize), total_results: total });
            }
            catch (e) { rej(e); }

        });
    }
}