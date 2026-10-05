import { useEffect, useState } from 'react';
import { userApi } from '../api/endpoints';

export interface HireOptions {
  purposes: string[];
  durations: number[];
  timeSlots: string[];
  genderOptions: string[];
  experienceOptions: string[];
  defaults: {
    guardsCount: number;
    gender: string;
    experience: string;
    durationHours: number;
    timeSlotIndex: number;
  };
}

let cachedOptions: HireOptions | null = null;

export const useHireOptions = () => {
  const [options, setOptions] = useState<HireOptions | null>(cachedOptions);
  const [isLoading, setIsLoading] = useState(!cachedOptions);

  useEffect(() => {
    if (cachedOptions) return;
    userApi
      .getHireOptions()
      .then((res) => {
        cachedOptions = res.data.data.options;
        setOptions(cachedOptions);
      })
      .catch((error) => console.log('Hire options load error: ', error))
      .finally(() => setIsLoading(false));
  }, []);

  return { options, isLoading };
};
