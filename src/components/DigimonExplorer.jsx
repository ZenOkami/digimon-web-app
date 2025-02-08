import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const DigimonExplorer = () => {
    const [digimonList, setDigimonList] = useState([]);
    const [allDigimon, setAllDigimon] = useState([]); // Store all Digimon names and IDs
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sortCriteria, setSortCriteria] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;
    const currentIdRef = useRef(1);
    const fetchedIds = useRef(new Set());

    // Fetch all Digimon names and IDs for global search
    useEffect(() => {
        const fetchAllDigimon = async () => {
            try {
                const response = await fetch('https://digi-api.com/api/v1/digimon');
                if (!response.ok) throw new Error('Failed to fetch all Digimon');
                const data = await response.json();
                setAllDigimon(data.content);
            } catch (err) {
                console.error('Error fetching all Digimon:', err);
                setError('Error fetching Digimon data. Please try again later.');
            }
        };
        fetchAllDigimon();
    }, []);

    const fetchDigimonBatch = async (startId, limit) => {
        const fetchedDigimon = [];
        // Calculate ending ID, ensuring it does not exceed 1460
        const endId = Math.min(startId + limit - 1, 1460);
        for (let id = startId; id <= endId; id++) {
            try {
                if (fetchedIds.current.has(id)) continue;
                const response = await fetch(`https://digi-api.com/api/v1/digimon/${id}`);
                if (!response.ok) continue;
                const data = await response.json();
                fetchedIds.current.add(id);
                fetchedDigimon.push(data);
            } catch (err) {
                console.error(`Error fetching Digimon ID ${id}:`, err);
            }
        }
        return fetchedDigimon;
    };

    const loadMoreDigimon = useCallback(async () => {
        if (loading) return;

        // Stop fetching if current ID exceeds 1460
        if (currentIdRef.current > 1460) {
            setHasMore(false);
            return;
        }

        setLoading(true);
        const startId = currentIdRef.current;
        const newBatch = await fetchDigimonBatch(startId, limit);

        if (newBatch.length === 0) {
            setHasMore(false);
        } else {
            setDigimonList((prevList) => {
                const combinedList = [...prevList, ...newBatch];
                const uniqueList = Array.from(new Map(combinedList.map((item) => [item.id, item])).values());
                return uniqueList;
            });
            currentIdRef.current += limit;
        }
        setLoading(false);
    }, [loading, limit]);

    useEffect(() => {
        loadMoreDigimon();
    }, [loadMoreDigimon]);

    const filteredDigimon = useMemo(() => {
        const searchLower = searchQuery.toLowerCase();
        return (searchQuery
            ? allDigimon.filter((digimon) => digimon.name.toLowerCase().includes(searchLower))
            : digimonList
        ).sort((a, b) => {
            if (sortCriteria === 'name') return a.name.localeCompare(b.name);
            if (sortCriteria === 'level') return (a.levels[0]?.level || '').localeCompare(b.levels[0]?.level || '');
            return 0;
        });
    }, [allDigimon, digimonList, searchQuery, sortCriteria]);

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
                {filteredDigimon?.map((digimon, index) => (
                    digimon && (
                        <div key={`${digimon.name}-${index}`} className="digimon-card">
                            <img src={Array.isArray(digimon?.images) && digimon?.images[0]?.href ? digimon.images[0].href : ''} alt={digimon?.name || 'Unknown Digimon'} />
                            <h2>{digimon?.name || 'Unknown Name'}</h2>
                            <p>Level: {Array.isArray(digimon?.levels) && digimon?.levels[0]?.level ? digimon.levels[0].level : 'Unknown Level'}</p>
                        </div>
                    )
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default DigimonExplorer;