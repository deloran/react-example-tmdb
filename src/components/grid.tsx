import { useEffect, useState } from 'react';
import './grid.scss';
import { Searchbar } from './searchbar';
import { Spinner } from './spinner';

export interface IGridData<T>
{
    results: T[],
    page: number,   
    total_pages: number,
    total_results: number
}

const pageSizes = [5, 10, 20, 50];

export function Grid<T>(props: {
    label: string, cols: string[],
    getData: (term: string, page: number, pageSize: number) => Promise<IGridData<T>>,
    actions: (row: T) => JSX.Element,
    refreshToken?: number
})
{
    const FullRow = (p: { children: JSX.Element }): JSX.Element => <tr><td colSpan={props.cols.length + 1} className="centered">{p.children}</td></tr>;
    const [state, setState] = useState({ isLoading: true, term: '', data: [] as T[], page: 1, pages: 1, pageNumbers: [] as number[], pageSize: pageSizes[0], error: '' });
    const getData = (page: number) =>
    {
        setState(s => ({ ...s, isLoading: true }));
        props.getData(state.term, page, state.pageSize).then(r =>
        {
            if (r.results === undefined) { setState(s => ({ ...s, isLoading: false })); return; }

            let pageNumbers = [] as number[];
            let pages = Math.ceil(r.total_results / state.pageSize);
            page = Math.min(page, pages);
            if (pages > 5) {
                let min = Math.max(page - 2, 1);
                let max = Math.min(min + 4, pages);
                for (let p = min; p <= max; p++) { pageNumbers.push(p); }
            } else { for (let p = 1; p <= pages; p++) { pageNumbers.push(p); } }

            setState(s => ({ ...s, isLoading: false, data: r.results, error: '', page: page, pages: pages, pageNumbers: pageNumbers }));
        })
            .catch(err => setState(s => ({ ...s, error: err })));
    };

    useEffect(() => { getData(1); }, [state.term, state.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { getData(state.page); }, [props.refreshToken]); // eslint-disable-line react-hooks/exhaustive-deps

    let hasContent = state.data !== undefined && state.data.length !== 0; // props.rows !== undefined && props.rows !== null && props.rows?.length !== 0;

    return <>
        <div>
            <div><h5>{props.label}</h5></div>
            <Searchbar onSearch={t => setState(s => ({ ...s, term: t }))} />
        </div>
        <table className="grid">
            <thead>
                <tr>
                    {props.cols.map(c => <th key={c}>{c}</th>)}
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {state.isLoading && <FullRow><Spinner /></FullRow>}
                {!state.isLoading && state.error === '' && <>
                    {hasContent && state.data.map((r, i) => <tr key={i} className={i % 2 === 0 ? "odd" : "even"}>{
                        props.cols.map((c, j) => <td key={j}>{(r as any)[c]}</td>)
                    }
                        <td key="actions">{props.actions(r)}</td>
                    </tr>)}
                    {!hasContent && <FullRow><>No content</></FullRow>}
                </>}
                {!state.isLoading && state.error !== '' && <FullRow><>{state.error}</></FullRow>}
            </tbody>
            <tfoot>
                {hasContent && <FullRow><div>
                    <div>Pages</div>
                    <select value={state.pageSize} onChange={e => setState(s => ({ ...s, pageSize: +e.target.value }))}>
                        {pageSizes.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                    {state.page > 3 && <><button key="f" onClick={() => getData(1)}>1</button>...</>}
                    {state.pages > 1 && state.pageNumbers.map((p, i) => <button key={i} onClick={() => getData(p)} className={state.page === p ? "selected" : ""}>{p}</button>)}
                    {state.pages > 5 && <>...<button key="l" onClick={() => getData(state.pages)}>{state.pages}</button></>}
                </div></FullRow>}
            </tfoot>
        </table>
    </>;
}