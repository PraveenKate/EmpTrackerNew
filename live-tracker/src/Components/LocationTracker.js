// import { useEffect, useRef } from 'react';

// const LocationTracker = ({ token, socketRef }) => {
//   const timeoutRef = useRef(null);
//   const mountedRef = useRef(false); // Prevent double setup in dev

//   const getAndSendLocation = async () => {
//     if (!socketRef.current || !token) return;

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const { latitude, longitude } = pos.coords;
//         let address = 'Address not found';

//         try {
//           const res = await fetch(
//             `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
//           );
//           const data = await res.json();
//           address = data.display_name || address;
//         } catch (err) {
//           console.error('Reverse geocoding error:', err);
//         }

//         // Emit location
//         socketRef.current.emit('send-location', {
//           lat: latitude,
//           lng: longitude,
//           address,
//         });

//         // Schedule next update
//         timeoutRef.current = setTimeout(getAndSendLocation, 60000);
//       },
//       (error) => {
//         console.error('Geolocation error:', error.message);
//         // Still schedule next attempt even on error
//         timeoutRef.current = setTimeout(getAndSendLocation, 60000);
//       },
//       { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
//     );
//   };

//   useEffect(() => {
//     if (!token || mountedRef.current) return;

//     mountedRef.current = true;
//     getAndSendLocation(); // Initial call

//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//       mountedRef.current = false;
//     };
//   }, [token]);

//   return null; // Background component
// };

// export default LocationTracker;
import { useEffect, useState, useCallback } from 'react';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LocationTracker = ({ token, socketRef }) => {
  const [tick, setTick] = useState(0);

  const frontendReverseGeocode = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) throw new Error(`Frontend geocoding error status: ${response.status}`);
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.warn('⚠️ Frontend reverse geocode error:', error);
      return null;
    }
  };

  const backendReverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/user/reverse-geocode?lat=${lat}&lon=${lon}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) {
        console.warn('⚠️ Backend reverse geocode did not return JSON or failed');
        return null;
      }
      const data = await res.json();
      return data.display_name || null;
    } catch (err) {
      console.warn('⚠️ Backend reverse geocode error:', err);
      return null;
    }
  };

  const getAndSendLocation = useCallback(() => {
    if (!navigator.geolocation || !socketRef.current) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Run backend and frontend reverse geocoding in parallel
        const [backendAddress, frontendAddress] = await Promise.all([
          backendReverseGeocode(latitude, longitude),
          frontendReverseGeocode(latitude, longitude),
        ]);

        const address = backendAddress || frontendAddress || 'Address not found';

        socketRef.current.emit('send-location', {
          lat: latitude,
          lng: longitude,
          address,
        });

        console.log(`📍 Location sent at tick ${tick}:`, {
          latitude,
          longitude,
          address,
          backendAddress,
          frontendAddress,
        });
      },
      (error) => {
        console.error('⚠️ Geolocation error:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, [tick, socketRef, token]);

  useEffect(() => {
    if (token && socketRef.current) {
      getAndSendLocation();
    }
  }, [tick, token, socketRef, getAndSendLocation]);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [token]);

  return null;
};

export default LocationTracker;
