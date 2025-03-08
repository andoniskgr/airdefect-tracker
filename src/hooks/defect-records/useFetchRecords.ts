
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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
    let recordsQuery;
    
    if (userEmail) {
      recordsQuery = query(recordsCollection, where("createdBy", "==", userEmail));
    } else {
      recordsQuery = query(recordsCollection);
    }
    
    const unsubscribe = onSnapshot(recordsQuery, (snapshot) => {
      console.log(`Snapshot received, docs count: ${snapshot.docs.length} for user ${userEmail}`);
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DefectRecord[];
      
      setDefectRecords(records);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      toast.error("Failed to load records: " + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userEmail]);

  return {
    defectRecords,
    loading
  };
};
