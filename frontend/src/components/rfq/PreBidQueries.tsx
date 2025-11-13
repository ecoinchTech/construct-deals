import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetPreBidQueriesQuery, useCreatePreBidQueryMutation, useRespondToQueryMutation } from '@/store/api/preBidQueryApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { MessageSquare, Send, Reply, Calendar } from 'lucide-react';

interface PreBidQueriesProps {
  rfqId: string;
  preBidDeadline?: string;
}

const PreBidQueries = ({ rfqId, preBidDeadline }: PreBidQueriesProps) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetPreBidQueriesQuery(rfqId);
  const [createQuery, { isLoading: isCreating }] = useCreatePreBidQueryMutation();
  const [respondToQuery] = useRespondToQueryMutation();

  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState<string>('');
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const queries = data?.data?.queries || [];
  const isVendor = user?.role === 'vendor';
  const isOrgUser = user?.role === 'org_owner' || user?.role === 'facility_manager';

  const isPastDeadline = preBidDeadline ? new Date(preBidDeadline) < new Date() : false;

  const handleSubmitQuery = async () => {
    if (!category || !question.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await createQuery({ rfqId, category, question }).unwrap();
      toast.success('Query submitted successfully');
      setQueryDialogOpen(false);
      setCategory('');
      setQuestion('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit query');
    }
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await respondToQuery({ queryId: selectedQueryId, response }).unwrap();
      toast.success('Response submitted successfully');
      setRespondDialogOpen(false);
      setResponse('');
      setSelectedQueryId('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit response');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pre-Bid Queries
            </CardTitle>
            <CardDescription>
              {preBidDeadline && (
                <span className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Deadline: {new Date(preBidDeadline).toLocaleString()}
                  {isPastDeadline && <Badge variant="destructive">Expired</Badge>}
                </span>
              )}
            </CardDescription>
          </div>
          {isVendor && !isPastDeadline && (
            <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Query
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Pre-Bid Query</DialogTitle>
                  <DialogDescription>
                    Ask questions about the RFQ requirements, specifications, or terms
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Specifications</SelectItem>
                        <SelectItem value="commercial">Commercial Terms</SelectItem>
                        <SelectItem value="timeline">Timeline & Schedule</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="eligibility">Eligibility Criteria</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Question *</Label>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter your question..."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setQueryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitQuery} disabled={isCreating}>
                    Submit Query
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {queries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No queries submitted yet
          </p>
        ) : (
          <div className="space-y-4">
            {queries.map((query) => (
              <div key={query.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{query.category}</Badge>
                      <Badge variant={query.status === 'answered' ? 'default' : 'secondary'}>
                        {query.status}
                      </Badge>
                      {!isVendor && (
                        <span className="text-sm text-muted-foreground">
                          by {query.vendorName}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">Question:</p>
                    <p className="text-sm">{query.question}</p>
                    
                    {query.response && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-4 w-4" />
                          <p className="text-sm font-medium">Response:</p>
                        </div>
                        <p className="text-sm">{query.response}</p>
                        {query.respondedByName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {query.respondedByName} on {new Date(query.respondedAt!).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {isOrgUser && query.status === 'pending' && (
                    <Dialog open={respondDialogOpen && selectedQueryId === query.id} onOpenChange={(open) => {
                      setRespondDialogOpen(open);
                      if (open) setSelectedQueryId(query.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Reply className="mr-2 h-4 w-4" />
                          Respond
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respond to Query</DialogTitle>
                          <DialogDescription>
                            Provide a clear answer to the vendor's question
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm font-medium mb-1">Question:</p>
                            <p className="text-sm">{query.question}</p>
                          </div>
                          <div>
                            <Label>Response *</Label>
                            <Textarea
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              placeholder="Enter your response..."
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setRespondDialogOpen(false);
                            setResponse('');
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={handleSubmitResponse}>
                            Submit Response
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(query.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreBidQueries;
