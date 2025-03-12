
import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebaseDB";
import { Aircraft } from "@/types/aircraft";

export const useAircraftData = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  
  useEffect(() => {
    const fetchAircraftData = async () => {
      try {
        const aircraftCollection = collection(db, 'aircraft');
        const aircraftSnapshot = await getDocs(aircraftCollection);
        const aircraft = aircraftSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Aircraft[];
        
        // Sort alphabetically by registration
        const sortedAircraft = aircraft.sort((a, b) => 
          a.registration.localeCompare(b.registration)
        );
        
        // Remove duplicates based on registration
        const uniqueAircraft = sortedAircraft.filter(
          (aircraft, index, self) =>
            index === self.findIndex((a) => a.registration === aircraft.registration)
        );
        
        setAircraftList(uniqueAircraft);
      } catch (error) {
        console.error("Error fetching aircraft data:", error);
      }
    };
    
    fetchAircraftData();
  }, []);
  
  return { aircraftList };
};
