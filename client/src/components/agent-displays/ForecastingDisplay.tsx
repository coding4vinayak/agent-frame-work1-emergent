import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, TrendingUp, Target } from "lucide-react";

export interface ForecastingDisplayProps {
  data: {
    forecast?: Array<{
      date: string;
      predicted: number;
      lower: number;
      upper: number;
    }>;
    historical?: Array<{
      date: string;
      actual: number;
    }>;
    metrics?: {
      predictedRevenue?: number;
      growthRate?: number;
      confidence?: number;
    };
    scenarios?: Array<{
      name: string;
      value: number;
      probability: number;
    }>;
  };
}

export function ForecastingDisplay({ data }: ForecastingDisplayProps) {
  return (
    <div className="space-y-4">
      {data.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.metrics.predictedRevenue !== undefined && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Predicted Revenue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-predicted-revenue">
                  ${data.metrics.predictedRevenue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
          {data.metrics.growthRate !== undefined && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-growth-rate">
                  {data.metrics.growthRate > 0 ? "+" : ""}
                  {data.metrics.growthRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          )}
          {data.metrics.confidence !== undefined && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-confidence">
                  {(data.metrics.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {data.forecast && data.forecast.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              <CardTitle>Forecast Data</CardTitle>
            </div>
            <CardDescription>Predicted values with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.forecast.map((point, index) => (
                <div key={index} className="p-3 bg-muted rounded-md" data-testid={`forecast-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{point.date}</span>
                    <Badge variant="secondary">${point.predicted.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Range:</span>
                    <span>${point.lower.toLocaleString()}</span>
                    <span>-</span>
                    <span>${point.upper.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.scenarios && data.scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenario Analysis</CardTitle>
            <CardDescription>Different outcome scenarios with probabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.scenarios.map((scenario, index) => (
                <div key={index} className="p-3 bg-muted rounded-md" data-testid={`scenario-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{scenario.name}</span>
                    <Badge variant="outline">${scenario.value.toLocaleString()}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Probability:</span>
                    <div className="flex-1 bg-background rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${scenario.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{(scenario.probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
