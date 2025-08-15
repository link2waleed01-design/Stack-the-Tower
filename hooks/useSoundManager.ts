import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SoundMap {
  [key: string]: Audio.Sound;
}

export type SoundType = 
  | 'click'
  | 'chime'
  | 'success'
  | 'failed'
  | 'purchase'
  | 'button'
  | 'drop';

const SOUND_FILES: Record<SoundType, any> = {
  click: require('../assets/sounds/click.mp3'),
  chime: require('../assets/sounds/chime.mp3'),
  success: require('../assets/sounds/success.mp3'),
  failed: require('../assets/sounds/failed.mp3'),
  purchase: require('../assets/sounds/purchase.mp3'),
  button: require('../assets/sounds/button.mp3'),
  drop: require('../assets/sounds/drop.mp3'),
};

const SOUND_SETTINGS_KEY = '@stack_tower_sound_settings';

export const useSoundManager = () => {
  const soundsRef = useRef<SoundMap>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializedRef = useRef(false);

  // Load sound settings from storage
  useEffect(() => {
    const loadSoundSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SOUND_SETTINGS_KEY);
        if (savedSettings !== null) {
          setSoundEnabled(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.warn('Failed to load sound settings:', error);
      }
    };

    loadSoundSettings();
  }, []);

  // Save sound settings when changed
  useEffect(() => {
    const saveSoundSettings = async () => {
      try {
        await AsyncStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(soundEnabled));
      } catch (error) {
        console.warn('Failed to save sound settings:', error);
      }
    };

    saveSoundSettings();
  }, [soundEnabled]);

  // Load all sounds on mount
  useEffect(() => {
    let isMounted = true;

    const loadSounds = async () => {
      if (isInitializedRef.current) return;

      try {
        // Set audio mode for better performance
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const soundPromises = Object.entries(SOUND_FILES).map(async ([key, source]) => {
          try {
            const { sound } = await Audio.Sound.createAsync(
              source,
              {
                shouldPlay: false,
                volume: 0.7,
                rate: 1.0,
                shouldCorrectPitch: true,
              }
            );
            
            if (isMounted) {
              soundsRef.current[key as SoundType] = sound;
            }
          } catch (error) {
            console.warn(`Failed to load sound ${key}:`, error);
          }
        });

        await Promise.all(soundPromises);
        
        if (isMounted) {
          setIsLoading(false);
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.warn('Failed to setup audio mode:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSounds();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle app state changes to manage audio properly
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Stop all sounds when app goes to background
        Object.values(soundsRef.current).forEach(async (sound) => {
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.isPlaying) {
              await sound.stopAsync();
            }
          } catch (error) {
            // Ignore errors when stopping sounds
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach(async (sound) => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    };
  }, []);

  const playSound = async (soundType: SoundType, volume: number = 0.7) => {
    if (!soundEnabled || isLoading || !isInitializedRef.current) return;

    const sound = soundsRef.current[soundType];
    if (!sound) {
      console.warn(`Sound ${soundType} not found`);
      return;
    }

    try {
      // Get current status
      const status = await sound.getStatusAsync();
      
      if (!status.isLoaded) {
        console.warn(`Sound ${soundType} not loaded`);
        return;
      }

      // Always stop and rewind for consistent playback
      if (status.isPlaying) {
        await sound.stopAsync();
      }
      await sound.setPositionAsync(0);

      // Set volume and play
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  };

  const stopSound = async (soundType: SoundType) => {
    const sound = soundsRef.current[soundType];
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.warn(`Failed to stop sound ${soundType}:`, error);
    }
  };

  const stopAllSounds = async () => {
    const stopPromises = Object.values(soundsRef.current).map(async (sound) => {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.stopAsync();
        }
      } catch (error) {
        // Ignore individual stop errors
      }
    });

    await Promise.allSettled(stopPromises);
  };

  const setVolume = async (soundType: SoundType, volume: number) => {
    const sound = soundsRef.current[soundType];
    if (!sound) return;

    try {
      await sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.warn(`Failed to set volume for ${soundType}:`, error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return {
    playSound,
    stopSound,
    stopAllSounds,
    setVolume,
    toggleSound,
    soundEnabled,
    isLoading,
  };
};