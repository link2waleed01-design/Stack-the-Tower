import { useState, useEffect } from 'react';
import { getHighScore, saveHighScore, getHighScores, saveHighScores } from '../utils/storage';
import { GameMode } from '../types/game';

export const useHighScore = () => {
  const [highScore, setHighScore] = useState<number>(0);
  const [highScores, setHighScores] = useState<Record<GameMode, number>>({
    classic: 0,
    timeAttack: 0,
    challenge: 0,
  });

  useEffect(() => {
    loadHighScore();
    loadHighScores();
  }, []);

  const loadHighScore = async () => {
    const score = await getHighScore();
    setHighScore(score);
  };

  const loadHighScores = async () => {
    const scores = await getHighScores();
    setHighScores(scores);
  };

  const updateHighScore = async (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      await saveHighScore(newScore);
    }
  };

  const updateModeHighScore = async (mode: GameMode, newScore: number): Promise<boolean> => {
    const currentHighScore = highScores[mode] || 0;
    const isNewHighScore = newScore > currentHighScore;
    
    if (isNewHighScore) {
      const updatedHighScores = { ...highScores, [mode]: newScore };
      setHighScores(updatedHighScores);
      await saveHighScores(updatedHighScores);
    }
    
    return isNewHighScore;
  };

  const getModeHighScore = (mode: GameMode): number => {
    return highScores[mode] || 0;
  };

  return {
    highScore,
    updateHighScore,
    highScores,
    updateModeHighScore,
    getModeHighScore,
  };
};