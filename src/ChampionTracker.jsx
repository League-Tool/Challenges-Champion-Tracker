import React, { useState, useEffect } from 'react';

const DD_BASE = "https://ddragon.leagueoflegends.com";
const challenges = ["All Random All Champions", "Perfectionist", "Invincible", "Jack of All Champs", "Protean Override", "Same Penta, Different Champ"];
const sizes = {
  small: { imgWidth: 60, minMax: 80 },
  medium: { imgWidth: 80, minMax: 100 },
  large: { imgWidth: 100, minMax: 120 }
};

const ChampionTracker = () => {
  const [allChampions, setAllChampions] = useState([]);
  const [availableChampions, setAvailableChampions] = useState([]);
  const [doneChampions, setDoneChampions] = useState([]);
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(() => {
    return localStorage.getItem('lol-challenges-show-completed') === 'true';
  });
  const [currentChallenge, setCurrentChallenge] = useState(() => {
    return localStorage.getItem('lol-challenges-current') || "All Random All Champions";
  });
  const [iconSize, setIconSize] = useState(() => {
    return localStorage.getItem('lol-challenges-icon-size') || 'medium';
  });
  const [progressObj, setProgressObj] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get latest version
        const vRes = await fetch(`${DD_BASE}/api/versions.json`);
        const vData = await vRes.json();
        const latestVersion = vData[0];
        setVersion(latestVersion);

        // 2. Get Champion Data
        const cRes = await fetch(`${DD_BASE}/cdn/${latestVersion}/data/en_US/champion.json`);
        const cData = await cRes.json();
        
        // 3. Format data to match your requested structure
        const formatted = Object.values(cData.data).map(champ => ({
          name: champ.name,
          id: champ.id,
          key: champ.key,
          lanes: champ.tags, // Data Dragon uses 'tags' (Mage, Tank, etc.)
        }));

        setAllChampions(formatted);

        // Load progress
        const savedProgressObj = JSON.parse(localStorage.getItem('lol-challenges-progress')) || {};
        setProgressObj(savedProgressObj);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch League data", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('lol-challenges-current', currentChallenge);
  }, [currentChallenge]);

  useEffect(() => {
    localStorage.setItem('lol-challenges-show-completed', showDone.toString());
  }, [showDone]);

  useEffect(() => {
    localStorage.setItem('lol-challenges-icon-size', iconSize);
  }, [iconSize]);

  useEffect(() => {
    if (allChampions.length === 0) return;

    const savedProgress = progressObj[currentChallenge] || [];

    const available = allChampions.filter(champ => !savedProgress.includes(champ.id)).sort((a, b) => a.name.localeCompare(b.name));
    const done = allChampions.filter(champ => savedProgress.includes(champ.id)).sort((a, b) => a.name.localeCompare(b.name));

    setAvailableChampions(available);
    setDoneChampions(done);
  }, [currentChallenge, allChampions, progressObj]);

  const toggleChampion = (id) => {
    const currentProgress = progressObj[currentChallenge] || [];
    let newCurrentProgress;
    if (availableChampions.some(c => c.id === id)) {
      // Moving to done
      newCurrentProgress = [...currentProgress, id].sort((a, b) => {
        const champA = allChampions.find(c => c.id === a);
        const champB = allChampions.find(c => c.id === b);
        return champA.name.localeCompare(champB.name);
      });
    } else {
      // Moving to available
      newCurrentProgress = currentProgress.filter(i => i !== id);
    }
    const newProgressObj = { ...progressObj, [currentChallenge]: newCurrentProgress };
    setProgressObj(newProgressObj);
    localStorage.setItem('lol-challenges-progress', JSON.stringify(newProgressObj));
  };

  if (loading) return <div>Loading Champions...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', position: 'relative', minHeight: '100vh' }}>
        <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <h1 style={{ 
                textAlign: 'center', 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(45deg, #c8aa6e, #f0e6d2, #c8aa6e)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                backgroundClip: 'text', 
                textShadow: '0 2px 8px rgba(0,0,0,0.25)', 
                margin: '20px',
                padding: '20px',
                letterSpacing: '2px'
            }}>
                LoL Challenges Champion Tracker
            </h1>
        </div>
      <select 
        value={currentChallenge} 
        onChange={(e) => setCurrentChallenge(e.target.value)} 
        style={{ 
          marginLeft: '20px', 
          padding: '8px 12px', 
          backgroundColor: '#2a2a2a', 
          color: '#f0e6d2', 
          border: '2px solid #c8aa6e', 
          borderRadius: '5px', 
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        {[...challenges].sort((a, b) => a.localeCompare(b)).map(c => (
          <option key={c} value={c} style={{ backgroundColor: '#2a2a2a', color: '#f0e6d2' }}>{c}</option>
        ))}
      </select>
      <br />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={showDone} 
            onChange={(e) => setShowDone(e.target.checked)} 
            style={{ 
              marginRight: '8px', 
              width: '16px', 
              height: '16px', 
              accentColor: '#c8aa6e' 
            }}
          />
          <span style={{ color: '#f0e6d2', fontSize: '14px' }}>Show Completed</span>
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIconSize('small')} 
            style={{ 
              backgroundColor: iconSize === 'small' ? '#c8aa6e' : '#2a2a2a', 
              color: '#f0e6d2', 
              border: '2px solid #c8aa6e', 
              borderRadius: '5px', 
              padding: '5px 10px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            S
          </button>
          <button 
            onClick={() => setIconSize('medium')} 
            style={{ 
              backgroundColor: iconSize === 'medium' ? '#c8aa6e' : '#2a2a2a', 
              color: '#f0e6d2', 
              border: '2px solid #c8aa6e', 
              borderRadius: '5px', 
              padding: '5px 10px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            M
          </button>
          <button 
            onClick={() => setIconSize('large')} 
            style={{ 
              backgroundColor: iconSize === 'large' ? '#c8aa6e' : '#2a2a2a', 
              color: '#f0e6d2', 
              border: '2px solid #c8aa6e', 
              borderRadius: '5px', 
              padding: '5px 10px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            L
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${sizes[iconSize].minMax}px, 1fr))`, gap: '15px', marginTop: '20px' }}>
        {availableChampions.map(champ => (
          <div 
            key={champ.id} 
            onClick={() => toggleChampion(champ.id)}
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center',
              opacity: 1,
              filter: 'none',
              transition: '0.2s'
            }}
          >
            <img 
              src={`${DD_BASE}/cdn/${version}/img/champion/${champ.id}.png`} 
              alt={champ.name}
              style={{ width: `${sizes[iconSize].imgWidth}px`, borderRadius: '8px', border: '3px solid transparent' }}
            />
            <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
              {champ.name}
            </div>
          </div>
        ))}
        {showDone && doneChampions.map(champ => (
          <div 
            key={champ.id} 
            onClick={() => toggleChampion(champ.id)}
            style={{ 
              cursor: 'pointer', 
              textAlign: 'center',
              opacity: 0.4,
              filter: 'grayscale(100%)',
              transition: '0.2s'
            }}
          >
            <img 
              src={`${DD_BASE}/cdn/${version}/img/champion/${champ.id}.png`} 
              alt={champ.name}
              style={{ width: `${sizes[iconSize].imgWidth}px`, borderRadius: '8px', border: '3px solid #c8aa6e' }}
            />
            <div style={{ fontSize: '12px', marginTop: '0px', fontWeight: 'bold' }}>
              {champ.name}
            </div>
          </div>
        ))}
      </div>
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        left: '10px', 
        color: '#555', 
        fontSize: '12px', 
        fontStyle: 'italic' 
      }}>
        Made by fishb0ne
      </div>
    </div>
  );
};

export default ChampionTracker;