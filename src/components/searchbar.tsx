import React, { useEffect, useRef, useState } from 'react';
import './searchbar.scss';

export function Searchbar(props: { onSearch: (term: string) => void })
{
    const firstUpdate = useRef(true);
    const [term, setTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState("");
    const doSearch = () =>
    {
        setMessage('');
        if (term !== '' && ("" + term).trim().length < 3) { setMessage('Enter at least 3 chars'); return; }
        setSearchTerm(term);
    };

    useEffect(() => { const timeOutId = setTimeout(doSearch, 500); return () => clearTimeout(timeOutId); }, [term]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() =>
    {
        if (firstUpdate.current) { firstUpdate.current = false; return; }
        props.onSearch(searchTerm);
    }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

    return <>
        <div className="search-bar">
            <div>
                <input type='text' data-testid="search-text" onChange={e => setTerm(e.target.value)} onKeyPress={e => { if (e.code === 'Enter') { doSearch(); } }} />
                <div className="error">{message}</div>
            </div>
            <button onClick={doSearch} data-testid="search-button">search</button>
        </div>
    </>;
}