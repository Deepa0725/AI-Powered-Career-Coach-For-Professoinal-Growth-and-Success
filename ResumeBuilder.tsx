import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Download, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Languages,
  Mail,
  Phone,
  MapPin,
  Link,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from "lucide-react";
import logo from "@/assets/logo.png";
import html2pdf from "html2pdf.js";

// ATS Score Checker Types
interface ATSScore {
  overallScore: number;
  categoryScores: {
    contactInfo: number;
    workExperience: number;
    education: number;
    skills: number;
    keywords: number;
    formatting: number;
    completeness: number;
  };
  suggestions: string[];
  missingKeywords: string[];
  strengths: string[];
}

interface ATSAnalysis {
  score: number;
  grade: string;
  feedback: string;
  details: ATSScore;
}

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [resume, setResume] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      portfolio: "",
      linkedin: "",
      github: "",
      currentRole: ""
    },
    summary: "",
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
    projects: [] as any[],
    certifications: [] as any[],
    achievements: [] as any[],
    languages: [] as any[]
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const resumeRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [atsScore, setAtsScore] = useState<ATSAnalysis | null>(null);
  const [isCheckingATS, setIsCheckingATS] = useState(false);

  // Common ATS keywords for different roles
  const commonATSKeywords = [
    // Technical Skills
    "javascript", "python", "java", "c++", "react", "node.js", "html", "css",
    "sql", "mongodb", "aws", "docker", "kubernetes", "git", "rest", "api",
    "machine learning", "data analysis", "cloud computing", "devops",
    
    // Soft Skills
    "leadership", "communication", "teamwork", "problem solving", "project management",
    "agile", "scrum", "collaboration", "analytical", "strategic planning",
    
    // Action Verbs
    "developed", "managed", "implemented", "created", "improved", "optimized",
    "led", "analyzed", "designed", "built", "maintained", "coordinated"
  ];

  // Industry-specific keywords based on current role
  const getIndustryKeywords = (role: string) => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes("software") || roleLower.includes("developer")) {
      return [
        "software development", "full stack", "frontend", "backend", "web development",
        "mobile development", "testing", "debugging", "code review", "version control"
      ];
    }
    
    if (roleLower.includes("data") || roleLower.includes("analyst")) {
      return [
        "data visualization", "sql", "excel", "tableau", "power bi", "statistical analysis",
        "data mining", "etl", "big data", "python", "r", "machine learning"
      ];
    }
    
    if (roleLower.includes("manager") || roleLower.includes("lead")) {
      return [
        "team leadership", "project management", "budget management", "strategic planning",
        "stakeholder management", "performance metrics", "process improvement", "mentoring"
      ];
    }
    
    return [];
  };

  // Real ATS Score Checker Function
  const checkATSScore = async (): Promise<ATSAnalysis> => {
    setIsCheckingATS(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scores = {
      contactInfo: 0,
      workExperience: 0,
      education: 0,
      skills: 0,
      keywords: 0,
      formatting: 0,
      completeness: 0
    };

    const suggestions: string[] = [];
    const missingKeywords: string[] = [];
    const strengths: string[] = [];

    // 1. Contact Information Check (20 points)
    if (resume.personalInfo.fullName) scores.contactInfo += 5;
    if (resume.personalInfo.email) scores.contactInfo += 5;
    if (resume.personalInfo.phone) scores.contactInfo += 5;
    if (resume.personalInfo.location) scores.contactInfo += 5;

    if (scores.contactInfo < 20) {
      suggestions.push("Add complete contact information including phone number and location");
    } else {
      strengths.push("Complete contact information provided");
    }

    // 2. Work Experience Check (20 points)
    if (resume.experience.length > 0) {
      scores.workExperience += 10;
      strengths.push("Work experience included");
      
      const hasRecentExperience = resume.experience.some(exp => {
        if (!exp.startDate) return false;
        const startYear = new Date(exp.startDate).getFullYear();
        return startYear >= new Date().getFullYear() - 5;
      });
      
      if (hasRecentExperience) {
        scores.workExperience += 5;
        strengths.push("Recent work experience included");
      } else {
        suggestions.push("Include more recent work experience (last 5 years)");
      }

      const hasDescriptions = resume.experience.some(exp => exp.description && exp.description.length > 50);
      if (hasDescriptions) {
        scores.workExperience += 5;
        strengths.push("Detailed job descriptions provided");
      } else {
        suggestions.push("Add more detailed descriptions to work experience with quantifiable achievements");
      }
    } else {
      suggestions.push("Add work experience section");
    }

    // 3. Education Check (15 points)
    if (resume.education.length > 0) {
      scores.education += 10;
      strengths.push("Education history included");
      
      const hasDegree = resume.education.some(edu => edu.degree);
      if (hasDegree) scores.education += 5;
    } else {
      suggestions.push("Add education section");
    }

    // 4. Skills Check (15 points)
    if (resume.skills.length >= 5) {
      scores.skills += 15;
      strengths.push("Good variety of skills listed");
    } else if (resume.skills.length > 0) {
      scores.skills += 8;
      suggestions.push("Add more relevant skills (aim for 8-12)");
    } else {
      suggestions.push("Add skills section with relevant technical and soft skills");
    }

    // 5. Keywords Check (20 points)
    const allContent = [
      resume.personalInfo.currentRole,
      resume.summary,
      ...resume.experience.map(exp => `${exp.position} ${exp.company} ${exp.description}`),
      ...resume.education.map(edu => `${edu.degree} ${edu.institution}`),
      ...resume.skills,
      ...resume.projects.map(proj => `${proj.name} ${proj.description} ${proj.technologies}`)
    ].join(" ").toLowerCase();

    const industryKeywords = getIndustryKeywords(resume.personalInfo.currentRole);
    const allRelevantKeywords = [...commonATSKeywords, ...industryKeywords];
    
    let keywordMatches = 0;
    const foundKeywords: string[] = [];
    
    allRelevantKeywords.forEach(keyword => {
      if (allContent.includes(keyword.toLowerCase())) {
        keywordMatches++;
        foundKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });

    const keywordPercentage = (keywordMatches / allRelevantKeywords.length) * 20;
    scores.keywords = Math.min(keywordPercentage, 20);

    if (scores.keywords >= 15) {
      strengths.push("Good keyword optimization for ATS systems");
    } else {
      suggestions.push(`Add more relevant keywords. Found ${foundKeywords.length} out of ${allRelevantKeywords.length} important keywords`);
    }

    // 6. Formatting Check (5 points)
    scores.formatting += 3; // Basic structure points
    if (resume.summary && resume.summary.length > 100) scores.formatting += 2;
    strengths.push("Clean, organized resume structure");

    // 7. Completeness Check (5 points)
    const totalSections = 7; // personal, summary, experience, education, skills, projects, other
    let completedSections = 0;
    
    if (resume.personalInfo.fullName && resume.personalInfo.email) completedSections++;
    if (resume.summary) completedSections++;
    if (resume.experience.length > 0) completedSections++;
    if (resume.education.length > 0) completedSections++;
    if (resume.skills.length > 0) completedSections++;
    if (resume.projects.length > 0) completedSections++;
    if (resume.certifications.length > 0 || resume.achievements.length > 0 || resume.languages.length > 0) completedSections++;
    
    scores.completeness = (completedSections / totalSections) * 5;

    // Calculate overall score
    const overallScore = Math.round(
      Object.values(scores).reduce((sum, score) => sum + score, 0)
    );

    // Determine grade
    let grade = "F";
    let feedback = "Your resume needs significant improvement to pass ATS systems.";
    
    if (overallScore >= 90) {
      grade = "A+";
      feedback = "Excellent! Your resume is well-optimized for ATS systems.";
    } else if (overallScore >= 80) {
      grade = "A";
      feedback = "Very good! Your resume should perform well in ATS systems.";
    } else if (overallScore >= 70) {
      grade = "B";
      feedback = "Good, but there's room for improvement to maximize ATS compatibility.";
    } else if (overallScore >= 60) {
      grade = "C";
      feedback = "Fair. Consider implementing the suggestions to improve ATS performance.";
    } else if (overallScore >= 50) {
      grade = "D";
      feedback = "Needs significant improvement to be ATS-friendly.";
    }

    // Remove duplicate suggestions
    const uniqueSuggestions = [...new Set(suggestions)];
    const uniqueMissingKeywords = [...new Set(missingKeywords)].slice(0, 10); // Show top 10 missing keywords
    const uniqueStrengths = [...new Set(strengths)];

    return {
      score: overallScore,
      grade,
      feedback,
      details: {
        overallScore,
        categoryScores: scores,
        suggestions: uniqueSuggestions,
        missingKeywords: uniqueMissingKeywords,
        strengths: uniqueStrengths
      }
    };
  };

  // Calculate progress like in HTML version
  const calculateProgress = () => {
    const totalFields = 8;
    let completedFields = 0;

    if (resume.personalInfo.fullName) completedFields++;
    if (resume.personalInfo.email) completedFields++;
    if (resume.skills.length > 0) completedFields++;
    if (resume.experience.length > 0) completedFields++;
    if (resume.education.length > 0) completedFields++;
    if (resume.projects.length > 0) completedFields++;
    if (resume.summary) completedFields++;

    return Math.min(Math.round((completedFields / totalFields) * 100), 100);
  };

  // Navigation between tabs
  const nextTab = () => {
    const tabs = ["personal", "skills", "experience", "education", "projects", "other"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const tabs = ["personal", "skills", "experience", "education", "projects", "other"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Add new experience entry
  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          location: "",
          description: ""
        }
      ]
    }));
  };

  // Update experience entry
  const updateExperience = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Remove experience entry
  const removeExperience = (id: number) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Add new education entry
  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          location: "",
          gpa: "",
          percentage: ""
        }
      ]
    }));
  };

  // Update education entry
  const updateEducation = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Remove education entry
  const removeEducation = (id: number) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Add skill
  const addSkill = () => {
    if (currentSkill.trim() && !resume.skills.includes(currentSkill.trim())) {
      setResume(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setResume(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Add project
  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: Date.now(),
          name: "",
          description: "",
          technologies: "",
          link: "",
          date: ""
        }
      ]
    }));
  };

  // Update project
  const updateProject = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  // Remove project
  const removeProject = (id: number) => {
    setResume(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  // Add certification
  const addCertification = () => {
    setResume(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          id: Date.now(),
          name: "",
          issuer: "",
          date: "",
          credential: ""
        }
      ]
    }));
  };

  // Update certification
  const updateCertification = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Remove certification
  const removeCertification = (id: number) => {
    setResume(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  // Add achievement
  const addAchievement = () => {
    setResume(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          id: Date.now(),
          title: "",
          date: "",
          description: ""
        }
      ]
    }));
  };

  // Update achievement
  const updateAchievement = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => 
        ach.id === id ? { ...ach, [field]: value } : ach
      )
    }));
  };

  // Remove achievement
  const removeAchievement = (id: number) => {
    setResume(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  };

  // Add language
  const addLanguage = () => {
    setResume(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          id: Date.now(),
          language: "",
          proficiency: ""
        }
      ]
    }));
  };

  // Update language
  const updateLanguage = (id: number, field: string, value: any) => {
    setResume(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  // Remove language
  const removeLanguage = (id: number) => {
    setResume(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  // Handle ATS Score Check
  const handleATSCheck = async () => {
    try {
      const analysis = await checkATSScore();
      setAtsScore(analysis);
      toast.success("ATS analysis completed!");
    } catch (error) {
      console.error("Error checking ATS score:", error);
      toast.error("Failed to analyze ATS score");
    } finally {
      setIsCheckingATS(false);
    }
  };

  // Download resume as PDF using html2pdf.js
  const downloadResume = async () => {
    if (!resumeRef.current) {
      toast.error("Resume content not found");
      return;
    }

    try {
      setIsGeneratingPDF(true);
      toast.info("Generating PDF...");

      const element = resumeRef.current;
      const opt = {
        margin: 10,
        filename: `${resume.personalInfo.fullName || 'resume'}_resume.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();
      
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download resume. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Save resume to database
  const saveResume = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to save your resume");
        return;
      }

      const { error } = await supabase
        .from("resumes")
        .upsert({
          user_id: session.user.id,
          resume_data: resume,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Resume saved successfully!");
    } catch (error: any) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  };

  const progress = calculateProgress();

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
        <header className="backdrop-blur-lg bg-background/80 border-b border-primary/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="FutureLearnX" className="w-10 h-10" />
              <span className="text-2xl font-bold text-gradient">FutureLearnX</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Resume
              </Button>
              <Button onClick={downloadResume} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div 
              ref={resumeRef}
              className="bg-white text-gray-800 p-8 rounded-lg shadow-lg space-y-6 max-w-4xl mx-auto resume-content"
              style={{ 
                fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                lineHeight: '1.6'
              }}
            >
              {/* Personal Info */}
              <div className="text-center border-b pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {resume.personalInfo.fullName || "Your Name"}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {resume.personalInfo.currentRole || "Professional Title"}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  {resume.personalInfo.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {resume.personalInfo.email}
                    </div>
                  )}
                  {resume.personalInfo.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {resume.personalInfo.phone}
                    </div>
                  )}
                  {resume.personalInfo.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {resume.personalInfo.location}
                    </div>
                  )}
                  {resume.personalInfo.linkedin && (
                    <div className="flex items-center">
                      <Link className="w-4 h-4 mr-2" />
                      LinkedIn
                    </div>
                  )}
                  {resume.personalInfo.github && (
                    <div className="flex items-center">
                      <Code className="w-4 h-4 mr-2" />
                      GitHub
                    </div>
                  )}
                  {resume.personalInfo.portfolio && (
                    <div className="flex items-center">
                      <Link className="w-4 h-4 mr-2" />
                      Portfolio
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    PROFESSIONAL SUMMARY
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resume.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    WORK EXPERIENCE
                  </h2>
                  {resume.experience.map((exp, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{exp.position}</h3>
                          <p className="text-gray-600 font-medium">{exp.company}</p>
                        </div>
                        <span className="text-gray-600 whitespace-nowrap">
                          {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                        </span>
                      </div>
                      {exp.location && <p className="text-gray-600 text-sm mb-2">{exp.location}</p>}
                      {exp.description && (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resume.education.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    EDUCATION
                  </h2>
                  {resume.education.map((edu, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{edu.degree}</h3>
                          <p className="text-gray-600 font-medium">{edu.institution}</p>
                        </div>
                        <span className="text-gray-600">{edu.startDate} - {edu.endDate}</span>
                      </div>
                      {edu.location && <p className="text-gray-600 text-sm mb-2">{edu.location}</p>}
                      {(edu.gpa || edu.percentage) && (
                        <p className="text-gray-700">
                          {edu.gpa && `GPA: ${edu.gpa}`}
                          {edu.gpa && edu.percentage && ' | '}
                          {edu.percentage && `Percentage: ${edu.percentage}%`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resume.skills.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    SKILLS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    PROJECTS
                  </h2>
                  {resume.projects.map((proj, index) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{proj.name}</h3>
                        {proj.date && <span className="text-gray-600">{proj.date}</span>}
                      </div>
                      {proj.description && (
                        <p className="text-gray-700 mb-2">{proj.description}</p>
                      )}
                      {proj.technologies && (
                        <p className="text-gray-600 text-sm">
                          <strong>Technologies:</strong> {proj.technologies}
                        </p>
                      )}
                      {proj.link && (
                        <p className="text-blue-600 text-sm">
                          <strong>Link:</strong> {proj.link}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resume.certifications.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    CERTIFICATIONS
                  </h2>
                  {resume.certifications.map((cert, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-bold text-gray-800">{cert.name}</h3>
                      <p className="text-gray-600">{cert.issuer}</p>
                      {cert.date && <p className="text-gray-600 text-sm">Issued: {cert.date}</p>}
                      {cert.credential && <p className="text-blue-600 text-sm">Credential ID: {cert.credential}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {resume.achievements.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    ACHIEVEMENTS
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {resume.achievements.map((ach, index) => (
                      <li key={index}>
                        <strong>{ach.title}</strong>
                        {ach.date && ` (${ach.date})`}
                        {ach.description && ` - ${ach.description}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {resume.languages.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold border-b-2 border-gray-300 pb-2 mb-4 text-gray-800">
                    LANGUAGES
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {resume.languages.map((lang, index) => (
                      <div key={index} className="text-gray-700">
                        <strong>{lang.language}</strong>: {lang.proficiency}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
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
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-600">{progress}% Complete</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Resume Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 card-glow">
              <h1 className="text-3xl font-bold mb-2">AI Resume Maker</h1>
              <p className="text-muted-foreground mb-6">
                Create professional resumes with AI enhancements
              </p>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 w-full overflow-x-auto">
                  <TabsTrigger value="personal" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">
                    <Code className="w-3 h-3 mr-1" />
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    Experience
                  </TabsTrigger>
                  <TabsTrigger value="education" className="text-xs">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Education
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="other" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Other
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name*</Label>
                        <Input
                          id="fullName"
                          value={resume.personalInfo.fullName}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email*</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resume.personalInfo.email}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={resume.personalInfo.phone}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Address</Label>
                        <Input
                          id="location"
                          value={resume.personalInfo.location}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                          id="linkedin"
                          value={resume.personalInfo.linkedin}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                          }))}
                          placeholder="https://linkedin.com/in/yourname"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                          id="github"
                          value={resume.personalInfo.github}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, github: e.target.value }
                          }))}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio Website</Label>
                        <Input
                          id="portfolio"
                          value={resume.personalInfo.portfolio}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, portfolio: e.target.value }
                          }))}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentRole">Current Role/Title</Label>
                        <Input
                          id="currentRole"
                          value={resume.personalInfo.currentRole}
                          onChange={(e) => setResume(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, currentRole: e.target.value }
                          }))}
                          placeholder="e.g., Software Engineer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Career Objective
                    </h3>
                    <div>
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={resume.summary}
                        onChange={(e) => setResume(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Briefly describe your professional goals and qualifications"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" disabled className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextTab} className="flex-1">
                      Next: Skills
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Code className="w-5 h-5 mr-2 text-blue-600" />
                      Skills
                    </h3>
                    <div>
                      <Label htmlFor="skillsInput">Enter your skills (comma separated)</Label>
                      <Textarea
                        id="skillsInput"
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="e.g., Python, Machine Learning, React, SQL, Data Analysis"
                        rows={3}
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {resume.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevTab} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextTab} className="flex-1">
                      Next: Experience
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                        Work Experience
                      </h3>
                      <Button onClick={addExperience} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>

                    {resume.experience.map((exp) => (
                      <Card key={exp.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Position*</Label>
                              <Input
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                placeholder="Software Engineer"
                                required
                              />
                            </div>
                            <div>
                              <Label>Company*</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                placeholder="Google"
                                required
                              />
                            </div>
                            <div>
                              <Label>Start Date*</Label>
                              <Input
                                type="month"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label>End Date (or Present)</Label>
                              <Input
                                type="month"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                              />
                              <div className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  id={`current-${exp.id}`}
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="mr-2"
                                />
                                <Label htmlFor={`current-${exp.id}`} className="text-sm">
                                  I currently work here
                                </Label>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <Label>Location</Label>
                              <Input
                                value={exp.location}
                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                placeholder="San Francisco, CA"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Responsibilities (one per line)</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                placeholder="• Developed new features...
• Optimized application performance..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Experience
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {resume.experience.length === 0 && (
                      <Card className="p-8 text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No experience added yet</p>
                        <Button className="mt-4" onClick={addExperience}>
                          Add Your First Experience
                        </Button>
                      </Card>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevTab} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextTab} className="flex-1">
                      Next: Education
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                        Education
                      </h3>
                      <Button onClick={addEducation} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>

                    {resume.education.map((edu) => (
                      <Card key={edu.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Degree*</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                placeholder="Bachelor of Science"
                                required
                              />
                            </div>
                            <div>
                              <Label>Institution*</Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                placeholder="University of California"
                                required
                              />
                            </div>
                            <div>
                              <Label>Year*</Label>
                              <Input
                                value={`${edu.startDate} - ${edu.endDate}`}
                                onChange={(e) => {
                                  const [start, end] = e.target.value.split(' - ');
                                  updateEducation(edu.id, 'startDate', start);
                                  updateEducation(edu.id, 'endDate', end);
                                }}
                                placeholder="e.g., 2018 - 2022"
                                required
                              />
                            </div>
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={edu.location}
                                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                placeholder="Berkeley, CA"
                              />
                            </div>
                            <div>
                              <Label>GPA</Label>
                              <Input
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                placeholder="3.8"
                              />
                            </div>
                            <div>
                              <Label>Percentage</Label>
                              <Input
                                value={edu.percentage}
                                onChange={(e) => updateEducation(edu.id, 'percentage', e.target.value)}
                                placeholder="85%"
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeEducation(edu.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Education
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {resume.education.length === 0 && (
                      <Card className="p-8 text-center">
                        <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No education added yet</p>
                        <Button className="mt-4" onClick={addEducation}>
                          Add Your First Education
                        </Button>
                      </Card>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevTab} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextTab} className="flex-1">
                      Next: Projects
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Award className="w-5 h-5 mr-2 text-blue-600" />
                        Projects
                      </h3>
                      <Button onClick={addProject} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </Button>
                    </div>

                    {resume.projects.map((proj) => (
                      <Card key={proj.id} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Project Title*</Label>
                            <Input
                              value={proj.name}
                              onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                              placeholder="E-commerce Website"
                              required
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Date (optional)</Label>
                              <Input
                                value={proj.date}
                                onChange={(e) => updateProject(proj.id, 'date', e.target.value)}
                                placeholder="Jan 2023 - Mar 2023"
                              />
                            </div>
                            <div>
                              <Label>Project Link (optional)</Label>
                              <Input
                                value={proj.link}
                                onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                placeholder="https://github.com/username/project"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description*</Label>
                            <Textarea
                              value={proj.description}
                              onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                              placeholder="Describe the project, your role, and the technologies used..."
                              rows={4}
                              required
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeProject(proj.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Project
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {resume.projects.length === 0 && (
                      <Card className="p-8 text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No projects added yet</p>
                        <Button className="mt-4" onClick={addProject}>
                          Add Your First Project
                        </Button>
                      </Card>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevTab} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={nextTab} className="flex-1">
                      Next: Other
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                {/* Other Tab */}
                <TabsContent value="other" className="space-y-6">
                  {/* Certifications */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Certifications
                      </h3>
                      <Button onClick={addCertification} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Certification
                      </Button>
                    </div>

                    {resume.certifications.map((cert) => (
                      <Card key={cert.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Certification Name*</Label>
                              <Input
                                value={cert.name}
                                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                placeholder="AWS Certified Developer"
                                required
                              />
                            </div>
                            <div>
                              <Label>Issuing Organization*</Label>
                              <Input
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                placeholder="Amazon Web Services"
                                required
                              />
                            </div>
                            <div>
                              <Label>Date Earned (or Expected)</Label>
                              <Input
                                type="month"
                                value={cert.date}
                                onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Credential ID/Link (optional)</Label>
                              <Input
                                value={cert.credential}
                                onChange={(e) => updateCertification(cert.id, 'credential', e.target.value)}
                                placeholder="Credential ID or URL"
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeCertification(cert.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Certification
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Achievements */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Award className="w-5 h-5 mr-2 text-blue-600" />
                        Achievements
                      </h3>
                      <Button onClick={addAchievement} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>

                    {resume.achievements.map((ach) => (
                      <Card key={ach.id} className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Achievement*</Label>
                            <Input
                              value={ach.title}
                              onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                              placeholder="Won first prize in coding competition"
                              required
                            />
                          </div>
                          <div>
                            <Label>Date (optional)</Label>
                            <Input
                              type="month"
                              value={ach.date}
                              onChange={(e) => updateAchievement(ach.id, 'date', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Description (optional)</Label>
                            <Textarea
                              value={ach.description}
                              onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                              placeholder="Additional details about the achievement..."
                              rows={3}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAchievement(ach.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Achievement
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Languages className="w-5 h-5 mr-2 text-blue-600" />
                        Languages
                      </h3>
                      <Button onClick={addLanguage} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Language
                      </Button>
                    </div>

                    {resume.languages.map((lang) => (
                      <Card key={lang.id} className="p-4">
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label>Language*</Label>
                              <Input
                                value={lang.language}
                                onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
                                placeholder="English"
                                required
                              />
                            </div>
                            <div>
                              <Label>Proficiency*</Label>
                              <Select
                                value={lang.proficiency}
                                onValueChange={(value) => updateLanguage(lang.id, 'proficiency', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select proficiency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Native">Native</SelectItem>
                                  <SelectItem value="Fluent">Fluent</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Basic">Basic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeLanguage(lang.id)}
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Language
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* ATS Score Checker */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Star className="w-5 h-5 mr-2 text-blue-600" />
                        ATS Score Check
                      </h3>
                      <Button 
                        onClick={handleATSCheck} 
                        disabled={isCheckingATS}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isCheckingATS ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Check ATS Score
                          </>
                        )}
                      </Button>
                    </div>

                    {atsScore && (
                      <Card className="p-6 border-l-4 border-l-blue-500">
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-blue-600 mb-2">
                            {atsScore.score}/100
                          </div>
                          <div className="text-2xl font-semibold mb-2">{atsScore.grade}</div>
                          <div className="text-gray-600">{atsScore.feedback}</div>
                        </div>

                        {/* Category Scores */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          {Object.entries(atsScore.details.categoryScores).map(([category, score]) => (
                            <div key={category} className="flex justify-between items-center">
                              <span className="capitalize text-sm">
                                {category.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <div className="flex items-center">
                                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${(score / 20) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{score}/20</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Strengths */}
                        {atsScore.details.strengths.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Strengths
                            </h4>
                            <ul className="space-y-1">
                              {atsScore.details.strengths.map((strength, index) => (
                                <li key={index} className="text-sm text-green-700 flex items-center">
                                  <div className="w-1 h-1 bg-green-600 rounded-full mr-2"></div>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {atsScore.details.suggestions.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-amber-600 mb-2 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Suggestions for Improvement
                            </h4>
                            <ul className="space-y-1">
                              {atsScore.details.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-amber-700 flex items-center">
                                  <div className="w-1 h-1 bg-amber-600 rounded-full mr-2"></div>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Missing Keywords */}
                        {atsScore.details.missingKeywords.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                              <XCircle className="w-4 h-4 mr-2" />
                              Consider Adding These Keywords
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {atsScore.details.missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-red-700 border-red-300">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={prevTab} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    <Button onClick={() => setShowPreview(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Generate Resume
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6 card-glow sticky top-24">
              <h3 className="text-xl font-bold mb-4">Resume Preview</h3>
              <div 
                className="bg-white text-gray-800 p-6 rounded-lg shadow-lg space-y-4 min-h-[500px]"
                style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}
              >
                {/* Personal Info */}
                <div className="text-center border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {resume.personalInfo.fullName || "Your Name"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {resume.personalInfo.currentRole || "Professional Title"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600 mt-2">
                    {resume.personalInfo.email && (
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {resume.personalInfo.email}
                      </div>
                    )}
                    {resume.personalInfo.phone && (
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {resume.personalInfo.phone}
                      </div>
                    )}
                    {resume.personalInfo.location && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {resume.personalInfo.location}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-blue-600 mt-2">
                    {resume.personalInfo.linkedin && (
                      <div className="flex items-center">
                        <Link className="w-3 h-3 mr-1" />
                        LinkedIn
                      </div>
                    )}
                    {resume.personalInfo.github && (
                      <div className="flex items-center">
                        <Code className="w-3 h-3 mr-1" />
                        GitHub
                      </div>
                    )}
                    {resume.personalInfo.portfolio && (
                      <div className="flex items-center">
                        <Link className="w-3 h-3 mr-1" />
                        Portfolio
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {resume.summary && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Summary</h2>
                    <p className="text-sm text-gray-700">{resume.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {resume.experience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Experience</h2>
                    {resume.experience.map((exp, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{exp.position || "Position"}</h3>
                          <span className="text-sm text-gray-600">
                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{exp.company || "Company"}</p>
                        {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                        {exp.description && (
                          <ul className="text-sm text-gray-700 mt-1 list-disc list-inside">
                            {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                              <li key={i}>{line.replace('•', '').trim()}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Education */}
                {resume.education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Education</h2>
                    {resume.education.map((edu, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{edu.degree || "Degree"}</h3>
                          <span className="text-sm text-gray-600">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{edu.institution || "Institution"}</p>
                        {edu.location && <p className="text-sm text-gray-500">{edu.location}</p>}
                        {(edu.gpa || edu.percentage) && (
                          <p className="text-sm text-gray-700">
                            {edu.gpa && `GPA: ${edu.gpa}`}
                            {edu.gpa && edu.percentage && ' | '}
                            {edu.percentage && `Percentage: ${edu.percentage}%`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {resume.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Skills</h2>
                    <div className="flex flex-wrap gap-1">
                      {resume.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resume.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Projects</h2>
                    {resume.projects.map((proj, index) => (
                      <div key={index} className="mb-3">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{proj.name || "Project Name"}</h3>
                          {proj.date && <span className="text-sm text-gray-600">{proj.date}</span>}
                        </div>
                        {proj.description && (
                          <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
                        )}
                        {proj.link && (
                          <p className="text-sm text-blue-600 mt-1">Link: {proj.link}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resume.certifications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Certifications</h2>
                    {resume.certifications.map((cert, index) => (
                      <div key={index} className="mb-3">
                        <h3 className="font-semibold text-gray-800">{cert.name || "Certification Name"}</h3>
                        <p className="text-sm text-gray-600">{cert.issuer || "Issuing Organization"}</p>
                        {cert.date && <p className="text-sm text-gray-600">Earned: {cert.date}</p>}
                        {cert.credential && <p className="text-sm text-blue-600">Credential: {cert.credential}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                {resume.achievements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Achievements</h2>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {resume.achievements.map((ach, index) => (
                        <li key={index}>
                          <strong>{ach.title}</strong>
                          {ach.date && ` (${ach.date})`}
                          {ach.description && ` - ${ach.description}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {resume.languages.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2 text-gray-800">Languages</h2>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                      {resume.languages.map((lang, index) => (
                        <div key={index}>
                          <strong>{lang.language}</strong>: {lang.proficiency}
                        </div>
                      ))}
                    </div>
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

export default ResumeBuilder;