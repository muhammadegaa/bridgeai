/**
 * Data Initialization Hook
 * Handles automatic seeding and database setup
 */

import { useState, useEffect } from 'react';
import { seedingService } from '../services/seedingService';

interface InitializationStatus {
  isInitializing: boolean;
  isComplete: boolean;
  error: string | null;
  progress: {
    prompts: boolean;
    terms: boolean;
    config: boolean;
  };
}

export function useDataInitialization() {
  const [status, setStatus] = useState<InitializationStatus>({
    isInitializing: false,
    isComplete: false,
    error: null,
    progress: {
      prompts: false,
      terms: false,
      config: false,
    },
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setStatus(prev => ({ ...prev, isInitializing: true, error: null }));

      // Check what needs to be seeded
      const seedingStatus = await seedingService.checkSeedingStatus();

      setStatus(prev => ({
        ...prev,
        progress: {
          prompts: seedingStatus.prompts,
          terms: seedingStatus.terms,
          config: seedingStatus.config,
        },
      }));

      if (seedingStatus.needsSeeding) {
        console.log('Initializing missing data...');
        await seedingService.seedMissingData();
        
        // Verify seeding completed
        const finalStatus = await seedingService.checkSeedingStatus();
        setStatus(prev => ({
          ...prev,
          progress: {
            prompts: finalStatus.prompts,
            terms: finalStatus.terms,
            config: finalStatus.config,
          },
          isComplete: !finalStatus.needsSeeding,
        }));
      } else {
        setStatus(prev => ({ ...prev, isComplete: true }));
      }
    } catch (error: any) {
      console.error('Data initialization failed:', error);
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to initialize data',
        isComplete: false,
      }));
    } finally {
      setStatus(prev => ({ ...prev, isInitializing: false }));
    }
  };

  const retryInitialization = () => {
    initializeData();
  };

  const forceReinitialize = async () => {
    try {
      setStatus(prev => ({ ...prev, isInitializing: true, error: null }));
      seedingService.resetSeedingStatus();
      await seedingService.seedAllData();
      setStatus(prev => ({
        ...prev,
        isComplete: true,
        progress: { prompts: true, terms: true, config: true },
      }));
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        error: error.message || 'Failed to reinitialize data',
      }));
    } finally {
      setStatus(prev => ({ ...prev, isInitializing: false }));
    }
  };

  return {
    ...status,
    retryInitialization,
    forceReinitialize,
  };
}