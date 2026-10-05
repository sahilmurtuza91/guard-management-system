import { useEffect, useState } from 'react';
import { requestApi } from '../api/endpoints';
import { formatRequestTitle } from '../utils/requestLabel';

export const useRequestLabel = (requestId?: string) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    requestApi
      .getRequestDetails(requestId)
      .then((res) => {
        const r = res.data.data.request;
        if (active) setLabel(formatRequestTitle(r.serviceType, r.date));
      })
      .catch((error) => console.log('Request label load error: ', error));
    return () => {
      active = false;
    };
  }, [requestId]);

  return label || 'Guard Request';
};
