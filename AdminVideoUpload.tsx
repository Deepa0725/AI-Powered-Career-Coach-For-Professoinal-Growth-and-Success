import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Youtube, 
  PlayCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Users,
  Brain,
  LogOut,
  User,
  BarChart3,
  Sparkles,
  BookOpen,
  Code2,
  Trophy,
  Target,
  Video,
  FileVideo,
  ListVideo
} from "lucide-react";

const AdminVideoUpload = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    videosWatched: 0,
    problemsSolved: 0,
    currentStreak: 0,
    weeklyGoal: 0,
    totalCourses: 0,
    completedCourses: 0,
    achievements: 0
  });
  const [learningVideos, setLearningVideos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "YouTube",
    duration: "",
    thumbnail: "",
    url: "",
  });
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadVideos();
      loadUserData();
    }
  }, [isAdmin]);

  const checkUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some(role => role.role === 'admin');
      setIsAdmin(hasAdminRole);

      if (!hasAdminRole) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Failed to verify admin access");
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      await loadUserStats();
      await loadLearningVideos();
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data: videoProgress, error: videoError } = await supabase
        .from("user_video_progress")
        .select("progress")
        .eq("user_id", user.id)
        .eq("progress", 100);

      if (videoError) throw videoError;

      const { data: enrollmentsData, error: enrollError } = await supabase
        .from("enrollments")
        .select("progress, completed_at")
        .eq("user_id", user.id);

      if (enrollError) throw enrollError;

      const { data: solvedChallenges, error: challengeError } = await supabase
        .from("user_challenge_solutions")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_correct", true);

      const { data: userAchievementsData, error: achievementError } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id);

      const videosWatched = videoProgress?.length || 0;
      const totalEnrollments = enrollmentsData?.length || 0;
      const completedCourses = enrollmentsData?.filter(e => e.progress === 100).length || 0;
      const problemsSolved = solvedChallenges?.length || 0;
      const achievementsCount = userAchievementsData?.length || 0;

      setUserStats({
        videosWatched,
        problemsSolved,
        currentStreak: 0,
        weeklyGoal: Math.min(100, Math.round((videosWatched + completedCourses + problemsSolved) / 15 * 100)),
        totalCourses: totalEnrollments,
        completedCourses,
        achievements: achievementsCount
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const loadLearningVideos = async () => {
    try {
      const { data: videos, error } = await supabase
        .from("learning_videos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      const { data: progress, error: progressError } = await supabase
        .from("user_video_progress")
        .select("video_id, progress")
        .eq("user_id", user.id)
        .in("video_id", videos?.map(v => v.id) || []);

      const videosWithProgress = videos?.map(video => {
        const userProgress = progress?.find(p => p.video_id === video.id);
        return {
          ...video,
          progress: userProgress?.progress || 0
        };
      }) || [];

      setLearningVideos(videosWithProgress);
    } catch (error: any) {
      console.error("Error loading videos:", error);
    }
  };

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("learning_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast.error("Failed to load videos");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url) {
      toast.error("Title and URL are required");
      return;
    }

    try {
      console.log("📤 Submitting video:", formData);

      if (editingVideo) {
        const { data, error } = await supabase
          .from("learning_videos")
          .update({
            title: formData.title,
            description: formData.description,
            platform: formData.platform,
            duration: formData.duration,
            thumbnail: formData.thumbnail,
            url: formData.url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingVideo.id)
          .select();

        console.log("🔄 Update response:", { data, error });

        if (error) throw error;
        toast.success("Video updated successfully!");
      } else {
        const { data, error } = await supabase
          .from("learning_videos")
          .insert([{
            title: formData.title,
            description: formData.description,
            platform: formData.platform,
            duration: formData.duration,
            thumbnail: formData.thumbnail,
            url: formData.url,
          }])
          .select();

        console.log("➕ Insert response:", { data, error });

        if (error) throw error;
        toast.success("Video uploaded successfully!");
      }

      setFormData({
        title: "",
        description: "",
        platform: "YouTube",
        duration: "",
        thumbnail: "",
        url: "",
      });
      setEditingVideo(null);
      loadVideos();
    } catch (error: any) {
      console.error("❌ Error saving video:", error);
      toast.error(`Failed to save video: ${error.message}`);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      platform: video.platform,
      duration: video.duration || "",
      thumbnail: video.thumbnail || "",
      url: video.url,
    });
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const { error } = await supabase
        .from("learning_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      toast.success("Video deleted successfully!");
      loadVideos();
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      platform: "YouTube",
      duration: "",
      thumbnail: "",
      url: "",
    });
  };

  const markVideoAsWatched = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("user_video_progress")
        .upsert({
          user_id: user.id,
          video_id: videoId,
          video_type: 'learning_video',
          progress: 100,
          watched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Video marked as watched!");
      loadUserData();
    } catch (error) {
      console.error("Error updating video progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 border-border/40 bg-card/30 backdrop-blur max-w-md text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Admin privileges required to access this page.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate("/admin")}>
              Admin Dashboard
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Video Management <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Admin Panel</span>
              </h1>
              <p className="text-muted-foreground">Upload and manage learning videos for the platform</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Video Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Form */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Youtube className="w-6 h-6 text-red-500" />
                {editingVideo ? "Edit Video" : "Upload New Video"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="video-title">Title *</Label>
                  <Input
                    id="video-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter video title"
                    required
                    className="border-border/40 bg-background/50 backdrop-blur"
                  />
                </div>

                <div>
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter video description"
                    rows={3}
                    className="border-border/40 bg-background/50 backdrop-blur"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video-platform">Platform</Label>
                    <Select 
                      value={formData.platform} 
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YouTube">YouTube</SelectItem>
                        <SelectItem value="Vimeo">Vimeo</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="video-duration">Duration</Label>
                    <Input
                      id="video-duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="e.g., 25:30"
                      className="border-border/40 bg-background/50 backdrop-blur"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                  <Input
                    id="video-thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) =>
                      setFormData({ ...formData, thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                    className="border-border/40 bg-background/50 backdrop-blur"
                  />
                </div>

                <div>
                  <Label htmlFor="video-url">Video URL *</Label>
                  <Input
                    id="video-url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="border-border/40 bg-background/50 backdrop-blur"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingVideo ? "Update Video" : "Upload Video"}
                  </Button>
                  {editingVideo && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Video List */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ListVideo className="w-6 h-6 text-primary" />
                Manage Videos ({videos.length})
              </h2>

              <div className="space-y-4">
                {videos.map((video) => (
                  <Card key={video.id} className="p-4 border-border/40 bg-card/30 backdrop-blur">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{video.platform}</Badge>
                          <span>{video.duration}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(video)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(video.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {videos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Youtube className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No videos uploaded yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Stats and Recent Videos */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Platform Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Videos</span>
                  <Badge variant="secondary">{videos.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Your Videos Watched</span>
                  <Badge variant="secondary">{userStats.videosWatched}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weekly Goal</span>
                  <Badge variant="secondary">{userStats.weeklyGoal}%</Badge>
                </div>
                <Progress value={userStats.weeklyGoal} className="h-2" />
              </div>
            </Card>

            {/* Recent Videos Preview */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Recent Videos
              </h3>
              <div className="space-y-4">
                {learningVideos.slice(0, 3).map((video) => (
                  <div key={video.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{video.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={video.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{video.progress}%</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openExternalLink(video.url)}
                      >
                        <PlayCircle className="w-4 h-4" />
                      </Button>
                      {video.progress < 100 && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => markVideoAsWatched(video.id)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {learningVideos.length === 0 && (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No videos watched yet
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard")}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/admin")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard?tab=manage")}
                >
                  <Code2 className="w-4 h-4 mr-2" />
                  Course Management
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideoUpload;