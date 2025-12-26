import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Brain, Sparkles, Target, Users, TrendingUp, Award, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

// Try importing animejs directly
let anime: any;
try {
  anime = require("animejs").default;
} catch (error) {
  console.warn("Anime.js not available, animations will be disabled");
}

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!anime) return;

    // Initial hero animation
    const timeline = anime.timeline();
    
    timeline
      .add({
        targets: ".hero-line",
        scaleX: [0, 1],
        duration: 1200,
        easing: "easeOutExpo",
      })
      .add(
        {
          targets: ".hero-title",
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 1000,
          easing: "easeOutExpo",
        },
        "-=600"
      )
      .add(
        {
          targets: ".hero-subtitle",
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 1000,
          easing: "easeOutExpo",
        },
        "-=600"
      )
      .add(
        {
          targets: ".hero-cta",
          opacity: [0, 1],
          translateY: [30, 0],
          duration: 1000,
          easing: "easeOutExpo",
        },
        "-=600"
      );

    // Scroll-triggered animations for sections
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;

          if (element.classList.contains("section-title")) {
            anime({
              targets: element,
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 1000,
              easing: "easeOutExpo",
            });
          }

          if (element.classList.contains("feature-item")) {
            const items = element.parentElement?.querySelectorAll(".feature-item");
            if (items) {
              anime({
                targets: items,
                opacity: [0, 1],
                translateY: [40, 0],
                duration: 800,
                easing: "easeOutExpo",
                delay: anime.stagger(100),
              });
            }
            observer.unobserve(element);
          }

          if (element.classList.contains("stat-item")) {
            const items = element.parentElement?.querySelectorAll(".stat-item");
            if (items) {
              anime({
                targets: items,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 800,
                easing: "easeOutExpo",
                delay: anime.stagger(80),
              });
            }
            observer.unobserve(element);
          }
        }
      });
    }, observerOptions);

    // Observe all animated elements
    document.querySelectorAll(".section-title, .feature-item, .stat-item").forEach((el) => {
      observer.observe(el);
    });

    // Smooth hover animations for cards
    document.querySelectorAll(".feature-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        anime({
          targets: card,
          translateY: -10,
          duration: 400,
          easing: "easeOutQuad",
        });
      });
      card.addEventListener("mouseleave", () => {
        anime({
          targets: card,
          translateY: 0,
          duration: 400,
          easing: "easeOutQuad",
        });
      });
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "AI-Powered Learning",
      description: "Personalized learning paths driven by advanced AI algorithms",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Trending Skills",
      description: "Stay ahead with courses on the most in-demand future skills",
    },
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: "Career Growth",
      description: "Guided pathways to achieve your professional goals",
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Learn Together",
      description: "Join a vibrant community of passionate learners",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Interactive Content",
      description: "Engage with fun, gamified learning experiences",
    },
    {
      icon: <Award className="w-6 h-6 text-primary" />,
      title: "Achievements",
      description: "Track progress and earn badges as you master new skills",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-sm bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">FutureLearnX</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="hero" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="hero-line h-1 w-16 bg-gradient-to-r from-primary to-accent mx-auto mb-8 origin-left" />

          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
            Master the{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Skills of Tomorrow
            </span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
            AI-driven personalized learning platform helping students and professionals discover, learn, and excel in
            future-ready subjects
          </p>

          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
              Start Learning Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="neon" size="xl" onClick={() => navigate("\courses")}>
              Explore Courses
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="stat-item text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                10K+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Active Learners</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                500+
              </div>
              <div className="text-sm text-muted-foreground mt-1">Courses</div>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                95%
              </div>
              <div className="text-sm text-muted-foreground mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-4xl md:text-5xl font-bold text-center mb-20">
            Why Choose <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">FutureLearnX?</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="feature-item feature-card p-8 border-border/40 bg-card/30 backdrop-blur hover:border-primary/50 hover:bg-card/60 transition-colors duration-300 cursor-pointer group"
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
        <div className="container mx-auto px-4 relative z-10">
          <Card className="p-12 card-glow text-center max-w-3xl mx-auto border-border/40 bg-card/30 backdrop-blur">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Shape Your Future?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of learners already mastering tomorrow's most valuable skills
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
              Begin Your Journey
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 FutureLearnX. Empowering the learners of tomorrow.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;