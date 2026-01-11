import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, LayoutDashboard, Library, Upload, LogOut, User, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { authApi, userApi, UserRole } from "@shared/api";

export function Navigation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let lastToken: string | null = null;
    let profileCache: { role: UserRole; timestamp: number } | null = null;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
    
    // Check authentication status and get user role
    const checkAuth = async (forceRefresh = false) => {
      const token = localStorage.getItem('token');
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
      
      // If token changed, clear cache
      if (token !== lastToken) {
        profileCache = null;
        lastToken = token;
      }
      
      if (authenticated) {
        // Check cache first
        if (!forceRefresh && profileCache && Date.now() - profileCache.timestamp < CACHE_DURATION) {
          setUserRole(profileCache.role);
          return;
        }
        
        try {
          const response = await userApi.getProfile();
          if (response.success && response.user) {
            setUserRole(response.user.role);
            // Cache the role
            profileCache = {
              role: response.user.role,
              timestamp: Date.now()
            };
          }
        } catch (error) {
          // If rate limited or error, use cached value if available
          if (profileCache) {
            setUserRole(profileCache.role);
          } else {
            setUserRole(null);
          }
        }
      } else {
        setUserRole(null);
        profileCache = null;
      }
    };
    
    // Initial check
    checkAuth();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth(true); // Force refresh on storage change
    };
    
    // Listen for custom auth-change event (when user logs in/out in same tab)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);
    
    // Check auth status periodically (every 30 seconds instead of 2 seconds)
    // Only refresh if token exists and cache is expired
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        // Only refresh if cache is expired
        if (!profileCache || Date.now() - profileCache.timestamp >= CACHE_DURATION) {
          checkAuth(false);
        }
      } else {
        checkAuth(false);
      }
    }, 30000); // 30 seconds instead of 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setIsAuthenticated(false);
    navigate("/");
    window.location.reload(); // Refresh to update all components
  };


  const publicNavLinks = [
    { label: "Features", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "About", path: "/about" },
  ];

  // Build authenticated nav links based on user role
  const getAuthNavLinks = () => {
    const links = [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Library", path: "/library", icon: Library },
    ];
    
    // Only show Upload for editors and admins
    if (userRole === 'editor' || userRole === 'admin') {
      links.push({ label: "Upload", path: "/upload", icon: Upload });
    }
    
    // Only show Users for admins
    if (userRole === 'admin') {
      links.push({ label: "Users", path: "/users", icon: Users });
    }
    
    links.push(
      { label: "Pricing", path: "/pricing", icon: null },
      { label: "About", path: "/about", icon: null }
    );
    
    return links;
  };
  
  const authNavLinks = getAuthNavLinks();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-premium ${
        scrolled ? "glass-elevated" : "glass"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <img
                src="/reshot-icon-videos-YRS9MXEN8T.svg"
                alt="VideoHub"
                className="w-10 h-10 transform group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline">
              VideoHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              authNavLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors duration-200 text-sm font-medium"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                );
              })
            ) : (
              publicNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-foreground/60 hover:text-primary transition-colors duration-200 text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/settings">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-muted/50 hover:border-primary/50 hover:bg-primary/5 gap-2"
                    >
                      <User className="w-4 h-4" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-muted/50 hover:border-destructive/50 hover:bg-destructive/5 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-muted/50 hover:border-primary/50 hover:bg-primary/5"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="btn-primary text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-slide-in">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                authNavLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors px-2 py-2 text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {link.label}
                    </Link>
                  );
                })
              ) : (
                publicNavLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-foreground/60 hover:text-primary transition-colors px-2 py-2 text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))
              )}
              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/settings" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-muted/50 hover:bg-primary/5 gap-2"
                      >
                        <User className="w-4 h-4" />
                        Settings
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full border-muted/50 hover:bg-destructive/5 gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-muted/50 hover:bg-primary/5"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button size="sm" className="w-full btn-primary text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
