import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const DigimonExplorer = () => {
    const [digimonList, setDigimonList] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;
    const currentIdRef = useRef(1); // Use ref to track the current starting ID
    const fetchedIds = useRef(new Set()); // Use ref to track fetched IDs

    const fetchDigimonBatch = async (startId, limit) => {
        const fetchedDigimon = [];
        for (let id = startId; id < startId + limit; id++) {
            try {
                if (fetchedIds.current.has(id)) continue; // Skip if already fetched

                const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
                if (!response.ok) {
                    console.error(`Failed to fetch Digimon with ID: ${id}`);
                    continue;
                }

                const data = await response.json();
                fetchedIds.current.add(id); // Mark this ID as fetched
                fetchedDigimon.push(data);
            } catch (err) {
                console.error('Error fetching Digimon:', err);
            }
        }
        return fetchedDigimon;
    };

    const loadMoreDigimon = useCallback(async () => {
        if (loading) return; // Prevent overlapping calls

        setLoading(true);

        const startId = currentIdRef.current;
        const newBatch = await fetchDigimonBatch(startId, limit);

        if (newBatch.length === 0) {
            setHasMore(false); // Stop infinite scroll when no more data
        } else {
            setDigimonList((prevList) => [...prevList, ...newBatch]); // Append new data
            currentIdRef.current += limit; // Increment ID range
        }

        setLoading(false);
    }, [limit]);

    useEffect(() => {
        loadMoreDigimon(); // Fetch the initial batch on mount
    }, [loadMoreDigimon]);

    const sortedDigimon = useMemo(() => {
        return digimonList
            .filter((digimon) => digimon.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortCriteria === 'name') return a.name.localeCompare(b.name);
                if (sortCriteria === 'level') return (a.levels[0]?.level || '').localeCompare(b.levels[0]?.level || '');
                return 0;
            });
    }, [digimonList, searchQuery, sortCriteria]);

    if (error) {
        return (
            <div className="error-container">
                <h1>Error: {error}</h1>
                <button onClick={() => window.location.reload()}>Reload</button>
            </div>
        );
    }

    return (
        <div className="explorer">
            <h1 style={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
                Digimon Explorer
            </h1>
            <label htmlFor="search-bar" style={{ display: 'none' }}>Search Digimon</label>
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search Digimon..."
                    aria-label="Search Digimon"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar"
                />
                <select
                    value={sortCriteria}
                    onChange={(e) => setSortCriteria(e.target.value)}
                    className="sort-dropdown"
                    aria-label="Sort Digimon"
                >
                    <option value="">Sort By</option>
                    <option value="name">Name</option>
                    <option value="level">Level</option>
                </select>
            </div>

            <InfiniteScroll
                dataLength={digimonList.length}
                next={loadMoreDigimon}
                hasMore={hasMore}
                loader={
                    loading && (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <img
                                src="https://i.gifer.com/ZZ5H.gif"
                                alt="Loading..."
                                style={{ width: '50px', height: '50px' }}
                            />
                        </div>
                    )
                }
            >
                {(sortedDigimon.length === 0 && !loading) ? <h4 className="no-results-message">No Digimon found</h4> : (<div className="digimon-list">
                    {sortedDigimon.map((digimon, index) => (
                        <div key={`${digimon.name}-${index}`} className="digimon-card">
                            <img src={digimon.images[0]?.href || ''} alt={digimon.name} />
                            <h2>{digimon.name}</h2>
                            <p>Level: {digimon.levels[0]?.level}</p>
                        </div>
                    ))}
                </div>)}
            </InfiniteScroll>
        </div>
    );
};

export default DigimonExplorer;
