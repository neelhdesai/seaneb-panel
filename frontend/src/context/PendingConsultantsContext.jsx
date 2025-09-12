import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../lib/api";

// 1️⃣ Create context
const PendingConsultantsContext = createContext();

// 2️⃣ Create provider
export const PendingConsultantsProvider = ({ children }) => {
  const [pendingConsultants, setPendingConsultants] = useState(0);

  // Optional: fetch initial pending count
  const fetchPendingCount = async () => {
    try {
      const res = await api.get("/api/users/pending-count");
      setPendingConsultants(res.data.count);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
  }, []);

  return (
    <PendingConsultantsContext.Provider value={{ pendingConsultants, setPendingConsultants, fetchPendingCount }}>
      {children}
    </PendingConsultantsContext.Provider>
  );
};


export const usePendingConsultants = () => useContext(PendingConsultantsContext);
