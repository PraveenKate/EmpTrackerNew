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
import { useEffect, useRef } from 'react';

const LocationTracker = ({ token, socketRef }) => {
  const timeoutRef = useRef(null);
  const mountedRef = useRef(false); // Prevent double setup in dev

  const getAndSendLocation = async () => {
    if (!socketRef.current || !token) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = 'Address not found';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          address = data.display_name || address;
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        // Emit location
        socketRef.current.emit('send-location', {
          lat: latitude,
          lng: longitude,
          address,
        });

        // Schedule next update
        timeoutRef.current = setTimeout(getAndSendLocation, 60000);
      },
      (error) => {
        console.error('Geolocation error:', error.message);
        // Still schedule next attempt even on error
        timeoutRef.current = setTimeout(getAndSendLocation, 60000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    if (!token || mountedRef.current) return;

    mountedRef.current = true;
    getAndSendLocation(); // Initial call

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      mountedRef.current = false;
    };
  }, [token]);

  return null; // Background component
};

export default LocationTracker;