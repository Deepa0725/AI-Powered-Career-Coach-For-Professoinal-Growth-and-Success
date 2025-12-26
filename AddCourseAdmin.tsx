import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { addDSACourses } from "@/scripts/addDSACourses";
import { useNavigate } from "react-router-dom";

const AddCoursesAdmin = () => {
  const navigate = useNavigate();

  const handleAddCourses = async () => {
    try {
      toast.info("Adding DSA courses... This may take a moment.");
      await addDSACourses();
      toast.success("DSA courses added successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add courses");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 p-8">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-6 card-glow">
          <h1 className="text-3xl font-bold mb-4">Add DSA Courses</h1>
          <p className="text-muted-foreground mb-6">
            This will add all the Striver DSA playlist courses to your database.
            Make sure you're logged in as an admin.
          </p>
          
          <div className="space-y-4">
            <Button onClick={handleAddCourses} className="w-full">
              Add All DSA Courses
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Courses that will be added:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Stack and Queue Playlist</li>
              <li>Arrays Playlist</li>
              <li>Greedy Algorithms</li>
              <li>Two Pointer and Sliding Window</li>
              <li>Mathematics for CP</li>
              <li>Bit Manipulation</li>
              <li>Linked List</li>
              <li>Binary Search</li>
              <li>Strivers A2Z DSA Course</li>
              <li>Dynamic Programming</li>
              <li>Graph Algorithms</li>
              <li>C++ STL</li>
              <li>Trie Data Structure</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddCoursesAdmin;