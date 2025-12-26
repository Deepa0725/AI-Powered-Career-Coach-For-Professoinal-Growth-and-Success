import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Clock, ArrowLeft, Filter, PlayCircle, BookOpen, Youtube, CheckCircle2, Brain } from "lucide-react";
import { toast } from "sonner";

const Courses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [learningVideos, setLearningVideos] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const categories = [
    "all",
    "web-development",
    "programming",
    "data-science",
    "mobile-development",
    "algorithms",
    "devops"
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, courses, learningVideos, activeTab, selectedCategory, selectedDifficulty, sortBy]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCourses(),
        loadEnrollments(),
        loadLearningVideos()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const loadEnrollments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          courses (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error: any) {
      console.error("Error loading enrollments:", error);
    }
  };

  const loadLearningVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Add video progress if user is logged in
      if (user) {
        const { data: progress } = await supabase
          .from("user_video_progress")
          .select("video_id, progress")
          .eq("user_id", user.id);

        const videosWithProgress = data?.map(video => ({
          ...video,
          type: "video",
          progress: progress?.find(p => p.video_id === video.id)?.progress || 0
        })) || [];

        setLearningVideos(videosWithProgress);
      } else {
        const videos = data?.map(video => ({
          ...video,
          type: "video",
          progress: 0
        })) || [];
        setLearningVideos(videos);
      }
    } catch (error: any) {
      console.error("Error loading learning videos:", error);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      toast.error("Please sign in to enroll in courses");
      navigate("/auth");
      return;
    }

    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress: 0,
          enrolled_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Successfully enrolled in course!");
      loadEnrollments();
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const markVideoAsWatched = async (videoId: string) => {
    if (!user) {
      toast.error("Please sign in to track progress");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress: 100,
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Video marked as watched!");
      loadLearningVideos();
    } catch (error) {
      console.error("Error updating video progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const filterCourses = () => {
    let allResources = [
      ...courses.map(course => ({ ...course, resourceType: "course" })),
      ...learningVideos.map(video => ({ ...video, resourceType: "video" }))
    ];

    let filtered = allResources;

    // Filter by tab
    if (activeTab === "courses") {
      filtered = filtered.filter(item => item.resourceType === "course");
    } else if (activeTab === "videos") {
      filtered = filtered.filter(item => item.resourceType === "video");
    } else if (activeTab === "trending") {
      filtered = filtered.filter(item => item.is_trending);
    } else if (activeTab === "my-courses") {
      const enrolledCourseIds = enrollments.map(e => e.course_id);
      filtered = filtered.filter(item => 
        item.resourceType === "course" && enrolledCourseIds.includes(item.id)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort resources
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "popular":
          // For videos, use progress count; for courses, use enrollment count
          const aPopularity = a.resourceType === "video" ? (a.progress || 0) : (a.enrollment_count || 0);
          const bPopularity = b.resourceType === "video" ? (b.progress || 0) : (b.enrollment_count || 0);
          return bPopularity - aPopularity;
        case "duration":
          return (b.duration_hours || 0) - (a.duration_hours || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "YouTube":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "Vimeo":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      default:
        return "bg-primary/20 text-primary border-primary/50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "web-development":
        return "bg-blue-500/20 text-blue-400";
      case "programming":
        return "bg-purple-500/20 text-purple-400";
      case "data-science":
        return "bg-orange-500/20 text-orange-400";
      case "mobile-development":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const handleResourceClick = (resource: any) => {
    if (resource.resourceType === "video") {
      if (resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer');
      }
    } else if (resource.resourceType === "course") {
      navigate(`/course/${resource.id}`);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
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
            <span className="text-lg font-bold">FutureLearnX</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Learning Resources</span>
          </h1>
          <p className="text-muted-foreground mb-6 max-w-2xl text-lg">
            Discover courses and video tutorials from our platform. Track your progress and master new skills.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              className="pl-10 border-border/40 bg-background/50 backdrop-blur"
              placeholder="Search courses, videos, or challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 border-border/40 bg-background/50 backdrop-blur">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40 border-border/40 bg-background/50 backdrop-blur">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-border/40 bg-background/50 backdrop-blur">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:max-w-3xl border-border/40 bg-background/50 backdrop-blur">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((resource) => (
                <Card
                  key={`${resource.resourceType}-${resource.id}`}
                  className="p-6 border-border/40 bg-card/30 backdrop-blur hover:border-primary/50 hover:bg-card/60 transition-all duration-300 cursor-pointer group feature-card"
                  onClick={() => handleResourceClick(resource)}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-40 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {resource.thumbnail_url || resource.thumbnail ? (
                      <img 
                        src={resource.thumbnail_url || resource.thumbnail} 
                        alt={resource.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/320x160/3B82F6/FFFFFF?text=Course+Thumbnail';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                        {resource.resourceType === "video" ? (
                          <PlayCircle className="w-12 h-12 text-primary opacity-50" />
                        ) : (
                          <BookOpen className="w-12 h-12 text-accent opacity-50" />
                        )}
                      </div>
                    )}
                    
                    {/* Platform Badge */}
                    {resource.platform && (
                      <div className="absolute top-2 right-2">
                        <Badge className={getPlatformColor(resource.platform)}>
                          {resource.platform}
                        </Badge>
                      </div>
                    )}

                    {/* Type Indicator */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/80">
                        {resource.resourceType === "video" ? (
                          <Youtube className="w-3 h-3 mr-1" />
                        ) : (
                          <BookOpen className="w-3 h-3 mr-1" />
                        )}
                        {resource.resourceType}
                      </Badge>
                    </div>

                    {/* Progress for enrolled courses */}
                    {resource.resourceType === "course" && isEnrolled(resource.id) && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Progress 
                          value={getEnrollmentProgress(resource.id)} 
                          className="h-2 bg-background/80"
                        />
                      </div>
                    )}
                  </div>

                  {/* Resource Info */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge className={getDifficultyColor(resource.difficulty)}>
                      {resource.difficulty}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(resource.category)}>
                      {resource.category}
                    </Badge>
                    {resource.is_trending && (
                      <Badge className="bg-accent/20 text-accent border-accent/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    {resource.duration_hours && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {resource.duration_hours}h
                      </div>
                    )}
                    
                    {resource.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {resource.duration}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {resource.resourceType === "course" ? (
                      isEnrolled(resource.id) ? (
                        <Button 
                          className="flex-1" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${resource.id}`);
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Continue ({getEnrollmentProgress(resource.id)}%)
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1"
                          variant="hero"
                          onClick={(e) => {
                            e.stopPropagation();
                            enrollInCourse(resource.id);
                          }}
                        >
                          Enroll Now
                        </Button>
                      )
                    ) : (
                      <>
                        <Button 
                          className="flex-1"
                          variant="hero"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (resource.url) {
                              window.open(resource.url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Watch
                        </Button>
                        {user && resource.progress < 100 && (
                          <Button 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markVideoAsWatched(resource.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Progress for videos */}
                  {resource.resourceType === "video" && resource.progress > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{resource.progress}%</span>
                      </div>
                      <Progress value={resource.progress} className="h-2" />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <Card className="p-12 text-center border-border/40 bg-card/30 backdrop-blur">
                <div className="text-muted-foreground mb-4">
                  {activeTab === "videos" ? (
                    <Youtube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  ) : activeTab === "courses" ? (
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  ) : activeTab === "my-courses" ? (
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  ) : (
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  )}
                </div>
                <p className="text-lg font-medium mb-2">
                  {activeTab === "my-courses" ? "No enrolled courses" : "No resources found"}
                </p>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "my-courses" 
                    ? "Enroll in courses to see them here"
                    : "Try adjusting your search criteria or explore different categories"
                  }
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedDifficulty("all");
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card className="p-6 border-border/40 bg-card/30 backdrop-blur mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {courses.length + learningVideos.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Resources</p>
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {courses.length}
              </p>
              <p className="text-sm text-muted-foreground">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                {learningVideos.length}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
            <div>
              <p className="text-2xl font-bold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                {enrollments.length}
              </p>
              <p className="text-sm text-muted-foreground">My Enrollments</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Courses;