import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { AnimatedBackground } from "@/components/3d/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";
import { userApi, authApi } from "@shared/api";
import { User, Save, LogOut, Bell, Shield, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getProfile();
        if (response.success) {
          setUser(response.user);
          setFormData({
            name: response.user.name || "",
            email: response.user.email || "",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await userApi.updateProfile(formData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        setUser(response.user);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    navigate("/");
    window.location.reload();
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <img
              src="/reshot-icon-video-tutorials-ZUNFC7L9TP.svg"
              alt="Loading..."
              className="w-16 h-16 mx-auto mb-4 animate-spin"
            />
            <p className="text-foreground/60">Loading settings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      <AnimatedBackground interactive={false} />
      <Navigation />

      <main className="flex-1 pt-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-foreground/60">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Settings */}
            <div className="glass-elevated rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Profile Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-premium"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-elevated rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Email Notifications</h3>
                    <p className="text-sm text-foreground/60">
                      Receive email updates about your videos
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({ ...notifications, email: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-muted/50 accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Push Notifications</h3>
                    <p className="text-sm text-foreground/60">
                      Receive browser push notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) =>
                      setNotifications({ ...notifications, push: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-muted/50 accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Product Updates</h3>
                    <p className="text-sm text-foreground/60">
                      Get notified about new features and updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.updates}
                    onChange={(e) =>
                      setNotifications({ ...notifications, updates: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-muted/50 accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Account Info */}
            {user && (
              <div className="glass-elevated rounded-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Account Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Role</p>
                    <p className="font-semibold capitalize">{user.role || "User"}</p>
                  </div>
                  {user.organization && (
                    <div>
                      <p className="text-sm text-foreground/60 mb-1">Organization</p>
                      <p className="font-semibold">
                        {user.organization.name || user.organization}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Member Since</p>
                    <p className="font-semibold">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="glass-elevated rounded-xl p-8 border-2 border-destructive/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Key className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive">Danger Zone</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">Sign Out</h3>
                    <p className="text-sm text-foreground/60">
                      Sign out of your account
                    </p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-destructive/50 hover:bg-destructive/10 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
