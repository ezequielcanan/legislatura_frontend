import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, LogOut, User, Shield, Menu, X, FileText, Users, Building2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logo from '../../assets/images/image.png';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { to: "/home", label: "Inicio" },
    { to: "/proyectos", label: "Proyectos" },
    { to: "/bae", label: "BAE" },
    { to: "/legisladores", label: "Legisladores" },
    { to: "/partidos", label: "Partidos" },
    { to: "/consultas", label: "Chat" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <motion.img
              src={logo}
              alt="Logo"
              className="h-10 w-10"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Legislatura CABA
            </span>
          </div>

          {/* Desktop Menu (Hidden en mobile) */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium'
                    : 'hover:bg-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {user.role === 'admin' && (
              <Link to="/admin" className="px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-violet-600 font-medium">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}

            <div className="ml-4 flex items-center gap-2 border-l border-border/50 pl-4">
              <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent transition-all">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <User className="w-4 h-4 text-violet-600" />
                <span className="text-sm hidden xl:block">{user.email}</span>
              </div>
              
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map(link => (
                <Link 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-accent text-base font-medium"
                >
                  {link.label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-accent text-base font-medium text-violet-600"
                >
                  <div className="flex items-center gap-2">
                     <Shield className="w-4 h-4" /> Panel Admin
                  </div>
                </Link>
              )}
              
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-accent">
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                 </div>
                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive font-medium"
                 >
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}