import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Activity,
  Users,
  ChefHat,
  FileHeart,
  LayoutDashboard,
  Menu,
  X,
  Moon,
  Sun,
  Crown,
  ShoppingBag,
  Bluetooth,
  Watch,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import NotificationCenter from "./NotificationCenter";
import AchievementsBadge from "./AchievementsBadge";
import { AICoachChat } from "./AICoachChat";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: User, label: "Cuerpo", path: "/body" },
  { icon: Activity, label: "Rendimiento", path: "/performance" },
  { icon: Users, label: "Especialistas", path: "/specialists" },
  { icon: ChefHat, label: "Chef IA", path: "/chef" },
  { icon: FileHeart, label: "Ficha Médica", path: "/medical" },
  { icon: Bluetooth, label: "Dispositivos BT", path: "/bluetooth" },
  { icon: Watch, label: "Wearables", path: "/wearables" },
  { icon: Crown, label: "Suscripciones", path: "/subscriptions" },
  { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
];

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isPremium } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-border bg-card"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-chart-4 to-accent bg-clip-text text-transparent animate-gradient">
              NutriStream
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all duration-300 ${
                    isActive ? "btn-3d shadow-glow" : "hover:translate-x-1"
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Auth & Dark Mode */}
          <div className="border-t border-border p-4 space-y-2">
            {user ? (
              <>
                {isPremium && (
                  <Badge className="w-full justify-center mb-2 bg-gradient-to-r from-primary to-accent">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                className="w-full justify-start gap-3"
                onClick={() => navigate('/auth')}
              >
                <LogIn className="h-5 w-5" />
                <span>Iniciar Sesión</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-[280px]" : ""
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          {user && (
            <div className="flex items-center gap-2">
              <AchievementsBadge />
              <NotificationCenter />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* AI Coach Chat */}
      {user && <AICoachChat />}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
