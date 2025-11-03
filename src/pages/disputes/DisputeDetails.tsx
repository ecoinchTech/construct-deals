import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetDisputeQuery, useUpdateDisputeMutation, useSubmitEvidenceMutation } from '@/store/api/disputeApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function DisputeDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetDisputeQuery(id!);
  const [updateDispute] = useUpdateDisputeMutation();
  const [submitEvidence] = useSubmitEvidenceMutation();

  const { user } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const dispute = data?.data?.dispute;

  const handleUpdateStatus = async () => {
    try {
      await updateDispute({ id: id!, status: status as any, resolution }).unwrap();
      toast.success('Dispute updated successfully');
      setStatus('');
      setResolution('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update dispute');
    }
  };

  const handleSubmitEvidence = async () => {
    if (!files || files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      await submitEvidence({ id: id!, description: evidenceDescription, files: formData }).unwrap();
      toast.success('Evidence submitted successfully');
      setEvidenceDescription('');
      setFiles(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit evidence');
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      open: 'destructive',
      under_review: 'default',
      resolved: 'outline',
      closed: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const getPriorityColor = (priority: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
    };
    return colors[priority] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="container mx-auto py-8">
        <p>Dispute not found</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'super_admin';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/disputes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Disputes
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{dispute.title}</h1>
            <Badge variant={getPriorityColor(dispute.priority)}>{dispute.priority}</Badge>
          </div>
          <p className="text-muted-foreground mt-2">{dispute.description}</p>
        </div>
        <Badge variant={getStatusColor(dispute.status)}>
          {dispute.status.replace('_', ' ')}
        </Badge>
      </div>

      {isAdmin && dispute.status !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle>Update Dispute Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(status === 'resolved' || status === 'closed') && (
              <div>
                <Label>Resolution</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the resolution..."
                  rows={4}
                />
              </div>
            )}
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dispute Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Raised On</p>
              <p className="font-semibold">{format(new Date(dispute.createdAt), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            {dispute.resolvedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Resolved On</p>
                <p className="font-semibold">{format(new Date(dispute.resolvedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            )}
          </div>
          {dispute.resolution && (
            <div>
              <p className="text-sm text-muted-foreground">Resolution</p>
              <p className="mt-1">{dispute.resolution}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>Supporting documents and files</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Evidence
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Evidence</DialogTitle>
                  <DialogDescription>Upload supporting documents for this dispute</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={evidenceDescription}
                      onChange={(e) => setEvidenceDescription(e.target.value)}
                      placeholder="Describe the evidence..."
                    />
                  </div>
                  <div>
                    <Label>Files</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmitEvidence}>Submit Evidence</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {dispute.evidence.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No evidence submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dispute.evidence.map((evidence) => (
                <Card key={evidence.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{evidence.description}</CardTitle>
                        <CardDescription>
                          Uploaded on {format(new Date(evidence.createdAt), 'MMM dd, yyyy HH:mm')}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={evidence.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
