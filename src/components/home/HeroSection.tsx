import { Button } from '@/components/ui/button';
import { Play, Upload, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-stage.jpg';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Dramatic stage with spotlight"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      </div>

      {/* Spotlight Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none">
        <div className="w-full h-full bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-primary/20 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm text-muted-foreground">AI-Powered Scene Partner</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Rehearse Like a{' '}
            <span className="text-gradient-gold">Pro</span>
            <br />
            Anytime, Anywhere
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your AI scene partner reads lines with professional accents, perfect timing, 
            and realistic delivery. Record self-tapes without needing another person.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/scripts">
              <Button variant="hero" size="xl" className="group">
                <Upload className="w-5 h-5 mr-2" />
                Upload Script
              </Button>
            </Link>
            <Link to="/rehearse">
              <Button variant="glass" size="xl">
                <Play className="w-5 h-5 mr-2" />
                Try Demo Scene
              </Button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {['AI Voice Acting', 'Script Parsing', 'Real-time Rehearsal', 'Pro Recording'].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground border border-border"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
}
