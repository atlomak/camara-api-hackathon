import React, { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import axios from "axios";
import "./App.css"; // Import nowego stylu

const AddEntry = () => {
  console.log("AddEntry component loaded");

  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
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

        const expirationTimestamp = Timestamp.fromMillis(Date.now() + expirationTimeInSeconds * 1000);

        const sanitizedFormData = { ...formData }; 
        delete sanitizedFormData.expirationTime; 
        delete sanitizedFormData.remainingCalls; 

        console.log("🚀 FormData przed zapisaniem:", formData);

        const docRef = await addDoc(collection(db, "active_subsribable_objects"), {
            ...sanitizedFormData,
            createdAt: serverTimestamp(),
            expirationTime: expirationTimestamp,
            remainingCalls: Number(formData.remainingCalls)
        });

        console.log(`✅ Entry added with ID: ${docRef.id}`);

        try {
            const response = await axios.post(
              "https://us-central1-orangehackathon-9d5d7.cloudfunctions.net/triggerGeofencingForLocation",
              {
                  data: {
                      latitude: formData.latitude,
                      longitude: formData.longitude,
                      expirationTime: expirationTimestamp.toMillis(),
                      locationId: docRef.id
                  }
              }
          );

            console.log("📡 Geofencing triggered:", response.data);
        } catch (error) {
            console.error("❌ Error triggering geofencing:", error.response?.data || error.message);
        }

        alert("Entry added successfully!");
        setFormData({
            latitude: "",
            longitude: "",
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
    <div className="terminal">
      <div className="terminal-header">📡 Panel Administracyjny</div>
      
      {/* 🔥 Nowa sekcja opisu */}
      <div className="terminal-description">
        <p>Ten panel umożliwia zarządzanie geofencingiem dla klientów biznesowych. 
          Możesz tutaj dodawać nowe obszary monitorowane i ustalać parametry subskrypcji.</p>
      </div>

      <form className="terminal-form" onSubmit={handleSubmit}>
        <input type="number" name="latitude" className="terminal-input" placeholder="Latitude" value={formData.latitude} onChange={handleChange} required />
        <input type="number" name="longitude" className="terminal-input" placeholder="Longitude" value={formData.longitude} onChange={handleChange} required />
        <input type="text" name="companyName" className="terminal-input" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required />
        <textarea name="message" className="terminal-input" placeholder="Message" value={formData.message} onChange={handleChange} required />
        <input type="number" name="expirationTime" className="terminal-input" placeholder="Expiration Time (in seconds)" value={formData.expirationTime} onChange={handleChange} required />
        <input type="number" name="remainingCalls" className="terminal-input" placeholder="Remaining Calls" value={formData.remainingCalls} onChange={handleChange} required />
        <button type="submit" className="terminal-button">💾 Zapisz</button>
      </form>
    </div>
  );
};

export default AddEntry;
