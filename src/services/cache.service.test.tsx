import MockDate from 'mockdate';
import moment from 'moment';
import { CacheService } from './cache.service';

test('cache normal test', async () =>
{
    const cs = new CacheService<string>();
    let m = moment();
    MockDate.set(m.toDate());

    const mockCallback1 = jest.fn(() => Promise.resolve("1"));
    const mockCallback2 = jest.fn(() => Promise.resolve("2"));

    let k1 = await cs.get("K1", mockCallback1);
    let k2 = await cs.get("K2", mockCallback2);
    expect(k1).toBe("1");
    expect(k1).not.toBe("2");
    k1 = await cs.get("K1", mockCallback1);
    expect(k1).toBe("1");
    expect(mockCallback1).toHaveBeenCalledTimes(1);

    expect(k2).toBe("2");
    k1 = await cs.set("K1", mockCallback1);
    expect(mockCallback1).toHaveBeenCalledTimes(2);
    k1 = await cs.get("K1", mockCallback1);

    expect(mockCallback1).toHaveBeenCalledTimes(2);

    m.add(10, 'minutes')
    MockDate.set(m.toDate());

    k1 = await cs.get("K1", mockCallback1);
    expect(mockCallback1).toHaveBeenCalledTimes(3);

    k1 = await cs.get("K1", mockCallback1);
    expect(mockCallback1).toHaveBeenCalledTimes(3);

});
