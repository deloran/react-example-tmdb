import moment from "moment";

interface ResultCache<T>
{
    key: string,
    data: T,
    validUntil: moment.Moment
}

const CACHE_DURATION = 5;
const CACHE_FRAGMENT = 'minutes';

export class CacheService<T>
{
    private cacheData = [] as ResultCache<T>[];

    private load(key: string, proc: () => Promise<T>)
    {
        return new Promise<T>((res, rej) =>
        {
            proc()
                .then(r =>
                {
                    let now = moment();
                    this.cacheData = this.cacheData.filter(c => c.validUntil > now && c.key !== key);
                    this.cacheData.push({ key: key, data: r, validUntil: moment().add(CACHE_DURATION, CACHE_FRAGMENT) });
                    res(r);
                })
                .catch(rej);
        });
    }

    async get(key: string, proc: () => Promise<T>): Promise<T>
    {
        let hit = this.cacheData.find(cd => cd.key === key);
        if (hit && hit.validUntil > moment()) { return Promise.resolve(hit?.data!); }
        else { return this.load(key, proc); }
    }

    set(key: string, proc: () => Promise<T>): Promise<T> { return this.load(key, proc); }
}