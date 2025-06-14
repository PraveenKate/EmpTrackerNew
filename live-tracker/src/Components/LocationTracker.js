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
import { useEffect, useState } from 'react';

const LocationTracker = ({ token, socketRef }) => {
  const [tick, setTick] = useState(0);

  console.log('LocationTracker rendered, tick =', tick);

  useEffect(() => {
    if (!token || !socketRef.current || !navigator.geolocation) return;

    const getAndSendLocation = () => {
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

          socketRef.current.emit('send-location', {
            lat: latitude,
            lng: longitude,
            address,
          });

          console.log(`Location sent at tick ${tick}:`, { latitude, longitude, address });
        },
        (error) => {
          console.error('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };

    getAndSendLocation();

  }, [tick, token, socketRef]);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000); // every 60 seconds

    return () => clearInterval(interval);
  }, [token]);

  return null;
};

export default LocationTracker;
