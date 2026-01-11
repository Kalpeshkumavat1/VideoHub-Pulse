import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { authApi } from "@shared/api";
import { Users, Zap, Shield, Globe } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Process and stream videos with minimal latency using our optimized infrastructure.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with end-to-end encryption and privacy controls.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Scale",
      description: "CDN-powered delivery ensures fast streaming worldwide.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Multi-tenant architecture perfect for teams and organizations.",
    },
  ];

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Videos Processed", value: "1M+" },
    { label: "Countries Served", value: "50+" },
    { label: "Uptime", value: "99.9%" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">About VideoHub</h1>
            <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
              We're building the future of video streaming and processing. Our platform empowers creators,
              businesses, and organizations to share their content with the world.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="glass-elevated rounded-xl p-12 mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-foreground/70 leading-relaxed mb-4">
              At VideoHub, we believe that video content should be accessible, fast, and easy to manage.
              Our mission is to provide a platform that removes the technical barriers between creators
              and their audience.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              Whether you're a solo creator, a growing business, or a large enterprise, VideoHub provides
              the tools and infrastructure you need to succeed in the digital video landscape.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="glass-elevated rounded-xl p-8">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section - Only show when not authenticated */}
          {!authApi.isAuthenticated() && (
            <div className="glass-elevated rounded-xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                Join thousands of creators and businesses using VideoHub to share their content.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="btn-primary text-white">
                    Create Account
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
