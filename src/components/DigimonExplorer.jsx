import React, { useState, useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const DigimonExplorer = () => {
    const [digimonList, setDigimonList] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortCriteria, setSortCriteria] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchDigimon = async () => {
            try {
                const response = await fetch("https://digimon-api.vercel.app/api/digimon");
                if (!response.ok) {
                    throw new Error('Error fetching Digimon API response');
                }

                const data = await response.json();
                setDigimonList(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('No Digimon found:', err);
            }
        };

        fetchDigimon();
    }, []);

    const fetchMoreData = async () => {
        setLoadingMore(true); // Start loading
        try {
            const response = await fetch(`https://digimon-api.vercel.app/api/digimon?page=${page}`);
            if (!response.ok) {
                throw new Error("Error fetching Digimon data");
            }
    
            const newData = await response.json();
    
            if (newData.length === 0) {
                setHasMore(false); // No more data to load
                return;
            }
    
            const uniqueDigimon = newData.filter(
                (newDigimon) => !digimonList.some((existingDigimon) => existingDigimon.name === newDigimon.name)
            );
    
            setDigimonList((prevList) => [...prevList, ...uniqueDigimon]);
    
            if (uniqueDigimon.length < 10) {
                setHasMore(false);
            }
        } catch (err) {
            setError(err.message);
            setHasMore(false);
            console.error(err);
        } finally {
            setLoadingMore(false); // Stop loading
            setPage((prevPage) => prevPage + 1);
        }
    };      
    

    const sortedDigimon = useMemo(() => {
        return digimonList
            .filter((digimon) => digimon.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortCriteria === 'name') return a.name.localeCompare(b.name);
                if (sortCriteria === 'level') return a.level.localeCompare(b.level);
                return 0;
            })
            .slice(0, page * 10); // Show 10 Digimon per page
    }, [digimonList, searchQuery, sortCriteria, page]);
    

    if (error) {
        return (
            <div className='error-container'>
                <h1>Error: {error}</h1>
                <button onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    return (
        <div className="explorer">
        <h1>Digimon Explorer</h1>
        <label htmlFor="search-bar" style={{ display: 'none' }}>Search Digimon</label>
        <div className='controls'>
        <input 
        type='text'
        placeholder='Search Digimon...'
        aria-label="Search Digimon"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='search-bar'
        />
        <select 
        value={sortCriteria}
        onChange={(e) => setSortCriteria(e.target.value)}
        className='sort-dropdown'
        aria-label="Search Digimon"
        >
        <option value="">Sort By</option>
        <option value="name" selected>Name</option>
        <option value="level">Level</option>
        </select>
        </div>
        
            <InfiniteScroll
                dataLength={sortedDigimon.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={
                    loadingMore ? (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <img 
                                src="https://i.gifer.com/ZZ5H.gif" 
                                alt="Loading..." 
                                style={{ width: '50px', height: '50px' }}
                            />
                        </div>
                    ) : null
                }
                endMessage={
                    <h4 style={{ textAlign: 'center', margin: '20px 0' }}>
                        No more Digimon to load!
                    </h4>
                }
            >    
            {loading && <h1>Loading Digimon...</h1>}
            {!loading && (
                <div className="digimon-list">
                {sortedDigimon.length === 0 ? <p className='no-results-message'>No Digimon found</p> : ( sortedDigimon.map((digimon) => (
                    <div key={digimon.name} className="digimon-card">
                    <img 
                    src={digimon.img}
                    alt={digimon.name}
                    />
                    <h2>{digimon.name}</h2>
                    <p>Level: {digimon.level}</p>
                    </div>
                    ))
                    )}
                    </div>
                    )};
                </InfiniteScroll>
                </div>
        
    );
};

export default DigimonExplorer