import { useState, useCallback } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useScripts } from '@/context/ScriptsContext';
import { useNavigate } from 'react-router-dom';

export function ScriptUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { addScript } = useScripts();
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, []);

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'text/plain', '.fountain'];
    const isValid = validTypes.some(type => 
      selectedFile.type.includes(type) || selectedFile.name.endsWith('.fountain') || selectedFile.name.endsWith('.txt')
    );

    if (!isValid && !selectedFile.name.endsWith('.pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, TXT, or Fountain file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    processFile(selectedFile);
  };

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    
    try {
      const newScript = await addScript(selectedFile);
      
      toast({
        title: "Script uploaded!",
        description: `${selectedFile.name} has been parsed with ${newScript.characters.length} characters`,
      });
      
      // Navigate to assign characters
      setTimeout(() => {
        navigate(`/scripts/${newScript.id}/assign`);
      }, 500);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not process the script file",
        variant: "destructive",
      });
    }
    
    setIsProcessing(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  return (
    <Card className={`mb-8 transition-all duration-300 ${isDragging ? 'border-primary ring-4 ring-primary/20' : 'border-dashed border-2 border-border hover:border-primary/50'}`}>
      <CardContent className="p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="text-center"
        >
          {isProcessing ? (
            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">Processing script...</p>
              <p className="text-muted-foreground text-sm">Parsing characters and dialogue</p>
            </div>
          ) : file ? (
            <div className="py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-medium mb-2">{file.name}</p>
              <p className="text-muted-foreground text-sm mb-4">Ready to configure</p>
              <Button variant="hero" onClick={() => setFile(null)}>
                Upload Another
              </Button>
            </div>
          ) : (
            <div className="py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-xl font-medium mb-2">Drop your script here</p>
              <p className="text-muted-foreground mb-6">
                Supports PDF, TXT, and Fountain formats
              </p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.fountain"
                  onChange={handleFileInput}
                />
                <Button variant="hero" className="cursor-pointer" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
