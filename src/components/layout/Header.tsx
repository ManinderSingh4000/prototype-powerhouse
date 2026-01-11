import { Film, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Scripts', href: '/scripts' },
  { label: 'Rehearse', href: '/rehearse' },
  { label: 'Voices', href: '/voices' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed font-serif  bg-white top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Film className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-gradient-gold">
              Scene Partner
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button 
                className='bg-white pl-5  pr-5 rounded-full border-2 border-dashed border-border  transition-all duration-300'
                  
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex  items-center gap-3">
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Button variant="hero" className="mt-2">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
