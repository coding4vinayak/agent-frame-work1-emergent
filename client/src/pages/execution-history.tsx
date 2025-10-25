
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import type { ModuleExecution } from "@shared/schema";

export default function ExecutionHistory() {
  const [selectedExecution, setSelectedExecution] = useState<ModuleExecution | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: executions, isLoading } = useQuery<ModuleExecution[]>({
    queryKey: ["/api/module-executions"],
  });

  const filteredExecutions = executions?.filter((exec) => {
    const matchesStatus = statusFilter === "all" || exec.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      exec.moduleId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Execution History</h1>
        <p className="text-sm text-muted-foreground mt-2">
          View all agent execution logs and results
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by module ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!filteredExecutions || filteredExecutions.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No execution history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution) => {
                  const duration = execution.completedAt && execution.createdAt
                    ? Math.round(
                        (new Date(execution.completedAt).getTime() -
                          new Date(execution.createdAt).getTime()) / 1000
                      )
                    : null;

                  return (
                    <TableRow key={execution.id} data-testid={`row-execution-${execution.id}`}>
                      <TableCell className="font-medium">{execution.moduleId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <Badge variant={getStatusVariant(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(execution.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {execution.completedAt
                          ? new Date(execution.completedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {duration ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedExecution(execution)}
                          data-testid={`button-view-${execution.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
          </DialogHeader>
          {selectedExecution && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Module ID</label>
                <p className="text-sm text-muted-foreground">{selectedExecution.moduleId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(selectedExecution.status)}>
                    {selectedExecution.status}
                  </Badge>
                </div>
              </div>
              {selectedExecution.input && (
                <div>
                  <label className="text-sm font-medium">Input</label>
                  <pre className="mt-1 bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(JSON.parse(selectedExecution.input), null, 2)}
                  </pre>
                </div>
              )}
              {selectedExecution.output && (
                <div>
                  <label className="text-sm font-medium">Output</label>
                  <pre className="mt-1 bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(JSON.parse(selectedExecution.output), null, 2)}
                  </pre>
                </div>
              )}
              {selectedExecution.error && (
                <div>
                  <label className="text-sm font-medium text-red-500">Error</label>
                  <p className="mt-1 text-sm text-red-500">{selectedExecution.error}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
