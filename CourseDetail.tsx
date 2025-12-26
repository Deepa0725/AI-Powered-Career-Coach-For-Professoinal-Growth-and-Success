import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, Play, Clock, CheckCircle, BookOpen, Users, Star, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [userVideoProgress, setUserVideoProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Load videos
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (videosError) throw videosError;
      setVideos(videosData || []);

      // Check enrollment and load progress
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select("*")
          .eq("course_id", id)
          .eq("user_id", session.user.id)
          .single();

        setEnrollment(enrollmentData);

        // Load user video progress
        if (videosData && videosData.length > 0) {
          const { data: progressData } = await supabase
            .from("user_video_progress")
            .select("video_id, progress")
            .eq("user_id", session.user.id)
            .in("video_id", videosData.map(v => v.id));

          setUserVideoProgress(progressData || []);
        }
      }

      // Set first video as active if available
      if (videosData && videosData.length > 0) {
        setActiveVideo(videosData[0]);
      }
    } catch (error: any) {
      console.error("Error loading course:", error);
      toast.error("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to enroll");
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("enrollments").insert({
        course_id: id,
        user_id: session.user.id,
        progress: 0,
        enrolled_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Successfully enrolled in course!");
      await loadCourseData();
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error("Failed to enroll in course");
    }
  };

  const markVideoAsCompleted = async (videoId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to track progress");
        return;
      }

      const { error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: session.user.id,
          video_id: videoId,
          progress: 100,
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update enrollment progress
      const completedVideos = [...userVideoProgress.filter(p => p.progress === 100), { video_id: videoId, progress: 100 }];
      const totalProgress = Math.round((completedVideos.length / videos.length) * 100);

      const { error: updateError } = await supabase
        .from("enrollments")
        .update({ 
          progress: totalProgress,
          ...(totalProgress === 100 ? { completed_at: new Date().toISOString() } : {})
        })
        .eq("course_id", id)
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      toast.success("Video marked as completed!");
      await loadCourseData();
    } catch (error: any) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const getVideoProgress = (videoId: string) => {
    const progress = userVideoProgress.find(p => p.video_id === videoId);
    return progress?.progress || 0;
  };

  const getOverallProgress = () => {
    if (!enrollment) return 0;
    return enrollment.progress || 0;
  };

  const getCompletedVideosCount = () => {
    return userVideoProgress.filter(p => p.progress === 100).length;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => navigate("/courses")}>
            Back to Courses
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Header */}
      <header className="backdrop-blur-lg bg-background/80 border-b border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FutureLearnX" className="w-10 h-10" />
            <span className="text-2xl font-bold text-gradient">FutureLearnX</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/courses")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className={getDifficultyColor(course.difficulty)}>
                {course.difficulty}
              </Badge>
              <Badge variant="outline" className={getCategoryColor(course.category)}>
                {course.category}
              </Badge>
              {course.is_trending && (
                <Badge className="bg-accent/20 text-accent border-accent/50">
                  Trending
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

            <div className="flex items-center gap-6 text-sm flex-wrap">
              <div className="flex items-center text-primary">
                <Clock className="w-4 h-4 mr-2" />
                {course.duration_hours || videos.length} hours
              </div>
              <div className="flex items-center text-muted-foreground">
                <Play className="w-4 h-4 mr-2" />
                {videos.length} videos
              </div>
              {enrollment && (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {getCompletedVideosCount()} of {videos.length} completed
                </div>
              )}
            </div>
          </div>

          <Card className="p-6 card-glow h-fit sticky top-24">
            {enrollment ? (
              <div>
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Enrolled</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="text-primary">{getOverallProgress()}%</span>
                  </div>
                  <Progress value={getOverallProgress()} className="h-2 mb-4" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getCompletedVideosCount()} of {videos.length} videos</span>
                    <span>
                      {videos.length > 0 ? Math.round((getCompletedVideosCount() / videos.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => {
                    // Scroll to first incomplete video or first video
                    const firstIncompleteVideo = videos.find(video => getVideoProgress(video.id) < 100);
                    const videoElement = document.getElementById(`video-${firstIncompleteVideo?.id || videos[0]?.id}`);
                    videoElement?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Continue Learning
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold mb-2">Free</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Enroll now and start learning
                </p>
                <Button variant="hero" className="w-full" onClick={handleEnroll}>
                  Enroll Now
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Course Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Video List */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            
            <div className="space-y-4">
              {videos.map((video, index) => (
                <Card 
                  key={video.id} 
                  id={`video-${video.id}`}
                  className={`p-6 card-glow hover:scale-[1.02] transition-all cursor-pointer ${
                    activeVideo?.id === video.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveVideo(video)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      getVideoProgress(video.id) === 100 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {getVideoProgress(video.id) === 100 ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold">
                          {index + 1}. {video.title}
                        </h3>
                        {getVideoProgress(video.id) === 100 && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-primary">{video.duration_minutes || 10} min</span>
                        {enrollment && getVideoProgress(video.id) < 100 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markVideoAsCompleted(video.id);
                            }}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video Player */}
                  {activeVideo?.id === video.id && video.video_url && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                      {video.embed_code ? (
                        <div 
                          className="w-full aspect-video"
                          dangerouslySetInnerHTML={{ __html: video.embed_code }}
                        />
                      ) : video.video_url.includes('youtube') || video.video_url.includes('youtu.be') ? (
                        <div className="w-full aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(video.video_url)}`}
                            className="w-full h-full"
                            allowFullScreen
                            title={video.title}
                          />
                        </div>
                      ) : (
                        <video
                          controls
                          className="w-full rounded-lg"
                          src={video.video_url}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}
                </Card>
              ))}

              {videos.length === 0 && (
                <Card className="p-8 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No videos available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later for course content
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Course Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 card-glow sticky top-24">
              <h3 className="font-semibold mb-4">Course Progress</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {getOverallProgress()}%
                  </div>
                  <Progress value={getOverallProgress()} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {getCompletedVideosCount()} of {videos.length} videos completed
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Videos Completed</span>
                    <span className="font-medium">{getCompletedVideosCount()}/{videos.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Duration</span>
                    <span className="font-medium">
                      {videos.reduce((total, video) => total + (video.duration_minutes || 10), 0)} min
                    </span>
                  </div>
                  {enrollment && (
                    <div className="flex justify-between text-sm">
                      <span>Enrolled Since</span>
                      <span className="font-medium">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {getOverallProgress() === 100 && (
                  <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">Course Completed!</span>
                    </div>
                    <p className="text-sm text-green-400 mt-1">
                      Congratulations on completing this course!
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract YouTube ID from URL
const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

export default CourseDetail;