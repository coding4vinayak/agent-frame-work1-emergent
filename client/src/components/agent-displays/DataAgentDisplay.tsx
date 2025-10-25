import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, TrendingUp, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface DataAgentDisplayProps {
  data: {
    inputSummary?: {
      rows: number;
      columns: number;
    };
    transformationApplied?: string;
    outputData?: Array<Record<string, any>>;
    statistics?: {
      before?: Record<string, any>;
      after?: Record<string, any>;
    };
  };
}

export function DataAgentDisplay({ data }: DataAgentDisplayProps) {
  return (
    <div className="space-y-4">
      {data.inputSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Input Data Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Rows</div>
                <div className="text-2xl font-bold" data-testid="text-input-rows">
                  {data.inputSummary.rows.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Columns</div>
                <div className="text-2xl font-bold" data-testid="text-input-columns">
                  {data.inputSummary.columns}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.transformationApplied && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>Transformation Applied</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" data-testid="badge-transformation">
              {data.transformationApplied}
            </Badge>
          </CardContent>
        </Card>
      )}

      {data.outputData && data.outputData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Output Data Preview</CardTitle>
            </div>
            <CardDescription>Showing first {Math.min(10, data.outputData.length)} rows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data.outputData[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.outputData.slice(0, 10).map((row, index) => (
                    <TableRow key={index} data-testid={`row-${index}`}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {data.statistics && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Statistics</CardTitle>
            </div>
            <CardDescription>Before and after comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {data.statistics.before && (
                <div>
                  <h4 className="font-semibold mb-2">Before</h4>
                  <div className="space-y-1">
                    {Object.entries(data.statistics.before).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.statistics.after && (
                <div>
                  <h4 className="font-semibold mb-2">After</h4>
                  <div className="space-y-1">
                    {Object.entries(data.statistics.after).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
