import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

const AddEntry = () => {
  console.log("AddEntry component loaded"); // Sprawdzenie w konsoli

  const [formData, setFormData] = useState({
    alt: "",
    long: "",
    companyName: "",
    message: "",
    expirationTime: "",
    remainingCalls: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const expirationTimeInSeconds = Number(formData.expirationTime);
        if (isNaN(expirationTimeInSeconds) || expirationTimeInSeconds <= 0) {
            alert("Expiration time must be a positive number!");
            return;
        }

        // ✅ Tworzymy poprawny timestamp
        const expirationTimestamp = Timestamp.fromMillis(Date.now() + expirationTimeInSeconds * 1000);

        // ✅ Tworzymy nowy obiekt, usuwając expirationTime i remainingCalls
        const sanitizedFormData = { ...formData }; 
        delete sanitizedFormData.expirationTime; 
        delete sanitizedFormData.remainingCalls; 

        // 🔍 **Logowanie do debugowania**
        console.log("🚀 FormData przed zapisaniem:", formData);
        console.log("📌 Expiration Time (w sekundach):", expirationTimeInSeconds);
        console.log("⏳ Expiration Timestamp (w Firestore Timestamp):", expirationTimestamp);
        console.log("📝 Sanitized FormData:", sanitizedFormData);

        // ✅ Dodajemy wpis do Firestore
        await addDoc(collection(db, "active_subsribable_objects"), {
            ...sanitizedFormData,
            createdAt: serverTimestamp(),
            expirationTime: expirationTimestamp, // ✅ Powinno być poprawnie zapisane jako Timestamp
            remainingCalls: Number(formData.remainingCalls)
        });

        alert("Entry added successfully!");
        setFormData({
            alt: "",
            long: "",
            companyName: "",
            message: "",
            expirationTime: "",
            remainingCalls: ""
        });
    } catch (error) {
        console.error("❌ Error adding document: ", error);
    }
  };

  return (
    <div>
      <h2>Add New Entry</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="alt" placeholder="Alt" value={formData.alt} onChange={handleChange} required />
        <input type="text" name="long" placeholder="Long" value={formData.long} onChange={handleChange} required />
        <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required />
        <textarea name="message" placeholder="Message" value={formData.message} onChange={handleChange} required />
        <input type="number" name="expirationTime" placeholder="Expiration Time (in seconds)" value={formData.expirationTime} onChange={handleChange} required />
        <input type="number" name="remainingCalls" placeholder="Remaining Calls" value={formData.remainingCalls} onChange={handleChange} required />
        <button type="submit">Add Entry</button>
      </form>
    </div>
  );
};

export default AddEntry;