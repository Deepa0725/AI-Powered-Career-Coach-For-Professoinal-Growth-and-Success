import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  PlayCircle, 
  Code, 
  Trophy,
  Edit3,
  Save,
  Camera,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Youtube,
  Target,
  Star,
  Zap,
  Flame,
  Download,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  FileText,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Shield,
  Bookmark,
  Heart,
  Share2,
  Settings,
  LogOut,
  StarIcon,
  BookmarkCheck,
  Eye
} from "lucide-react";
import { Certificate } from "crypto";

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [videoProgress, setVideoProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    videosWatched: 0,
    problemsSolved: 0,
    currentStreak: 0,
    totalCourses: 0,
    completedCourses: 0,
    achievements: 0,
    totalHours: 0,
    reviewsWritten: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load all related data in parallel
      await Promise.all([
        loadEnrollments(session.user.id),
        loadVideoProgress(session.user.id),
        loadAchievements(session.user.id),
        loadExperiences(session.user.id),
        loadSkills(session.user.id),
        loadReviews(session.user.id),
        loadBookmarks(session.user.id),
        loadLearningStats(session.user.id)
      ]);

    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async (userId: string) => {
    const { data: enrollmentsData, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          id,
          title,
          category,
          difficulty,
          thumbnail_url,
          duration_hours,
          instructor_name
        )
      `)
      .eq("user_id", userId);
    
    if (!error) setEnrollments(enrollmentsData || []);
  };

  const loadVideoProgress = async (userId: string) => {
    const { data: videoProgressData, error } = await supabase
      .from("user_video_progress")
      .select(`
        *,
        learning_videos (
          title,
          platform,
          duration,
          thumbnail,
          course_category
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    
    if (!error) setVideoProgress(videoProgressData || []);
  };

  const loadAchievements = async (userId: string) => {
    const { data: achievementsData, error } = await supabase
      .from("achievements")
      .select("*")
      .order("points", { ascending: false });

    if (error) {
      setAchievements([]);
      return;
    }

    const { data: userAchievementsData } = await supabase
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", userId);

    const achievementsWithStatus = achievementsData?.map(achievement => ({
      ...achievement,
      earned: userAchievementsData?.some(ua => ua.achievement_id === achievement.id) || false,
      earned_at: userAchievementsData?.find(ua => ua.achievement_id === achievement.id)?.earned_at
    })) || [];

    setAchievements(achievementsWithStatus);
  };


  const loadExperiences = async (userId: string) => {
    const { data: experiencesData, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });
    
    if (!error) setExperiences(experiencesData || []);
  };

  const loadSkills = async (userId: string) => {
    const { data: skillsData, error } = await supabase
      .from("user_skills")
      .select("skill_name")
      .eq("user_id", userId);
    
    if (!error) setSkills(skillsData?.map(s => s.skill_name) || []);
  };

  const loadReviews = async (userId: string) => {
    const { data: reviewsData, error } = await supabase
      .from("course_reviews")
      .select(`
        *,
        courses (
          title,
          thumbnail_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (!error) setReviews(reviewsData || []);
  };

  const loadBookmarks = async (userId: string) => {
    const { data: bookmarksData, error } = await supabase
      .from("user_bookmarks")
      .select(`
        *,
        courses (
          title,
          thumbnail_url,
          category
        ),
        learning_videos (
          title,
          thumbnail
        ),
        daily_challenges (
          title,
          difficulty
        )
      `)
      .eq("user_id", userId)
      .order("bookmarked_at", { ascending: false });
    
    if (!error) setBookmarks(bookmarksData || []);
  };

  const loadLearningStats = async (userId: string) => {
    const { data: statsData, error } = await supabase
      .from("user_learning_stats")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (!error) setLearningStats(statsData);

    // Calculate user stats
    const videosWatched = videoProgress.filter(v => v.progress === 100).length;
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const certificatesCount = certificates.length;
    const reviewsWritten = reviews.length;

    setUserStats(prev => ({
      ...prev,
      videosWatched,
      completedCourses,
      totalCourses: enrollments.length,
      certificates: certificatesCount,
      reviewsWritten,
      currentStreak: statsData?.streak_count || 0,
      totalHours: statsData?.total_learning_hours || 0
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          github_url: profile.github_url,
          linkedin_url: profile.linkedin_url,
          twitter_url: profile.twitter_url,
          career_objective: profile.career_objective,
          skills: profile.skills || [],
          experience_level: profile.experience_level,
          desired_role: profile.desired_role,
          desired_industry: profile.desired_industry,
          salary_expectations: profile.salary_expectations,
          work_preference: profile.work_preference,
          updated_at: new Date().toISOString()
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("experiences")
        .insert([
          {
            user_id: session.user.id,
            title: "New Position",
            company: "Company Name",
            location: "Location",
            start_date: new Date().toISOString(),
            description: "Describe your responsibilities and achievements...",
            current: true
          }
        ]);

      if (error) throw error;

      toast.success("Experience added!");
      loadExperiences(session.user.id);
    } catch (error: any) {
      console.error("Error adding experience:", error);
      toast.error("Failed to add experience");
    }
  };

  const handleAddSkill = async (skill: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("user_skills")
        .insert([
          {
            user_id: session.user.id,
            skill_name: skill
          }
        ]);

      if (error) throw error;

      toast.success("Skill added!");
      setSkills([...skills, skill]);
    } catch (error: any) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skill: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("user_skills")
        .delete()
        .eq("user_id", session.user.id)
        .eq("skill_name", skill);

      if (error) throw error;

      toast.success("Skill removed!");
      setSkills(skills.filter(s => s !== skill));
    } catch (error: any) {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-400 border-green-500/50";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "advanced": return "bg-red-500/20 text-red-400 border-red-500/50";
      default: return "bg-primary/20 text-primary border-primary/50";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "programming": return "bg-blue-500/20 text-blue-400";
      case "web-development": return "bg-purple-500/20 text-purple-400";
      case "data-science": return "bg-orange-500/20 text-orange-400";
      case "mobile-development": return "bg-green-500/20 text-green-400";
      case "algorithms": return "bg-red-500/20 text-red-400";
      default: return "bg-primary/20 text-primary";
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="w-6 h-6" />;
      case 'star': return <Star className="w-6 h-6" />;
      case 'zap': return <Zap className="w-6 h-6" />;
      case 'flame': return <Flame className="w-6 h-6" />;
      case 'target': return <Target className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  const downloadCertificate = (certificate: any) => {
    toast.success(`Downloading certificate for ${certificate.courses?.title}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
          <p className="text-muted-foreground">Profile not found</p>
          <Button className="mt-4" onClick={() => navigate("/dashboard")}>
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
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FutureLearnX</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Profile <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{profile?.full_name}</span>
            </h1>
            <p className="text-muted-foreground">Manage your account and track your learning progress</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full"
                    variant="secondary"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                {editing ? (
                  <div className="space-y-4 text-left">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div>
                      <Label htmlFor="career_objective">Career Objective</Label>
                      <Textarea
                        id="career_objective"
                        value={profile.career_objective || ""}
                        onChange={(e) => setProfile({ ...profile, career_objective: e.target.value })}
                        placeholder="Your career goals..."
                        className="border-border/40 bg-background/50 backdrop-blur"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience_level">Experience Level</Label>
                        <select
                          id="experience_level"
                          value={profile.experience_level || ""}
                          onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                          className="w-full p-2 border border-border/40 rounded-md bg-background/50"
                        >
                          <option value="">Select Level</option>
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="senior">Senior Level</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="work_preference">Work Preference</Label>
                        <select
                          id="work_preference"
                          value={profile.work_preference || ""}
                          onChange={(e) => setProfile({ ...profile, work_preference: e.target.value })}
                          className="w-full p-2 border border-border/40 rounded-md bg-background/50"
                        >
                          <option value="">Select Preference</option>
                          <option value="remote">Remote</option>
                          <option value="onsite">On-site</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">{profile.full_name}</h2>
                    <p className="text-muted-foreground mb-4">{profile.bio || "No bio yet"}</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Badge variant={profile.approval_status === "approved" ? "default" : "secondary"}>
                        <Shield className="w-3 h-3 mr-1" />
                        {profile.approval_status}
                      </Badge>
                      <Badge variant="outline">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {profile.experience_level || "Not specified"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              {/* Contact & Social Links */}
              <div className="space-y-4 mb-6">
                {profile.location && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a href={profile.website} className="text-sm text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 justify-center mb-6">
                {profile.github_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {profile.linkedin_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {profile.twitter_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    variant="hero"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setEditing(true)}
                  variant="hero"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur mt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Learning Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Courses Completed</span>
                  </div>
                  <span className="font-bold">{userStats.completedCourses}/{userStats.totalCourses}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Videos Watched</span>
                  </div>
                  <span className="font-bold">{userStats.videosWatched}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <Code className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Problems Solved</span>
                  </div>
                  <span className="font-bold">{userStats.problemsSolved}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Achievements</span>
                  </div>
                  <span className="font-bold">{userStats.achievements}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Learning Hours</span>
                  </div>
                  <span className="font-bold">{userStats.totalHours}h</span>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6 border-border/40 bg-card/30 backdrop-blur mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Skills
                </h3>
                {editing && (
                  <Button variant="ghost" size="sm" onClick={() => {
                    const newSkill = prompt("Enter a new skill:");
                    if (newSkill) handleAddSkill(newSkill);
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    {editing && (
                      <Trash2 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={() => handleDeleteSkill(skill)}
                      />
                    )}
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6 border-border/40 bg-background/50 backdrop-blur">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Career Objective */}
                {profile.career_objective && (
                  <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      Career Objective
                    </h3>
                    <p className="text-muted-foreground">{profile.career_objective}</p>
                    <div className="flex gap-2 mt-4">
                      {profile.desired_role && (
                        <Badge variant="outline">{profile.desired_role}</Badge>
                      )}
                      {profile.desired_industry && (
                        <Badge variant="outline">{profile.desired_industry}</Badge>
                      )}
                      {profile.work_preference && (
                        <Badge variant="outline">{profile.work_preference}</Badge>
                      )}
                    </div>
                  </Card>
                )}

                {/* Progress Overview */}
                <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">Learning Progress</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-500" />
                      </div>
                      <h4 className="font-semibold text-sm">Course Progress</h4>
                      <p className="text-2xl font-bold text-blue-500">
                        {enrollments.length > 0 
                          ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
                          : 0
                        }%
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                        <PlayCircle className="w-6 h-6 text-green-500" />
                      </div>
                      <h4 className="font-semibold text-sm">Video Completion</h4>
                      <p className="text-2xl font-bold text-green-500">
                        {videoProgress.length > 0
                          ? Math.round(videoProgress.filter(v => v.progress === 100).length / videoProgress.length * 100)
                          : 0
                        }%
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-500" />
                      </div>
                      <h4 className="font-semibold text-sm">Current Streak</h4>
                      <p className="text-2xl font-bold text-purple-500">{userStats.currentStreak} days</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/50">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <StarIcon className="w-6 h-6 text-orange-500" />
                      </div>
                      <h4 className="font-semibold text-sm">Reviews Written</h4>
                      <p className="text-2xl font-bold text-orange-500">{userStats.reviewsWritten}</p>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6 border-border/40 bg-card/30 backdrop-blur">
                  <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[...enrollments.slice(0, 3), ...videoProgress.slice(0, 3)]
                      .sort((a, b) => new Date(b.updated_at || b.enrolled_at).getTime() - new Date(a.updated_at || a.enrolled_at).getTime())
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                          {item.courses ? (
                            <>
                              <BookOpen className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Enrolled in {item.courses.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.enrolled_at).toLocaleDateString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-5 h-5 text-red-500" />
                              <div>
                                <p className="font-medium">Watched {item.learning_videos?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.progress}% completed • {new Date(item.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    }
                    {enrollments.length === 0 && videoProgress.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity. Start learning to see your progress here!
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* My Courses Tab */}
              <TabsContent value="courses" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Enrolled Courses
                  </h3>
                  <Badge variant="secondary">
                    {enrollments.length} courses
                  </Badge>
                </div>
                
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="p-4 border-border/40 bg-card/30 backdrop-blur">
                        <div className="flex items-start gap-4">
                          <img 
                            src={enrollment.courses?.thumbnail_url} 
                            alt={enrollment.courses?.title}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/64/3B82F6/FFFFFF?text=Course';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{enrollment.courses?.title}</h4>
                              <Badge className={
                                enrollment.progress === 100 
                                  ? "bg-green-500/20 text-green-400 border-green-500/50"
                                  : "bg-primary/20 text-primary border-primary/50"
                              }>
                                {enrollment.progress === 100 ? "Completed" : `${enrollment.progress}%`}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={getCategoryColor(enrollment.courses?.category)}>
                                {enrollment.courses?.category}
                              </Badge>
                              <Badge className={getDifficultyColor(enrollment.courses?.difficulty)}>
                                {enrollment.courses?.difficulty}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                by {enrollment.courses?.instructor_name}
                              </span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2 mb-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                              {enrollment.completed_at && (
                                <span>Completed on {new Date(enrollment.completed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No courses enrolled yet</p>
                    <Button className="mt-4" onClick={() => navigate("/dashboard")} variant="hero">
                      Browse Courses
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </h3>
                  <Badge variant="secondary">
                    {userStats.achievements} / {achievements.length} Unlocked
                  </Badge>
                </div>
                
                {achievements.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <Card 
                        key={achievement.id} 
                        className={`p-4 border-border/40 backdrop-blur transition-all duration-300 ${
                          achievement.earned 
                            ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                            : 'bg-card/30 border-border/40 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            achievement.earned 
                              ? 'bg-yellow-500/20 text-yellow-500' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {getAchievementIcon(achievement.icon)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold mb-1">{achievement.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {achievement.points} pts
                              </Badge>
                              {achievement.earned && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-xs">
                                  Earned {new Date(achievement.earned_at).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
                    <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No achievements available</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete courses and watch videos to earn achievements
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/dashboard")} variant="hero">
                      Start Learning
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-purple-500" />
                    Work Experience
                  </h3>
                  <Button onClick={handleAddExperience} variant="hero" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                
                {experiences.length > 0 ? (
                  <div className="space-y-4">
                    {experiences.map((experience) => (
                      <Card key={experience.id} className="p-6 border-border/40 bg-card/30 backdrop-blur">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{experience.title}</h4>
                            <p className="text-primary font-medium">{experience.company}</p>
                            <p className="text-muted-foreground text-sm">{experience.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {new Date(experience.start_date).toLocaleDateString()} - {' '}
                              {experience.current ? 'Present' : new Date(experience.end_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {experience.current ? 'Current Position' : 'Previous Position'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{experience.description}</p>
                        <div className="flex gap-2">
                          {editing && (
                            <Button variant="outline" size="sm">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {editing && (
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No work experience added yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add your professional experience to showcase your background
                    </p>
                    <Button className="mt-4" onClick={handleAddExperience} variant="hero">
                      Add Experience
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    My Reviews
                  </h3>
                  <Badge variant="secondary">
                    {reviews.length} reviews
                  </Badge>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-6 border-border/40 bg-card/30 backdrop-blur">
                        <div className="flex items-start gap-4">
                          <img 
                            src={review.courses?.thumbnail_url} 
                            alt={review.courses?.title}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48/3B82F6/FFFFFF?text=Course';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{review.courses?.title}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarIcon
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-2">{review.review_text}</p>
                            <p className="text-xs text-muted-foreground">
                              Reviewed on {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border/40 bg-card/30 backdrop-blur">
                    <StarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No reviews written yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share your thoughts by reviewing courses you've completed
                    </p>
                    <Button className="mt-4" onClick={() => navigate("/dashboard")} variant="hero">
                      Browse Courses
                    </Button>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;