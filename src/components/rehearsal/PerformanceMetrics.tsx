import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ASRMetrics } from '@/hooks/useASR';
import { CheckCircle, XCircle, Clock, Target, TrendingUp } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: ASRMetrics | null;
  sessionMetrics?: ASRMetrics[];
  className?: string;
}

export function PerformanceMetrics({ metrics, sessionMetrics = [], className = '' }: PerformanceMetricsProps) {
  if (!metrics && sessionMetrics.length === 0) return null;

  const averageAccuracy = sessionMetrics.length > 0
    ? Math.round(sessionMetrics.reduce((sum, m) => sum + m.accuracy, 0) / sessionMetrics.length)
    : metrics?.accuracy || 0;

  const averageWordMatch = sessionMetrics.length > 0
    ? Math.round(sessionMetrics.reduce((sum, m) => sum + m.wordMatchRate, 0) / sessionMetrics.length)
    : metrics?.wordMatchRate || 0;

  const totalTime = sessionMetrics.length > 0
    ? sessionMetrics.reduce((sum, m) => sum + m.timeTaken, 0)
    : metrics?.timeTaken || 0;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Performance Metrics</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Accuracy Score */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor(averageAccuracy)}`}>
              {averageAccuracy}%
            </div>
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <Progress 
              value={averageAccuracy} 
              className="h-2 mt-2" 
            />
          </div>

          {/* Word Match Rate */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAccuracyColor(averageWordMatch)}`}>
              {averageWordMatch}%
            </div>
            <p className="text-sm text-muted-foreground">Word Match</p>
            <Progress 
              value={averageWordMatch} 
              className="h-2 mt-2"
            />
          </div>

          {/* Lines Completed */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {sessionMetrics.length}
            </div>
            <p className="text-sm text-muted-foreground">Lines Completed</p>
          </div>

          {/* Total Time */}
          <div className="text-center">
            <div className="text-3xl font-bold text-muted-foreground">
              {Math.round(totalTime / 1000)}s
            </div>
            <p className="text-sm text-muted-foreground">Total Time</p>
          </div>
        </div>

        {/* Latest Line Metrics */}
        {metrics && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2">Last Line Details</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                <Target className="w-3 h-3" />
                {metrics.matchedWords}/{metrics.expectedWords} words
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted">
                <Clock className="w-3 h-3" />
                {(metrics.timeTaken / 1000).toFixed(1)}s
              </span>
              {metrics.missedWords.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600">
                  <XCircle className="w-3 h-3" />
                  Missed: {metrics.missedWords.slice(0, 3).join(', ')}
                  {metrics.missedWords.length > 3 && '...'}
                </span>
              )}
              {metrics.missedWords.length === 0 && metrics.accuracy >= 80 && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Great delivery!
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
