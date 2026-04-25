import { useState, useEffect, useCallback } from 'react';

const GAPI_SCRIPT_ID = 'gapi-script';
const GIS_SCRIPT_ID = 'gis-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export function useGoogleCalendar() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const hasClientId = Boolean(CLIENT_ID);

  useEffect(() => {
    if (!hasClientId) return;

    // Load GAPI
    const loadGapi = () => new Promise((resolve) => {
      if (window.gapi) return resolve();
      const script = document.createElement('script');
      script.id = GAPI_SCRIPT_ID;
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({ discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'] });
          resolve();
        });
      };
      document.head.appendChild(script);
    });

    // Load GIS
    const loadGis = () => new Promise((resolve) => {
      if (window.google?.accounts) return resolve();
      const script = document.createElement('script');
      script.id = GIS_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      document.head.appendChild(script);
    });

    Promise.all([loadGapi(), loadGis()]).then(() => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            setError(tokenResponse.error_description || 'Authorization failed.');
            setIsSignedIn(false);
          } else {
            setAccessToken(tokenResponse.access_token);
            setIsSignedIn(true);
            setError(null);
          }
          setIsLoading(false);
        },
      });
      setTokenClient(client);
      setIsLoaded(true);
    }).catch((err) => {
      setError('Failed to load Google APIs.');
      console.error(err);
    });
  }, [hasClientId]);

  const signIn = useCallback(() => {
    if (!tokenClient) return;
    setIsLoading(true);
    setError(null);
    tokenClient.requestAccessToken();
  }, [tokenClient]);

  const signOut = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }
    setAccessToken(null);
    setIsSignedIn(false);
  }, [accessToken]);

  const addEvent = useCallback(async (eventDetails) => {
    if (!hasClientId) {
      window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.startDate.replace(/-/g, '')}/${eventDetails.endDate.replace(/-/g, '')}&details=${encodeURIComponent(eventDetails.description || '')}`, '_blank');
      return { success: true, method: 'google_calendar_link' };
    }

    if (!isSignedIn || !accessToken) {
      signIn();
      return { success: false, needsAuth: true };
    }

    try {
      const event = {
        summary: eventDetails.title,
        description: eventDetails.description || '',
        start: { date: eventDetails.startDate, timeZone: 'America/New_York' },
        end: { date: eventDetails.endDate || eventDetails.startDate, timeZone: 'America/New_York' },
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) throw new Error(`Calendar API error: ${response.status}`);
      return { success: true, event: await response.json() };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [hasClientId, isSignedIn, accessToken, signIn]);

  const addMultipleEvents = useCallback(async (events) => {
    const results = [];
    for (const event of events) {
      const result = await addEvent(event);
      results.push(result);
      if (result.needsAuth) break; // Stop if auth needed
    }
    return results;
  }, [addEvent]);

  // Build a Google Calendar link (works without auth)
  const buildCalendarLink = useCallback((eventDetails) => {
    const start = eventDetails.startDate?.replace(/-/g, '') || '';
    const end = eventDetails.endDate?.replace(/-/g, '') || start;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventDetails.title,
      dates: `${start}/${end}`,
      details: eventDetails.description || '',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }, []);

  return {
    isLoaded,
    isSignedIn,
    isLoading,
    error,
    hasClientId,
    signIn,
    signOut,
    addEvent,
    addMultipleEvents,
    buildCalendarLink,
  };
}
