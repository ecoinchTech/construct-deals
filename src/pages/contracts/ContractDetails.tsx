import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetContractQuery, useAcceptContractMutation, useDeclineContractMutation, useUpdateMilestoneProgressMutation, useApproveMilestoneMutation, useRejectMilestoneMutation } from '@/store/api/contractApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle, FileText, Calendar, DollarSign, Building, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function ContractDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetContractQuery(id!);
  const [acceptContract] = useAcceptContractMutation();
  const [declineContract] = useDeclineContractMutation();
  const [updateProgress] = useUpdateMilestoneProgressMutation();
  const [approveMilestone] = useApproveMilestoneMutation();
  const [rejectMilestone] = useRejectMilestoneMutation();

  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const contract = data?.data?.contract;

  const handleAccept = async () => {
    try {
      await acceptContract(id!).unwrap();
      toast.success('Contract accepted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to accept contract');
    }
  };

  const handleDecline = async () => {
    try {
      await declineContract(id!).unwrap();
      toast.success('Contract declined');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to decline contract');
    }
  };

  const handleUpdateProgress = async () => {
    try {
      await updateProgress({
        contractId: id!,
        milestoneId: selectedMilestone.id,
        progress,
        notes,
      }).unwrap();
      toast.success('Progress updated successfully');
      setSelectedMilestone(null);
      setProgress(0);
      setNotes('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update progress');
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      await approveMilestone({ contractId: id!, milestoneId }).unwrap();
      toast.success('Milestone approved');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve milestone');
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    try {
      await rejectMilestone({ contractId: id!, milestoneId, reason: rejectionReason }).unwrap();
      toast.success('Milestone rejected');
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject milestone');
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      draft: 'secondary',
      active: 'default',
      completed: 'outline',
      terminated: 'destructive',
      pending: 'secondary',
      in_progress: 'default',
      approved: 'outline',
      rejected: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-8">
        <p>Contract not found</p>
      </div>
    );
  }

  const isVendor = user?.role === 'vendor';
  const isOrgUser = user?.role === 'org_owner' || user?.role === 'facility_manager';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/contracts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contracts
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{contract.title}</h1>
          <p className="text-muted-foreground mt-2">{contract.description}</p>
        </div>
        <Badge variant={getStatusColor(contract.status)}>{contract.status}</Badge>
      </div>

      {contract.status === 'draft' && isVendor && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Action Required</CardTitle>
            <CardDescription>Please review and accept or decline this contract</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleAccept}>Accept Contract</Button>
            <Button variant="destructive" onClick={handleDecline}>Decline Contract</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{contract.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.vendorName}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.organizationName}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="details">Contract Details</TabsTrigger>
          <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Track progress and manage milestone completion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(milestone.status)}>{milestone.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-semibold">₹{milestone.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className="font-semibold">
                          {format(new Date(milestone.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    {milestone.progress !== undefined && (
                      <div>
                        <div className="flex justify-between mb-2">
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-sm font-semibold">{milestone.progress}%</p>
                        </div>
                        <Progress value={milestone.progress} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {isVendor && milestone.status === 'in_progress' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedMilestone(milestone)}>
                              Update Progress
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Milestone Progress</DialogTitle>
                              <DialogDescription>
                                Update the progress for {milestone.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Progress (%)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={progress}
                                  onChange={(e) => setProgress(Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>Notes</Label>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Add any notes about this update..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={handleUpdateProgress}>Update Progress</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      {isOrgUser && milestone.status === 'completed' && (
                        <>
                          <Button onClick={() => handleApproveMilestone(milestone.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="destructive">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Milestone</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this milestone
                                </DialogDescription>
                              </DialogHeader>
                              <div>
                                <Label>Rejection Reason</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter reason for rejection..."
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectMilestone(milestone.id)}
                                >
                                  Confirm Rejection
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{format(new Date(contract.startDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-semibold">{format(new Date(contract.endDate), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-semibold">{format(new Date(contract.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">{format(new Date(contract.updatedAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap">{contract.terms}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
