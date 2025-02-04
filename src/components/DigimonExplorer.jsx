import React, { useState, useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const DigimonExplorer = () => {
    const [digimonList, setDigimonList] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortCriteria, setSortCriteria] = useState('');
    const [currentId, setCurrentId] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [limit, setLimit] = useState(20);

    const fetchDigimonBatch = async (startId, limit) => {
        const fetchedDigimon = [];
        for (let id = startId; id <= startId + limit; id++) {
            try {
                const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
                if (!response.ok) {
                    console.error(`Failed to fetch Digimon with ID: ${id}`);
                    continue;
                }
                const data = await response.json();
                fetchedDigimon.push(data);        
                
            } catch (err) {
                console.error('Error fetching Digimon:', err);
            }
        }
        return fetchedDigimon;
};

    const sortedDigimon = useMemo(() => {
        return digimonList
            .filter((digimon) => digimon.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortCriteria === 'name') return a.name.localeCompare(b.name);
                if (sortCriteria === 'level') return a.levels[0]?.level.localeCompare(b.levels[0]?.level);
                return 0;
            });
    }, [digimonList, searchQuery, sortCriteria]);

    if (error) {
        return (
            <div className='error-container'>
                <h1>Error: {error}</h1>
                <button onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    const loadMoreDigimon = async () => {
        const newBatch = await fetchDigimonBatch(currentId, limit);
        if (newBatch.length === 0) {
            setHasMore(false);
            return;
        }
        setDigimonList((prevList) => [...prevList, ...newBatch] );
        setCurrentId(currentId + limit);
    };

    return (
        <div className="explorer">
            <h1 
                style={{cursor: 'pointer'}} 
                onClick={() => window.location.reload()}
            > Digimon Explorer</h1>
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
                    aria-label="Sort Digimon"
                >
                    <option value="">Sort By</option>
                    <option value="name">Name</option>
                    <option value="level">Level</option>
                </select>
            </div>
        
            <InfiniteScroll
                dataLength={sortedDigimon.length}
                next={loadMoreDigimon} // No more infinite scrolling as we fetch all data upfront
                hasMore={hasMore}
                loader={
                    loading ? (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <img 
                                src="https://i.gifer.com/ZZ5H.gif" 
                                alt="Loading..." 
                                style={{ width: '50px', height: '50px' }}
                            />
                        </div>
                    ) : null
                }
                // endMessage={
                //     <h4 style={{ textAlign: 'center', margin: '20px 0' }}>
                //         All Digimon have been loaded!
                //     </h4>
                // }
            >    
            {loading && <h1>Loading Digimon...</h1>}
            {!loading && (
                <div className="digimon-list">
                        {sortedDigimon.length === 0 ? <h4 className='no-results-message'>No Digimon found</h4> : ( sortedDigimon.map((digimon) => (
                            <div key={digimon.name} className="digimon-card">
                                <img 
                                    src={digimon.images[0]?.href || ''} 
                                    alt={digimon.name} 
                                />

                                <h2>{digimon.name}</h2>
                                <p>Level: {digimon.levels[0]?.level}</p>
                            </div>
                            ))
                        )}
                        </div>
                    )}
                </InfiniteScroll>
                </div>
        
        )
    }

export default DigimonExplorer;