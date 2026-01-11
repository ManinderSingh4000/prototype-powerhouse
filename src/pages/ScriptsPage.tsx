import { Header } from '@/components/layout/Header';
import { ScriptUploader } from '@/components/scripts/ScriptUploader';
import { ScriptList } from '@/components/scripts/ScriptList';

export default function ScriptsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="font-serif text-4xl font-bold mb-4">Your Scripts</h1>
              <p className="text-black font-serif text-lg">
                Upload, parse, and manage your scene scripts
              </p>
            </div>
            
            <ScriptUploader />
            <ScriptList />
          </div>
        </div>
      </main>
    </div>
  );
}
