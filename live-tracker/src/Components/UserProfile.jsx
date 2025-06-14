// import React, { useEffect, useState } from 'react';
// import styles from '../Styles/AdminProfile.module.css'; // or reuse AdminProfile.module.css if you want

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // change if needed

// const UserProfile = ({ token }) => {
//   const [user, setUser] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '', // for new password input only
//     address: '',
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [message, setMessage] = useState('');

//   const fetchProfile = async () => {
//     if (!token) {
//       setMessage('No authorization token found.');
//       return;
//     }

//     try {
//       const response = await fetch(`${BACKEND_URL}/user/profile`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           setMessage('Unauthorized. Please login again.');
//         } else {
//           setMessage('Failed to fetch profile');
//         }
//         return;
//       }

//       const data = await response.json();
//       setUser({ ...data, password: '' });
//       setMessage('');
//     } catch (err) {
//       setMessage('Failed to fetch profile');
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, [token]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUser((prev) => ({ ...prev, [name]: value }));
//     setMessage('');
//   };

//   const handleSave = async () => {
//     if (!token) {
//       setMessage('No authorization token found.');
//       return;
//     }

//     try {
//       const updateData = { ...user };
//       if (!updateData.password) {
//         delete updateData.password; // avoid sending empty password
//       }

//       const response = await fetch(`${BACKEND_URL}/user/profile`, {
//         method: 'PUT',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updateData),
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           setMessage('Unauthorized. Please login again.');
//         } else {
//           setMessage('Failed to update profile');
//         }
//         return;
//       }

//       setMessage('Profile updated successfully');
//       setIsEditing(false);
//       fetchProfile();
//     } catch (err) {
//       setMessage('Failed to update profile');
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>User Profile</h2>
//       {message && <p className={styles.message}>{message}</p>}

//       <div className={styles.form}>
//         <label>Name:</label>
//         <input
//           name="name"
//           value={user.name}
//           onChange={handleChange}
//           disabled={!isEditing}
//         />

//         <label>Email:</label>
//         <input
//           name="email"
//           type="email"
//           value={user.email}
//           onChange={handleChange}
//           disabled={!isEditing}
//         />

        

//         <label>Password:</label>
//         <input
//           name="password"
//           type="password"
//           value={user.password}
//           onChange={handleChange}
//           disabled={!isEditing}
//           placeholder="••••••••"
//           autoComplete="new-password"
//         />

//         <label>Address:</label>
//         <input
//           name="address"
//           value={user.address}
//           onChange={handleChange}
//           disabled={!isEditing}
//         />

//         {isEditing ? (
//           <button className={styles.saveBtn} onClick={handleSave}>
//             Save
//           </button>
//         ) : (
//           <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
//             Edit Profile
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfile;
import React, { useEffect, useState, useRef } from 'react';
import styles from '../Styles/AdminProfile.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserProfile = ({ token }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    address: '',
    imagePath: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    if (!token) {
      setMessage('No authorization token found.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Unauthorized. Please login again.');
        } else {
          setMessage('Failed to fetch profile');
        }
        return;
      }

      const data = await response.json();
      setUser({ ...data, password: '' });
      setSelectedImage(null);
      setMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessage('Failed to fetch profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setMessage('');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type starts with image/
      if (!file.type.startsWith('image/')) {
        setMessage('Please upload a valid image file.');
        // Clear invalid file input
        e.target.value = '';
        return;
      }
      setSelectedImage(file);
      setMessage('');
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    // Optionally clear current image preview as well
    // setUser((prev) => ({ ...prev, imagePath: '' }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!token) {
      setMessage('No authorization token found.');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('name', user.name);
      formData.append('email', user.email);
      formData.append('phoneNumber', user.phoneNumber || '');
      formData.append('address', user.address || '');

      if (user.password) {
        formData.append('password', user.password);
      }

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${BACKEND_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setMessage('Unauthorized. Please login again.');
        } else {
          setMessage('Failed to update profile');
        }
        return;
      }

      setMessage('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>User Profile</h2>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.profileImageContainer}>
        {selectedImage ? (
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected"
            className={styles.profileImage}
          />
        ) : user.imagePath ? (
          <img
            src={`${BACKEND_URL}${user.imagePath}`}
            alt="Profile"
            className={styles.profileImage}
          />
        ) : (
          <div className={styles.noImagePlaceholder}>No profile image</div>
        )}

        {isEditing && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.imageInput}
            />
            {selectedImage && (
              <button
                type="button"
                onClick={clearSelectedImage}
                className={styles.clearImageBtn}
              >
                Clear selected image
              </button>
            )}
          </>
        )}
      </div>

      <div className={styles.form}>
        <label>Name:</label>
        <input
          name="name"
          value={user.name}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Email:</label>
        <input
          name="email"
          type="email"
          value={user.email}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Phone:</label>
        <input
          name="phoneNumber"
          value={user.phoneNumber}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Password:</label>
        <input
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <label>Address:</label>
        <input
          name="address"
          value={user.address}
          onChange={handleChange}
          disabled={!isEditing}
        />

        {isEditing ? (
          <button className={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        ) : (
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
