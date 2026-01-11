import { Mic, Video, Wand2, Users } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'AI Scene Partner',
    description: 'Professional voices with authentic accents read your scene partner\'s lines with perfect timing.',
  },
  {
    icon: Video,
    title: 'Self-Tape Recording',
    description: 'Record professional audition tapes without needing another person present.',
  },
  {
    icon: Wand2,
    title: 'Smart Script Parsing',
    description: 'Upload PDFs or Fountain files. We automatically detect characters and dialogue.',
  },
  {
    icon: Users,
    title: 'Character Assignment',
    description: 'Assign AI voices to scene partners and take your own role for realistic rehearsal.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-white-200 " />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="text-gradient-gold">Perform</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From script to screen, Scene Partner handles every step of your rehearsal workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-white border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                
                <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
