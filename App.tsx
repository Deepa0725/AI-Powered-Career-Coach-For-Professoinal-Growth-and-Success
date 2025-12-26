import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/NotFound";
import CodeEditor from "./pages/CodeEditor";
import AdminVideoUpload from "./pages/AdminVideoUpload";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import AddCoursesAdmin from "./pages/AddCourseAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/add-courses-admin" element={<AddCoursesAdmin />} />
          // In App.tsx
          <Route path="/" element={<Landing />} />
          // Add this route to your App.tsx
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/admin-videos" element={<AdminVideoUpload />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/profile" element={<Profile />} />
          // In your App.tsx or router configuration, add:
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
