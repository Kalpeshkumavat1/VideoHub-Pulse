import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { authApi } from "@shared/api";
import {
  Zap,
  Play,
  ArrowRight,
  Shield,
  BarChart3,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Index() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
    const checkAuth = () => setIsAuthenticated(authApi.isAuthenticated());
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning-Fast Processing",
      description:
        "Advanced video transcoding and processing powered by enterprise-grade infrastructure",
      gradient: "from-primary to-primary/60",
    },
    {
      icon: Play,
      title: "Seamless Streaming",
      description:
        "Adaptive bitrate streaming with automatic quality optimization",
      gradient: "from-secondary to-secondary/60",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Military-grade encryption and compliance with industry standards",
      gradient: "from-accent to-accent/60",
    },
  ];

  const stats = [
    { number: "10M+", label: "Videos Processed", icon: "📹" },
    { number: "99.9%", label: "Uptime SLA", icon: "⚡" },
    { number: "500M+", label: "Monthly Views", icon: "👁️" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* 3D Background */}
        <AnimatedBackground interactive={true} />

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className="transition-all duration-700"
            style={{
              transform: `translateY(${scrollPosition * 0.3}px)`,
              opacity: Math.max(1 - scrollPosition / 600, 0.2),
            }}
          >
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 rounded-full glass">
              <p className="text-primary text-sm font-semibold flex items-center gap-2">
                <span className="relative inline-block">
                  <span className="animate-pulse">🚀</span>
                </span>
                Introducing the Future of Video
              </p>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-foreground">Video Experience</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Enterprise-grade video processing and streaming platform.
              <br />
              Professional excellence meets cutting-edge innovation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/register">
                <Button
                  size="lg"
                  className="btn-primary text-white font-semibold px-8 hover:scale-105 group relative overflow-hidden"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-muted/50 hover:border-primary/50 hover:bg-primary/5 font-semibold"
              >
                Watch Demo
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="glass-elevated p-6 rounded-xl hover-lift group"
                >
                  <p className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.number}
                  </p>
                  <p className="text-xs md:text-sm text-foreground/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-foreground/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Features for
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}
                Professionals
              </span>
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to deliver enterprise-grade video experiences
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glass-elevated p-8 rounded-2xl hover-lift hover:glow-primary-lg relative overflow-hidden"
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-elevated rounded-3xl p-12 md:p-20 border border-primary/20 relative overflow-hidden group">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                  <Layers className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Multi-Tenant</h3>
                  <p className="text-foreground/60">
                    Perfect for teams and organizations
                  </p>
                </div>

                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Real-Time Analytics</h3>
                  <p className="text-foreground/60">
                    Track metrics and performance
                  </p>
                </div>

                <div className="text-center">
                  <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Instant Deployment</h3>
                  <p className="text-foreground/60">
                    Start streaming in minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Only show when not authenticated */}
      {!isAuthenticated && (
        <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses using VideoHub for professional video
              management and delivery
            </p>

            <Link to="/register">
              <Button
                size="lg"
                className="btn-primary text-white font-semibold px-10 hover:scale-105 group"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <p className="text-sm text-foreground/50 mt-6">
              No credit card required. Full access to all features.
            </p>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
