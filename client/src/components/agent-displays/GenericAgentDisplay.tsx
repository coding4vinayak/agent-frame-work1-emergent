import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface GenericAgentDisplayProps {
  data: any;
  agentName?: string;
}

export function GenericAgentDisplay({ data, agentName }: GenericAgentDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{agentName || "Agent"} Output</span>
          <Badge variant="secondary">Generic</Badge>
        </CardTitle>
        <CardDescription>Raw JSON output from the agent</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-md overflow-x-auto">
          <pre className="text-sm font-mono" data-testid="pre-agent-output">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
