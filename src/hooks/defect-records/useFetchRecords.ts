
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { db, getAllRecords } from "../../utils/firebaseDB";
import { DefectRecord } from "../../components/defect-records/DefectRecord.types";

export const useFetchRecords = (userEmail: string | null | undefined) => {
  const [defectRecords, setDefectRecords] = useState<DefectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchRecords = async () => {
      try {
        const records = await getAllRecords(userEmail);
        setDefectRecords(records);
        console.log(`Fetched ${records.length} records for user ${userEmail}`);
      } catch (error) {
        console.error("Error fetching records:", error);
        toast.error("Failed to load records: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();

    const recordsCollection = collection(db, "defectRecords");
    let unsubscribe: () => void;
    
    if (userEmail) {
      // Listen to user's own records
      const userRecordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
      const unsubscribeUser = onSnapshot(userRecordsQuery, (userSnapshot) => {
        console.log(`User records snapshot received, docs count: ${userSnapshot.docs.length} for user ${userEmail}`);
        
        const userRecords = userSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
          } as DefectRecord;
        });
        
        // Update the records state with user's records
        setDefectRecords(prevRecords => {
          // Keep other users' public records and update user's own records
          const otherUsersRecords = prevRecords.filter(record => record.createdBy !== userEmail);
          const newRecords = [...userRecords, ...otherUsersRecords];
          
          // Log changes for debugging
          console.log(`Updated user records. Total records: ${newRecords.length}`);
          
          return newRecords;
        });
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        toast.error("Failed to load records: " + error.message);
        setLoading(false);
      });
      
      // Listen to all public records for real-time updates
      const publicRecordsQuery = query(
        recordsCollection, 
        where("isPublic", "==", true)
      );
      const unsubscribePublic = onSnapshot(publicRecordsQuery, (publicSnapshot) => {
        console.log(`Public records snapshot received, docs count: ${publicSnapshot.docs.length}`);
        
        const allPublicRecords = publicSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
          } as DefectRecord;
        });
        
        // Filter out user's own records from public records to avoid duplicates
        const otherUsersPublicRecords = allPublicRecords.filter(record => record.createdBy !== userEmail);
        
        console.log(`Other users' public records: ${otherUsersPublicRecords.length}`);
        
        // Update the records state with public records
        setDefectRecords(prevRecords => {
          // Keep user's own records and update public records from other users
          const userOwnRecords = prevRecords.filter(record => record.createdBy === userEmail);
          const newRecords = [...userOwnRecords, ...otherUsersPublicRecords];
          
          // Log changes for debugging
          const prevPublicCount = prevRecords.filter(r => r.createdBy !== userEmail && r.isPublic).length;
          const newPublicCount = otherUsersPublicRecords.length;
          if (newPublicCount !== prevPublicCount) {
            console.log(`Public records count changed: ${prevPublicCount} -> ${newPublicCount}`);
          }
          
          return newRecords;
        });
        setLoading(false);
      }, (error) => {
        console.error("Error fetching public records:", error);
        setLoading(false);
      });
      
      // Return a function that unsubscribes from both listeners
      unsubscribe = () => {
        unsubscribeUser();
        unsubscribePublic();
      };
    } else {
      // Listen to all records if no user email
      const allRecordsQuery = query(recordsCollection);
      const unsubscribeAll = onSnapshot(allRecordsQuery, (snapshot) => {
        console.log(`All records snapshot received, docs count: ${snapshot.docs.length}`);
        const records = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
          } as DefectRecord;
        });
        
        setDefectRecords(records);
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        toast.error("Failed to load records: " + error.message);
        setLoading(false);
      });
      
      unsubscribe = unsubscribeAll;
    }

    return () => unsubscribe();
  }, [userEmail]);

  return {
    defectRecords,
    loading
  };
};
