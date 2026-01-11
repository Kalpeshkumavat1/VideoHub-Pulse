import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Check, X } from "lucide-react";
import { authApi } from "@shared/api";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    terms: false,
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });

  const passwordStrength = {
    hasMinLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumbers: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;
  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"][strengthScore];
  const strengthColor = {
    0: "from-destructive to-destructive/60",
    1: "from-destructive to-destructive/60",
    2: "from-amber-500 to-amber-500/60",
    3: "from-amber-400 to-amber-400/60",
    4: "from-primary to-primary/60",
    5: "from-accent to-accent/60",
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
    };

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.organizationName) {
      newErrors.organizationName = "Organization name is required";
    }

    setErrors(newErrors);
    return (
      !newErrors.name &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword &&
      !newErrors.organizationName &&
      formData.terms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authApi.register(
        formData.name,
        formData.email,
        formData.password,
        formData.organizationName
      );
      if (response.success) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
        // Trigger custom event to update Navigation
        window.dispatchEvent(new Event('auth-change'));
        navigate("/dashboard");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setErrors((prev) => ({
        ...prev,
        email: errorMessage.includes("exists") ? errorMessage : prev.email,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (type !== "checkbox") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <AuthLayout isLogin={false}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-foreground/60">
            Join thousands of creators using VideoHub
          </p>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted/50" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-foreground/60">
              Sign up with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="input-premium"
            />
            {errors.name && (
              <p className="text-destructive text-sm mt-1 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="input-premium"
            />
            {errors.email && (
              <p className="text-destructive text-sm mt-1 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Organization Name Field */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium mb-2">
              Organization Name
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="My Organization"
              value={formData.organizationName}
              onChange={handleChange}
              disabled={isLoading}
              className="input-premium"
            />
            {errors.organizationName && (
              <p className="text-destructive text-sm mt-1 font-medium">
                {errors.organizationName}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="input-premium"
            />
            {errors.password && (
              <p className="text-destructive text-sm mt-1 font-medium">
                {errors.password}
              </p>
            )}

            {/* Password Strength */}
            {formData.password && (
              <div className="mt-3 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground/70">
                      Password strength
                    </span>
                    <span className={`text-xs font-semibold bg-gradient-to-r ${strengthColor[strengthScore]} bg-clip-text text-transparent`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1.5 rounded-full transition-all ${
                          i < strengthScore
                            ? `bg-gradient-to-r ${strengthColor[strengthScore]}`
                            : "bg-muted/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <ul className="text-xs space-y-1">
                  {[
                    {
                      label: "At least 8 characters",
                      check: passwordStrength.hasMinLength,
                    },
                    {
                      label: "One uppercase letter",
                      check: passwordStrength.hasUpperCase,
                    },
                    {
                      label: "One number",
                      check: passwordStrength.hasNumbers,
                    },
                  ].map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {req.check ? (
                        <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-foreground/30 flex-shrink-0" />
                      )}
                      <span
                        className={
                          req.check
                            ? "text-foreground/70"
                            : "text-foreground/50"
                        }
                      >
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-2"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="input-premium"
            />
            {errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="w-4 h-4 rounded border-muted/50 accent-primary cursor-pointer mt-1 flex-shrink-0"
            />
            <label htmlFor="terms" className="text-sm text-foreground/70 cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary text-white font-semibold h-11 hover:scale-105 transition-transform"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-foreground/60 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
