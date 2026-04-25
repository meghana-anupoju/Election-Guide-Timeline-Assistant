import { useState, useEffect } from 'react';
import { getStates, getStateData } from '../services/api';

export function useStateData() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [stateData, setStateData] = useState(null);
  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [error, setError] = useState(null);

  // Load all states on mount
  useEffect(() => {
    setIsLoadingStates(true);
    getStates()
      .then(setStates)
      .catch(err => setError(err.message))
      .finally(() => setIsLoadingStates(false));
  }, []);

  // Load full state data whenever selection changes
  useEffect(() => {
    if (!selectedState) {
      setStateData(null);
      return;
    }
    setIsLoadingState(true);
    setError(null);
    getStateData(selectedState.id)
      .then(setStateData)
      .catch(err => setError(err.message))
      .finally(() => setIsLoadingState(false));
  }, [selectedState]);

  return {
    states,
    selectedState,
    setSelectedState,
    stateData,
    isLoadingStates,
    isLoadingState,
    error,
  };
}
