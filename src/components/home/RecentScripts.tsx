import { FileText, Clock, Users, ArrowRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockScripts } from '@/lib/mockData';
import { Link } from 'react-router-dom';
import { Script } from '@/types/script';

const statusColors = {
  uploaded: 'bg-muted text-muted-foreground',
  parsed: 'bg-accent text-accent-foreground',
  assigned: 'bg-primary/20 text-primary',
  ready: 'bg-green-500/20 text-green-400',
};

const statusLabels = {
  uploaded: 'Uploaded',
  parsed: 'Parsed',
  assigned: 'Characters Assigned',
  ready: 'Ready to Rehearse',
};

function ScriptCard({ script }: { script: Script }) {
  return (
    <Card className="group bg-white border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="font-serif text-2xl font-bold mb-2 text-black group-hover:text-black transition-colors">
          {script.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center font-serif text-xl gap-3 text-black ">
            <Users className="w-4 h-4 "  />
            {script.characters.length} characters
          </span>
          <span className="flex items-center font-serif text-xl gap-3 text-black ">
            <Clock className="w-4 h-4" />
            {new Date(script.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`font-serif text-md gap-3 px-3 py-1 rounded-full ${statusColors[script.status]}`}>
            {statusLabels[script.status]}
          </span>
          <Link to={script.status === 'ready' ? `/rehearse/${script.id}` : `/scripts/${script.id}`}>
            <Button variant="ghost" size="sm" className="font-serif text-md text-black rounded-full p-5 gap-3 bg-yellow-400 hover:bg-green-600 hover:text-white">
              {script.status === 'ready' ? 'Rehearse' : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-1 " />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentScripts() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold mb-2"></h2>
            <p className="text-muted-foreground">Continue working on your scenes</p>
          </div>
          <Link to="/scripts">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockScripts.map((script) => (
            <ScriptCard key={script.id} script={script} />
          ))}

          {/* Upload New Card */}
          <Link to="/scripts">
            <Card className="h-full min-h-[200px] border-dashed border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="h-full font-serif text-xl gap-3 bg-white flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-full bg-foreground    flex items-center justify-center mb-4  ">
                  <FileText className="w-8 h-8 text-muted-foreground text-primary transition-colors" />
                </div>
                <span className="font-medium text-muted-foreground text-black transition-colors">
                  Upload New Script
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
