import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  UserCheck, 
  UserX, 
  Upload, 
  Video, 
  ArrowLeft, 
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Trash2,
  Edit,
  Plus,
  Brain,
  LogOut,
  User,
  PlayCircle,
  Code2,
  Trophy,
  Sparkles,
  CheckCircle2
} from "lucide-react";

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();

  // Data states
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [learningVideos, setLearningVideos] = useState<any[]>([]);
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalVideos: 0,
    totalChallenges: 0,
    pendingApprovals: 0
  });

  // Form states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "beginner",
    duration_hours: 0,
    thumbnail_url: "",
    is_trending: false
  });

  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
    course_id: "",
    order_index: 0,
    thumbnail_url: "",
    platform: "YouTube"
  });

  const [challengeForm, setChallengeForm] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    problem_statement: "",
    test_cases: "",
    solution_template: "",
    category: "programming"
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        toast.error("Access denied: Admin only");
        navigate("/dashboard");
        return;
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to verify admin access");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      await loadPendingUsers();
      await loadAllUsers();
      await loadCourses();
      await loadLearningVideos();
      await loadCourseVideos();
      await loadDailyChallenges();
      await loadStats();
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    }
  };

  const loadPendingUsers = async () => {
    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false });

    setPendingUsers(users || []);
  };

  const loadAllUsers = async () => {
    const { data: users } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setAllUsers(users || []);
  };

  const loadCourses = async () => {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    setCourses(coursesData || []);
  };

  const loadLearningVideos = async () => {
    const { data: videos } = await supabase
      .from("learning_videos")
      .select("*")
      .order("created_at", { ascending: false });

    setLearningVideos(videos || []);
  };

  const loadCourseVideos = async () => {
    const { data: videos } = await supabase
      .from("course_videos")
      .select(`
        *,
        courses (
          title
        )
      `)
      .order("created_at", { ascending: false });

    setCourseVideos(videos || []);
  };

  const loadDailyChallenges = async () => {
    const { data: challenges } = await supabase
      .from("daily_challenges")
      .select("*")
      .order("created_at", { ascending: false });

    setDailyChallenges(challenges || []);
  };

  const loadStats = async () => {
    const totalUsers = allUsers.length;
    const totalCourses = courses.length;
    const totalVideos = learningVideos.length + courseVideos.length;
    const totalChallenges = dailyChallenges.length;
    const pendingApprovals = pendingUsers.length;

    setStats({
      totalUsers,
      totalCourses,
      totalVideos,
      totalChallenges,
      pendingApprovals
    });
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: "approved" })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User approved successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to approve user");
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: "rejected" })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User rejected");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to reject user");
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("courses").insert({
        ...courseForm,
        created_by: session?.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Course created successfully");
      setCourseForm({
        title: "",
        description: "",
        category: "",
        difficulty: "beginner",
        duration_hours: 0,
        thumbnail_url: "",
        is_trending: false
      });
      setShowAddCourse(false);
      await loadData();
    } catch (error: any) {
      toast.error("Failed to create course");
    }
  };

  const handleAddLearningVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("learning_videos").insert({
        ...videoForm,
        created_by: session?.user.id,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Learning video added successfully");
      setVideoForm({
        title: "",
        description: "",
        url: "",
        duration: "",
        course_id: "",
        order_index: 0,
        thumbnail_url: "",
        platform: "YouTube"
      });
      setShowAddVideo(false);
      await loadData();
    } catch (error: any) {
      toast.error("Failed to add video");
    }
  };

  const handleAddCourseVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("course_videos").insert({
        ...videoForm,
        course_id: selectedCourse,
        created_by: session?.user.id,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Course video added successfully");
      setVideoForm({
        title: "",
        description: "",
        url: "",
        duration: "",
        course_id: "",
        order_index: 0,
        thumbnail_url: "",
        platform: "YouTube"
      });
      setShowAddVideo(false);
      setSelectedCourse("");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to add video");
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from("daily_challenges").insert({
        ...challengeForm,
        date: new Date().toISOString().split('T')[0],
        created_by: session?.user.id,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Daily challenge added successfully");
      setChallengeForm({
        title: "",
        description: "",
        difficulty: "beginner",
        problem_statement: "",
        test_cases: "",
        solution_template: "",
        category: "programming"
      });
      setShowAddChallenge(false);
      await loadData();
    } catch (error: any) {
      toast.error("Failed to add challenge");
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;

      toast.success("Course deleted successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to delete course");
    }
  };

  const deleteVideo = async (videoId: string, type: 'learning' | 'course') => {
    try {
      const table = type === 'learning' ? 'learning_videos' : 'course_videos';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      toast.success("Video deleted successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to delete video");
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from("daily_challenges")
        .delete()
        .eq("id", challengeId);

      if (error) throw error;

      toast.success("Challenge deleted successfully");
      await loadData();
    } catch (error: any) {
      toast.error("Failed to delete challenge");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      default:
        return "bg-primary/20 text-primary border-primary/50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "programming":
        return "bg-blue-500/20 text-blue-400";
      case "web-development":
        return "bg-purple-500/20 text-purple-400";
      case "data-science":
        return "bg-orange-500/20 text-orange-400";
      case "mobile-development":
        return "bg-green-500/20 text-green-400";
      case "algorithms":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FutureLearnX Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <User className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Admin <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Manage your learning platform content and users</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses?.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <PlayCircle className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Code2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Challenges</p>
                <p className="text-2xl font-bold">{stats.totalChallenges}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/40 bg-card/30 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <UserCheck className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:max-w-2xl border-border/40 bg-background/50 backdrop-blur">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Pending Approvals */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-orange-500" />
                Pending User Approvals ({pendingUsers.length})
              </h3>
              
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                    <div>
                      <h4 className="font-semibold">{user.full_name || "No Name"}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}

                {pendingUsers.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" />
                    <p className="text-muted-foreground">No pending approvals</p>
                  </div>
                )}
              </div>
            </Card>

            {/* All Users */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                All Users ({allUsers.length})
              </h3>
              
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.full_name || "No Name"}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant={
                      user.approval_status === "approved" ? "default" :
                      user.approval_status === "pending" ? "secondary" : "destructive"
                    }>
                      {user.approval_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-500" />
                Course Management
              </h2>
              <Button 
                variant="hero" 
                onClick={() => setShowAddCourse(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            {/* Add Course Form */}
            {showAddCourse && (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4">Add New Course</h3>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-title">Course Title *</Label>
                      <Input
                        id="course-title"
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                        required
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-category">Category *</Label>
                      <Input
                        id="course-category"
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                        required
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-difficulty">Difficulty *</Label>
                      <Select
                        value={courseForm.difficulty}
                        onValueChange={(value) => setCourseForm({...courseForm, difficulty: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-duration">Duration (hours)</Label>
                      <Input
                        id="course-duration"
                        type="number"
                        value={courseForm.duration_hours}
                        onChange={(e) => setCourseForm({...courseForm, duration_hours: parseInt(e.target.value) || 0})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="course-description">Description *</Label>
                      <Textarea
                        id="course-description"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                        required
                        rows={3}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
                      <Input
                        id="course-thumbnail"
                        value={courseForm.thumbnail_url}
                        onChange={(e) => setCourseForm({...courseForm, thumbnail_url: e.target.value})}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input 
                        type="checkbox" 
                        id="course-trending" 
                        className="rounded" 
                        checked={courseForm.is_trending}
                        onChange={(e) => setCourseForm({...courseForm, is_trending: e.target.checked})}
                      />
                      <Label htmlFor="course-trending" className="cursor-pointer">
                        Mark as Trending
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="hero">
                      Create Course
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddCourse(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Courses List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden border-border/40 bg-card/30 backdrop-blur">
                  <div className="relative">
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/320x160/3B82F6/FFFFFF?text=Course+Thumbnail';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    {course.is_trending && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="default" className="bg-orange-500">
                          Trending
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getCategoryColor(course.category)}>
                        {course.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {course.duration_hours}h
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course.id);
                            setShowAddVideo(true);
                          }}
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this course?")) {
                              await deleteCourse(course.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {courses.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No courses available</p>
                <p className="text-muted-foreground mb-4">
                  Add your first course to get started
                </p>
                <Button 
                  variant="hero"
                  onClick={() => setShowAddCourse(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-red-500" />
                Video Management
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="hero" 
                  onClick={() => {
                    setSelectedCourse("");
                    setShowAddVideo(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Learning Video
                </Button>
              </div>
            </div>

            {/* Learning Videos */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Learning Videos ({learningVideos.length})</h3>
              <div className="space-y-4">
                {learningVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{video.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {video.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{video.platform}</Badge>
                          <span className="text-xs text-muted-foreground">{video.duration}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this video?")) {
                          await deleteVideo(video.id, 'learning');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Videos */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4">Course Videos ({courseVideos.length})</h3>
              <div className="space-y-4">
                {courseVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border border-border/40 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{video.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {video.courses?.title} • {video.duration}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">Order: {video.order_index}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this video?")) {
                          await deleteVideo(video.id, 'course');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Code2 className="w-6 h-6 text-green-500" />
                Daily Challenges
              </h2>
              <Button 
                variant="hero" 
                onClick={() => setShowAddChallenge(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Challenge
              </Button>
            </div>

            {/* Add Challenge Form */}
            {showAddChallenge && (
              <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                <h3 className="text-xl font-bold mb-4">Add Daily Challenge</h3>
                <form onSubmit={handleAddChallenge} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="challenge-title">Challenge Title *</Label>
                      <Input
                        id="challenge-title"
                        value={challengeForm.title}
                        onChange={(e) => setChallengeForm({...challengeForm, title: e.target.value})}
                        required
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="challenge-difficulty">Difficulty *</Label>
                      <Select
                        value={challengeForm.difficulty}
                        onValueChange={(value) => setChallengeForm({...challengeForm, difficulty: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="challenge-category">Category *</Label>
                      <Select
                        value={challengeForm.category}
                        onValueChange={(value) => setChallengeForm({...challengeForm, category: value})}
                      >
                        <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="data-structures">Data Structures</SelectItem>
                          <SelectItem value="web-development">Web Development</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="challenge-description">Description</Label>
                      <Textarea
                        id="challenge-description"
                        value={challengeForm.description}
                        onChange={(e) => setChallengeForm({...challengeForm, description: e.target.value})}
                        rows={2}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="challenge-problem">Problem Statement *</Label>
                      <Textarea
                        id="challenge-problem"
                        value={challengeForm.problem_statement}
                        onChange={(e) => setChallengeForm({...challengeForm, problem_statement: e.target.value})}
                        required
                        rows={4}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="challenge-test-cases">Test Cases</Label>
                      <Textarea
                        id="challenge-test-cases"
                        value={challengeForm.test_cases}
                        onChange={(e) => setChallengeForm({...challengeForm, test_cases: e.target.value})}
                        rows={3}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="challenge-template">Solution Template *</Label>
                      <Textarea
                        id="challenge-template"
                        value={challengeForm.solution_template}
                        onChange={(e) => setChallengeForm({...challengeForm, solution_template: e.target.value})}
                        required
                        rows={6}
                        className="border-border/40 bg-background/50 backdrop-blur font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="hero">
                      Add Challenge
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddChallenge(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Challenges List */}
            <div className="grid gap-6">
              {dailyChallenges.map((challenge) => (
                <Card key={challenge.id} className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(challenge.category)}>
                          {challenge.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(challenge.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this challenge?")) {
                          await deleteChallenge(challenge.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{challenge.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Problem Statement</h4>
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2">
                        {challenge.problem_statement}
                      </pre>
                    </div>
                    
                    {challenge.solution_template && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Solution Template</h4>
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-2 font-mono">
                          {challenge.solution_template}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {dailyChallenges.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <Code2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">No challenges available</p>
                <p className="text-muted-foreground mb-4">
                  Add your first daily challenge
                </p>
                <Button 
                  variant="hero"
                  onClick={() => setShowAddChallenge(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Challenge
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Quick Content Management
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => {
                    setShowAddCourse(true);
                    setActiveTab("courses");
                  }}
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Add Course</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => {
                    setSelectedCourse("");
                    setShowAddVideo(true);
                    setActiveTab("videos");
                  }}
                >
                  <PlayCircle className="w-6 h-6" />
                  <span>Add Video</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => {
                    setShowAddChallenge(true);
                    setActiveTab("challenges");
                  }}
                >
                  <Code2 className="w-6 h-6" />
                  <span>Add Challenge</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex flex-col gap-2"
                  onClick={() => setActiveTab("users")}
                >
                  <Users className="w-6 h-6" />
                  <span>Manage Users</span>
                </Button>
              </div>
            </Card>

            {/* Add Video Modal */}
            {showAddVideo && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="p-6 card-glow max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-4">
                    {selectedCourse ? "Add Video to Course" : "Add Learning Video"}
                  </h3>
                  <form onSubmit={selectedCourse ? handleAddCourseVideo : handleAddLearningVideo} className="space-y-4">
                    {selectedCourse && (
                      <div className="space-y-2">
                        <Label>Selected Course</Label>
                        <Input value={courses.find(c => c.id === selectedCourse)?.title} disabled />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="video-title">Video Title *</Label>
                      <Input
                        id="video-title"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        required
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="video-description">Description</Label>
                      <Textarea
                        id="video-description"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                        rows={3}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="video-url">Video URL *</Label>
                        <Input
                          id="video-url"
                          value={videoForm.url}
                          onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          required
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="video-duration">Duration</Label>
                        <Input
                          id="video-duration"
                          value={videoForm.duration}
                          onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                          placeholder="e.g., 15:30"
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="video-platform">Platform</Label>
                        <Select
                          value={videoForm.platform}
                          onValueChange={(value) => setVideoForm({ ...videoForm, platform: value })}
                        >
                          <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="YouTube">YouTube</SelectItem>
                            <SelectItem value="Vimeo">Vimeo</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCourse && (
                        <div className="space-y-2">
                          <Label htmlFor="video-order">Order Index</Label>
                          <Input
                            id="video-order"
                            type="number"
                            value={videoForm.order_index}
                            onChange={(e) => setVideoForm({ ...videoForm, order_index: parseInt(e.target.value) || 0 })}
                            className="border-border/40 bg-background/50 backdrop-blur"
                          />
                        </div>
                      )}

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                        <Input
                          id="video-thumbnail"
                          value={videoForm.thumbnail_url}
                          onChange={(e) => setVideoForm({ ...videoForm, thumbnail_url: e.target.value })}
                          placeholder="https://example.com/thumbnail.jpg"
                          className="border-border/40 bg-background/50 backdrop-blur"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" variant="hero">
                        {selectedCourse ? "Add to Course" : "Add Learning Video"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddVideo(false);
                          setSelectedCourse("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;