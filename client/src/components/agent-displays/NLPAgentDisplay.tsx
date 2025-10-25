import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Tag } from "lucide-react";

export interface NLPAgentDisplayProps {
  data: {
    originalText: string;
    processedOutput?: string;
    sentiment?: {
      score: number;
      label: "positive" | "negative" | "neutral";
    };
    entities?: Array<{
      text: string;
      type: string;
      confidence: number;
    }>;
    summary?: string;
    confidence?: number;
  };
}

export function NLPAgentDisplay({ data }: NLPAgentDisplayProps) {
  const getSentimentColor = (label: string) => {
    switch (label) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle>Original Text</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-original">
            {data.originalText}
          </p>
        </CardContent>
      </Card>

      {data.sentiment && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Sentiment Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={getSentimentColor(data.sentiment.label)} data-testid="badge-sentiment">
                {data.sentiment.label}
              </Badge>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${data.sentiment.score * 100}%` }}
                    data-testid="progress-sentiment-score"
                  />
                </div>
                <div className="text-sm font-medium mt-1">{(data.sentiment.score * 100).toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.entities && data.entities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              <CardTitle>Extracted Entities</CardTitle>
            </div>
            <CardDescription>{data.entities.length} entities detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.entities.map((entity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md" data-testid={`entity-${index}`}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{entity.type}</Badge>
                    <span className="font-medium">{entity.text}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(entity.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm" data-testid="text-summary">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {data.processedOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Output</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap" data-testid="text-processed">
              {data.processedOutput}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
