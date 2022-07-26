import { useEffect, useRef, useState } from 'react';
import './app.scss';
import { Grid, IGridData } from './components/grid';
import { FavoriteService } from './services/favorite.service';
import { IMovie, TMDBService } from './services/tmdb.service';

function App()
{
    const needToRunOnce = useRef(true);

    useEffect(() =>
    {
        if (needToRunOnce.current) {
            needToRunOnce.current = false;
            document.body.classList.add('app');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getMovieData = (term: string, page: number, pageSize: number): Promise<IGridData<IMovie>> =>
    {
        return new Promise<IGridData<IMovie>>((res, rej) =>
        {
            TMDBService.Instance.list(term, page, pageSize).then(r => res(r)).catch(err => rej(err));
        });
    };
    const getFavData = (term: string, page: number, pageSize: number): Promise<IGridData<IMovie>> =>
    {
        return new Promise<IGridData<IMovie>>((res, rej) => { FavoriteService.Instance.list(term, page, pageSize).then(res).catch(rej); });
    };
    const movieGridCols = ["id", "title", "release_date", "overview"];
    const favGridCols = ["id", "title", "release_date"];
    const [refreshToken, setRefreshToken] = useState(0);

    return (
        <div>
            <header className="app-header"><p>Simple react example for TheMovieDB</p></header>
            <section className="main-section">
                <article className="main-article">
                    <Grid label="Movie finder" cols={movieGridCols} getData={getMovieData} actions={
                        row => <button onClick={() => { FavoriteService.Instance.add(row).then(() => setRefreshToken(refreshToken + 1)); }}>ADD</button>
                    } />
                </article>
                <aside className="main-aside">
                    <Grid label="Favorite movies" cols={favGridCols} getData={getFavData} refreshToken={refreshToken} actions={
                        row => <button onClick={() => { FavoriteService.Instance.remove(row).then(() => setRefreshToken(refreshToken + 1)); }}>DEL</button>
                    } />
                </aside>
            </section>
        </div>
    );
}

export default App;
