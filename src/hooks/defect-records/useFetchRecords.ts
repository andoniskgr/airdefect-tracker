
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
      const unsubscribeUser = onSnapshot(userRecordsQuery, async (userSnapshot) => {
        console.log(`User records snapshot received, docs count: ${userSnapshot.docs.length} for user ${userEmail}`);
        
        // Get public records from other users
        const publicRecordsQuery = query(
          recordsCollection, 
          where("isPublic", "==", true),
          where("createdBy", "!=", userEmail)
        );
        
        try {
          const publicSnapshot = await getDocs(publicRecordsQuery);
          console.log(`Public records snapshot received, docs count: ${publicSnapshot.docs.length}`);
          
          const userRecords = userSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
            } as DefectRecord;
          });
          
          const publicRecords = publicSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
            } as DefectRecord;
          });
          
          // Combine both sets
          const allRecords = [...userRecords, ...publicRecords];
          setDefectRecords(allRecords);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching public records:", error);
          // Fallback to just user records
          const userRecords = userSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              isPublic: data.isPublic ?? false, // Ensure isPublic has a default value
            } as DefectRecord;
          });
          setDefectRecords(userRecords);
          setLoading(false);
        }
      }, (error) => {
        console.error("Firestore error:", error);
        toast.error("Failed to load records: " + error.message);
        setLoading(false);
      });
      
      unsubscribe = unsubscribeUser;
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
