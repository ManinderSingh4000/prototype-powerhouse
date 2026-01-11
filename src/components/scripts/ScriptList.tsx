import { FileText, Clock, Users, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useScripts } from '@/context/ScriptsContext';
import { Link } from 'react-router-dom';

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

export function ScriptList() {
  const { scripts, deleteScript } = useScripts();

  return (
    <div className="space-y-4  font-serif">
      <h2 className="text-xl font-semibold mb-4">All Scripts</h2>
      
      {scripts.length === 0 ? (
        <Card className="bg-white border-border">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-black">No scripts yet. Upload one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 ">
          {scripts.map((script) => (
            <Card key={script.id} className="bg-white border-border border-dashed border-2 hover:border-primary/30 transition-all duration-300 group">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary truncate text-lg  transition-colors">
                      {script.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {script.characters.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(script.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-3 py-1 bg-white border-2 border-dashed text-black rounded-full ${statusColors[script.status]} hidden sm:inline-block`}>
                    {statusLabels[script.status]} 
                  </span>

                  <div className="flex items-center  gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className=""
                      onClick={() => deleteScript(script.id)}
                    >
                      <Trash2 className="w-4 h-4 text-black" />
                    </Button>
                    <Link to={script.status === 'ready' ? `/rehearse/${script.id}` : `/scripts/${script.id}/assign`}>
                      <Button variant="default" size="sm">
                        {script.status === 'ready' ? 'Rehearse' : 'Configure'}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
