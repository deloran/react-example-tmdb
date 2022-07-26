import * as localForage from "localforage";
import { IGridData } from "../components/grid";
import { CacheService } from "./cache.service";
import { IMovie } from "./tmdb.service";

const CACHE_KEY = `favorites`;

export class FavoriteService
{
    private static _instance: FavoriteService;
    private static _storeName = "FAVs";
    private static _cache = new CacheService<IMovie[]>();

    static get Instance()
    {
        if (!FavoriteService._instance) { FavoriteService._instance = new FavoriteService(); }
        return FavoriteService._instance;
    }

    private readAll(): Promise<IMovie[]>
    {
        return FavoriteService._cache.get(CACHE_KEY, () => new Promise<IMovie[]>((res, rej) =>
        {
            localForage.getItem(FavoriteService._storeName, (err, favs) =>
            {
                if (err === null) {
                    let items = favs as IMovie[];
                    if (items === null) { items = [] as IMovie[] }
                    res(items);
                } else { rej(err); }
            });
        }));
    }

    private set(items: IMovie[]) { localForage.setItem(FavoriteService._storeName, items); FavoriteService._cache.set(CACHE_KEY, () => Promise.resolve(items)); }

    async add(item: IMovie): Promise<void>
    {
        return new Promise<void>((res, _) =>
        {
            this.readAll().then(items =>
            {
                if (items.every(i => i.id !== item.id)) {
                    items.push(item);
                    this.set(items);
                    res();
                }
            });
        });
    }
    async remove(item: IMovie): Promise<void>
    {
        return new Promise<void>((res, _) =>
        {
            this.readAll().then(items =>
            {
                this.set(items.filter(i => i.id !== item.id));
                res();
            });
        });
    }
    async list(term: string, page: number, pageSize: number): Promise<IGridData<IMovie>>
    {
        return new Promise<IGridData<IMovie>>((res, rej) =>
        {
            this.readAll().then(items =>
            {
                let re = new RegExp(term, 'i');
                let itemCount = items.length;
                if (term !== '') { items = items.filter(t => t.title?.match(re)); }
                page = Math.min(page === 0 ? 1 : page, Math.ceil(itemCount / pageSize));
                items = items.slice((page - 1) * pageSize, page * pageSize);
                console.log(items, page, pageSize);
                res({ results: items, page: page, total_pages: 1, total_results: itemCount });
            }).catch(rej);
        });
    }
}