import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockVoices } from '@/lib/mockData';
import { Volume2, Play, Star } from 'lucide-react';
import { useState } from 'react';

export default function VoicesPage() {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const groupedVoices = mockVoices.reduce((acc, voice) => {
    if (!acc[voice.category]) {
      acc[voice.category] = [];
    }
    acc[voice.category].push(voice);
    return acc;
  }, {} as Record<string, typeof mockVoices>);

  const playPreview = (voiceId: string) => {
    setPlayingVoice(voiceId);
    // Simulate audio playing
    setTimeout(() => setPlayingVoice(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="font-serif text-4xl font-bold mb-4">Voice Library</h1>
              <p className="text-muted-foreground text-lg">
                Choose from our collection of professional AI voices for your scene partner
              </p>
            </div>

            {Object.entries(groupedVoices).map(([category, voices]) => (
              <div key={category} className="mb-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voices.map((voice) => (
                    <Card key={voice.id} className="bg-card border-border hover:border-primary/30 transition-all duration-300 group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                              <Volume2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{voice.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {voice.accent} • {voice.gender}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={playingVoice === voice.id ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => playPreview(voice.id)}
                            className={playingVoice === voice.id ? 'animate-pulse' : ''}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
