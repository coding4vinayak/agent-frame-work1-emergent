
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react";
import { GenericAgentDisplay } from "./agent-displays/GenericAgentDisplay";
import { NLPAgentDisplay } from "./agent-displays/NLPAgentDisplay";
import { DataAgentDisplay } from "./agent-displays/DataAgentDisplay";
import { LeadScoringDisplay } from "./agent-displays/LeadScoringDisplay";
import { ForecastingDisplay } from "./agent-displays/ForecastingDisplay";

interface AgentTestInterfaceProps {
  moduleId: string;
  moduleName: string;
  moduleType?: string;
}

const sampleInputs: Record<string, string> = {
  nlp_processor: JSON.stringify({ text: "This is a sample text for NLP processing", task: "summarize" }, null, 2),
  data_processor: JSON.stringify({ data: [{ id: 1, name: "John" }, { id: 2, name: "Jane" }], operation: "filter" }, null, 2),
  "lead-scoring-ai": JSON.stringify({ email: "test@example.com", company: "Test Corp", industry: "Technology" }, null, 2),
  default: JSON.stringify({ input: "Your test data here" }, null, 2),
};

export function AgentTestInterface({ moduleId, moduleName, moduleType }: AgentTestInterfaceProps) {
  const { toast } = useToast();
  const [inputData, setInputData] = useState(sampleInputs[moduleId] || sampleInputs.default);
  const [result, setResult] = useState<any>(null);

  const testMutation = useMutation({
    mutationFn: async (data: string) => {
      const parsedData = JSON.parse(data);
      return apiRequest("POST", `/api/modules/${moduleId}/execute`, {
        inputData: parsedData,
      });
    },
    onSuccess: (data) => {
      setResult(data);
      if (data.status === "completed") {
        toast({
          title: "Test successful",
          description: "Agent execution completed",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Test failed",
          description: data.error || "Agent execution failed",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Test failed",
        description: error.message,
      });
    },
  });

  const handleTest = () => {
    try {
      JSON.parse(inputData);
      testMutation.mutate(inputData);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please provide valid JSON input",
      });
    }
  };

  const loadSampleData = () => {
    setInputData(sampleInputs[moduleId] || sampleInputs.default);
  };

  const renderResult = () => {
    if (!result) return null;

    const output = result.output;
    
    // Use specific display components based on module type
    if (moduleId.includes("nlp") && output) {
      return <NLPAgentDisplay data={output} />;
    } else if (moduleId.includes("data") && output) {
      return <DataAgentDisplay data={output} />;
    } else if (moduleId.includes("scoring") && output) {
      return <LeadScoringDisplay data={output} />;
    } else if (moduleId.includes("forecast") && output) {
      return <ForecastingDisplay data={output} />;
    }
    
    return <GenericAgentDisplay data={result} agentName={moduleName} />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test {moduleName}</CardTitle>
          <CardDescription>
            Enter test input data and run the agent to see results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Input Data (JSON)</label>
              <Button variant="outline" size="sm" onClick={loadSampleData}>
                Load Sample
              </Button>
            </div>
            <Textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter JSON input data"
              className="font-mono text-sm min-h-[200px]"
              data-testid="textarea-test-input"
            />
          </div>

          <Button
            onClick={handleTest}
            disabled={testMutation.isPending}
            className="w-full"
            data-testid="button-run-test"
          >
            {testMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Test...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <Badge variant={result.status === "completed" ? "default" : "destructive"}>
                {result.status === "completed" ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {result.status}
              </Badge>
            </CardTitle>
            {result.duration && (
              <CardDescription>Completed in {result.duration}ms</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {renderResult()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
