// import React, { useState } from "react";
// import styles from "../Styles/AddEmployee.module.css";

// const AddEmployee = ({ token, goBack }) => {
//   const [addUserError, setAddUserError] = useState("");
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

//   const handleAddUser = async (e) => {
//   e.preventDefault();
//   setAddUserError("");

//   const name = e.target.name.value;
//   const email = e.target.email.value;
//   const password = e.target.password.value;
//   const address = e.target.address.value;
//   const salary = parseFloat(e.target.salary.value) || 0;
//   const phoneNumber = e.target.phoneNumber.value.trim();

//   // ✅ Validate phone number
//   const phoneRegex = /^[6-9]\d{9}$/; // Accepts 10 digits starting with 6-9
//   if (!phoneRegex.test(phoneNumber)) {
//     setAddUserError("Invalid phone number. Must be 10 digits starting with 6-9.");
//     return;
//   }

//   try {
//     const res = await fetch(`${BACKEND_URL}/admin/users`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ name, email, password, address, salary, phoneNumber }),
//     });

//     if (!res.ok) {
//       const errorData = await res.json();
//       setAddUserError(
//         "Add user failed: " + (errorData.error || "Unknown error")
//       );
//       return;
//     }

//     alert("User added successfully");
//     e.target.reset();
//   } catch (err) {
//     setAddUserError("Error: " + err.message);
//   }
// };


//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h2 className={styles.title}>Add Employee</h2>
//         <button
//           onClick={goBack}
//           className={styles.goBackBtn}
//           aria-label="Go back"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className={styles.goBackIcon}
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//             width="20"
//             height="20"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//           </svg>
//           Go Back
//         </button>
//       </div>

//       <form onSubmit={handleAddUser} className={styles.form}>
//         <label htmlFor="name" className={styles.label}>
//           Full Name
//         </label>
//         <input
//           type="text"
//           id="name"
//           name="name"
//           placeholder="Enter full name"
//           required
//           className={styles.input}
//         />

//         <label htmlFor="email" className={styles.label}>
//           Email Address
//         </label>
//         <input
//           type="email"
//           id="email"
//           name="email"
//           placeholder="Enter email address"
//           required
//           className={styles.input}
//         />

//         <label htmlFor="password" className={styles.label}>
//           Password
//         </label>
//         <input
//           type="password"
//           id="password"
//           name="password"
//           placeholder="Enter password"
//           required
//           className={styles.input}
//         />

//         <label htmlFor="address" className={styles.label}>
//           Address
//         </label>
//         <input
//           type="text"
//           id="address"
//           name="address"
//           placeholder="Enter address"
//           className={styles.input}
//         />

//         <label htmlFor="salary" className={styles.label}>
//           Salary
//         </label>
//         <input
//           type="number"
//           id="salary"
//           name="salary"
//           placeholder="Enter salary"
//           className={styles.input}
//         />

//         <label htmlFor="phoneNumber" className={styles.label}>
//           Phone Number
//         </label>
//         <input
//           type="tel"
//           id="phoneNumber"
//           name="phoneNumber"
//           placeholder="Enter phone number"
//           required
//           className={styles.input}
//         />

//         <button type="submit" className={styles.submitBtn}>
//           Add User
//         </button>
//       </form>

//       {addUserError && <p className={styles.error}>{addUserError}</p>}
//     </div>
//   );
// };

// export default AddEmployee;
import React, { useState } from "react";
import styles from "../Styles/AddEmployee.module.css";

const AddEmployee = ({ token, goBack }) => {
  const [addUserError, setAddUserError] = useState("");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserError("");

    const formData = new FormData();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const address = e.target.address.value;
    const salary = e.target.salary.value;
    const phoneNumber = e.target.phoneNumber.value.trim();
    const imageFile = e.target.image.files[0];

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setAddUserError("Invalid phone number. Must be 10 digits starting with 6-9.");
      return;
    }

    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("address", address);
    formData.append("salary", salary);
    formData.append("phoneNumber", phoneNumber);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/admin/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setAddUserError("Add user failed: " + (errorData.error || "Unknown error"));
        return;
      }

      alert("User added successfully");
      e.target.reset();
    } catch (err) {
      setAddUserError("Error: " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Add Employee</h2>
        <button onClick={goBack} className={styles.goBackBtn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={styles.goBackIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            width="20"
            height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>

      <form onSubmit={handleAddUser} className={styles.form} encType="multipart/form-data">
        <label htmlFor="name" className={styles.label}>Full Name</label>
        <input type="text" id="name" name="name" placeholder="Enter full name" required className={styles.input} />

        <label htmlFor="email" className={styles.label}>Email Address</label>
        <input type="email" id="email" name="email" placeholder="Enter email address" required className={styles.input} />

        <label htmlFor="password" className={styles.label}>Password</label>
        <input type="password" id="password" name="password" placeholder="Enter password" required className={styles.input} />

        <label htmlFor="address" className={styles.label}>Address</label>
        <input type="text" id="address" name="address" placeholder="Enter address" className={styles.input} />

        <label htmlFor="salary" className={styles.label}>Salary</label>
        <input type="number" id="salary" name="salary" placeholder="Enter salary amount" min={0} className={styles.input} />

        <label htmlFor="phoneNumber" className={styles.label}>Phone Number</label>
        <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="Enter 10-digit phone number" required className={styles.input} />

        <label htmlFor="image" className={styles.label}>Upload Profile Image</label>
        <input type="file" id="image" name="image" accept="image/*" className={styles.input} placeholder="Choose image file" />

        <button type="submit" className={styles.submitBtn}>Add User</button>
      </form>

      {addUserError && <p className={styles.error}>{addUserError}</p>}
    </div>
  );
};

export default AddEmployee;
