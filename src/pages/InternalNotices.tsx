
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

const InternalNotices = () => {
  const { currentUser } = useAuth();
  const [notices] = useState([
    {
      id: '1',
      title: 'System Maintenance',
      description: 'System will be down for maintenance on Saturday from 2AM to 4AM',
      date: '2025-04-10',
      author: 'System Admin'
    },
    {
      id: '2',
      title: 'New Procedures',
      description: 'Updated defect reporting procedures are now in effect. Please review the documentation.',
      date: '2025-04-03',
      author: 'Operations Manager'
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-700 text-white p-4">
      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6">Internal Notices</h1>
        
        {notices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <Card key={notice.id} className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>{notice.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    Posted on {new Date(notice.date).toLocaleDateString()} by {notice.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{notice.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm">Read More</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No notices available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalNotices;
