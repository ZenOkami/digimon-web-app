import React, { useState, useEffect } from 'react';

export const DigimonExplorer = () => {
    const [digimonList, setDigimonList] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDigimon = async () => {
            try {
                const response = await fetch("https://digimon-api.vercel.app/api/digimon");
                if (!response.ok) {
                    throw new Error('Error fetching Digimon API response');
                }

                const data = await response.json();
                setDigimonList(data);
            } catch (err) {
                setError(err.message);
                console.error('No Digimon found:', err);
            }
        };

        fetchDigimon();
    }, []);

    const filteredDigimon = digimonList.filter((digimon) => digimon.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (error) {
        return <h1>Error: {error}</h1>;
    }

    return (
        <div className="explorer">
            <h1>Digimon Explorer</h1>
            <input 
                type='text'
                placeholder='Search Digimon...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='search-bar'
            />
            <div className="digimon-list">
                {filteredDigimon.map((digimon) => (
                    <div key={digimon.name} className="digimon-card">
                        <img 
                            src={digimon.img}
                            alt={digimon.name}
                        />
                        <h2>{digimon.name}</h2>
                        <p>Level: {digimon.level}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};