// Progress tiers and thresholds per challenge
const CHALLENGE_TIERS = {
  "All Random All Champions": [1, 5, 15, 30, 50, 100, 150],
  "Invincible": [2, 5, 10, 15, 30, 50, 75],
  "Perfectionist": [1, 5, 15, 30, 50, 100, 150],
  "Jack of All Champs": [10, 25, 50, 75, 100, 125, 150],
  "Protean Override": [3, 5, 10, 15, 30, 75, 100],
  "Same Penta, Different Champ": [1, 3, 5, 10, 15, 20, 30]
};

const TIER_NAMES = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];
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

  // Progress calculation
  const completed = doneChampions.length;
  const total = allChampions.length;
  const thresholds = CHALLENGE_TIERS[currentChallenge] || [1, 5, 15, 30, 50, 100, 150]; // fallback
  // Find current tier
  let currentTierIndex = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (completed >= thresholds[i]) {
      currentTierIndex = i;
      break;
    }
  }
  const currentTier = TIER_NAMES[currentTierIndex];
  // Next tier info
  const nextTierIndex = currentTierIndex + 1;
  const nextTierName = nextTierIndex < TIER_NAMES.length ? TIER_NAMES[nextTierIndex] : null;
  const nextTierCount = nextTierIndex < thresholds.length ? thresholds[nextTierIndex] : null;
  // Progress bar percent (towards next tier or max)
  const currentThreshold = thresholds[currentTierIndex];
  const nextThreshold = nextTierCount || thresholds[thresholds.length - 1];
  const tierProgress = nextThreshold - currentThreshold;
  const tierCompleted = completed - currentThreshold;
  const tierPercent = tierProgress > 0 ? Math.round((tierCompleted / tierProgress) * 100) : 100;

  return (
    <div className="main-container">

      <div className="title-container">
          <h1 className="title">
              LoL Challenges Champion Tracker
          </h1>
      </div>
      {/* Controls Row */}
      <div className="controls-row">
        <label className="show-completed">
          <input 
            className="checkbox"
            type="checkbox" 
            checked={showDone} 
            onChange={(e) => setShowDone(e.target.checked)} 
          />
          <span className="checkbox-label">Show Completed</span>
        </label>

        <select 
          className="challenge-select"
          value={currentChallenge} 
          onChange={(e) => setCurrentChallenge(e.target.value)} 
        >
          {[...challenges].sort((a, b) => a.localeCompare(b)).map(c => (
            <option className="select-option" key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="icon-buttons">
          <button 
            className="icon-button"
            style={{ backgroundColor: iconSize === 'small' ? '#c8aa6e' : '#2a2a2a' }}
            onClick={() => setIconSize('small')} 
          >
            S
          </button>
          <button 
            className="icon-button"
            style={{ backgroundColor: iconSize === 'medium' ? '#c8aa6e' : '#2a2a2a' }}
            onClick={() => setIconSize('medium')} 
          >
            M
          </button>
          <button 
            className="icon-button"
            style={{ backgroundColor: iconSize === 'large' ? '#c8aa6e' : '#2a2a2a' }}
            onClick={() => setIconSize('large')} 
          >
            L
          </button>
        </div>
      </div>
            {/* Progress Bar & Tier */}
      <div className="progress-container">
        <div className="progress-header">
          <span className="progress-title">Progress</span>
          <span className="progress-count">{completed} / {thresholds[thresholds.length - 1]} champions</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{
            width: Math.min(100, Math.round((completed / thresholds[thresholds.length - 1]) * 100)) + '%',
            justifyContent: Math.min(100, Math.round((completed / thresholds[thresholds.length - 1]) * 100)) > 10 ? 'flex-end' : 'center'
          }}>{Math.min(100, Math.round((completed / thresholds[thresholds.length - 1]) * 100))}%</div>
        </div>
        <div className="progress-footer">
          <span className="tier-label">Tier: {currentTier}</span>
          <span className="next-tier">
            {nextTierName ? `Next: ${nextTierName} (${nextTierCount - completed} more)` : 'Max tier reached!'}
          </span>
        </div>
      </div>
      <div className="champion-grid" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${sizes[iconSize].minMax}px, 1fr))` }}>
        {availableChampions.map(champ => (
          <div 
            className="champion-item"
            style={{ opacity: 1, filter: 'none' }}
            key={champ.id} 
            onClick={() => toggleChampion(champ.id)}
          >
            <img 
              className="champion-image"
              style={{ width: `${sizes[iconSize].imgWidth}px`, border: '3px solid transparent' }}
              src={`${DD_BASE}/cdn/${version}/img/champion/${champ.id}.png`} 
              alt={champ.name}
            />
            <div className="champion-name" style={{ marginTop: '5px', fontWeight: 'normal' }}>
              {champ.name}
            </div>
          </div>
        ))}
        {showDone && doneChampions.map(champ => (
          <div 
            className="champion-item"
            style={{ opacity: 0.4, filter: 'grayscale(100%)' }}
            key={champ.id} 
            onClick={() => toggleChampion(champ.id)}
          >
            <img 
              className="champion-image"
              style={{ width: `${sizes[iconSize].imgWidth}px`, border: '3px solid #c8aa6e' }}
              src={`${DD_BASE}/cdn/${version}/img/champion/${champ.id}.png`} 
              alt={champ.name}
            />
            <div className="champion-name" style={{ marginTop: '0px', fontWeight: 'bold' }}>
              {champ.name}
            </div>
          </div>
        ))}
      </div>
      <div className="footer">
        Made by fishb0ne
      </div>
    </div>
  );
};

export default ChampionTracker;