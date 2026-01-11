import { ReactNode } from "react";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  isLogin: boolean;
}

export function AuthLayout({ children, isLogin }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative">
      {/* Left Side - 3D Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background flex-col justify-between p-8 lg:p-12">
        <AnimatedBackground interactive={false} />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 lg:p-12 z-20">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="relative w-10 h-10">
              <img
                src="/reshot-icon-videos-YRS9MXEN8T.svg"
                alt="VideoHub"
                className="w-10 h-10 transform group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VideoHub
            </span>
          </Link>

          <div className="text-white">
            <h2 className="text-5xl font-bold mb-6">
              {isLogin ? "Welcome Back" : "Join the Platform"}
            </h2>
            <p className="text-xl text-white/70 max-w-md leading-relaxed">
              {isLogin
                ? "Access your account and manage your videos with our enterprise-grade platform."
                : "Create your account and unlock the power of professional video streaming."}
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-3">
              {[
                "Lightning-fast video processing",
                "Real-time streaming analytics",
                "Enterprise-grade security",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <span className="text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-3 group w-fit">
              <div className="relative w-10 h-10">
                <img
                  src="/reshot-icon-videos-YRS9MXEN8T.svg"
                  alt="VideoHub"
                  className="w-10 h-10 transform group-hover:scale-110 transition-transform"
                />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                VideoHub
              </span>
            </Link>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
