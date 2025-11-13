// src/pages/contractDetails.jsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetContractQuery, useAcceptContractMutation, useApproveContractMutation, useDeclineContractMutation, useUpdateMilestoneProgressMutation, useApproveMilestoneMutation, useRejectMilestoneMutation } from '@/store/api/contractApi';
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
  const [approveContract] = useApproveContractMutation();
  const [declineContract] = useDeclineContractMutation();
  const [updateProgress] = useUpdateMilestoneProgressMutation();
  const [approveMilestone] = useApproveMilestoneMutation();
  const [rejectMilestone] = useRejectMilestoneMutation();

  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [declineReason, setDeclineReason] = useState('');

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
  const handleApprove = async () => {
    try {
      await approveContract(id!).unwrap();
      toast.success('Contract approved successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve contract');
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining the contract');
      return;
    }

    try {
      await declineContract({ id: id!, reason: declineReason }).unwrap();
      toast.success('Contract declined');
      refetch();
      setDeclineReason('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to decline contract');
    }
  };

  const handleUpdateProgress = async () => {
    try {
      await updateProgress({
        contractId: id!,
        milestoneId: selectedMilestone._id,
        comment,
        percentage: progress,
      }).unwrap();
      toast.success('Progress updated successfully');
      setSelectedMilestone(null);
      setProgress(0);
      setComment('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update progress');
    }
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    try {
      await approveMilestone({
        contractId: id!,
        milestoneId,
        comment: 'Milestone approved'
      }).unwrap();
      toast.success('Milestone approved');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve milestone');
    }
  };

  const handleRejectMilestone = async (milestoneId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejecting this milestone');
      return;
    }

    try {
      await rejectMilestone({
        contractId: id!,
        milestoneId,
        comment: rejectionReason
      }).unwrap();
      toast.success('Milestone rejected');
      setRejectionReason('');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject milestone');
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      pending_vendor_acceptance: 'secondary',
      pending_org_approval: 'secondary',
      active: 'default',
      completed: 'outline',
      declined: 'destructive',
      pending: 'secondary',
      in_progress: 'default',
      approved: 'outline',
      rejected: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const getMilestoneProgress = (milestone: any) => {
    if (milestone.progressUpdates.length === 0) return 0;
    return milestone.progressUpdates[milestone.progressUpdates.length - 1].percentage;
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
  const isOrgOwner = user?.role === 'org_owner';
  const isFacilityManager = user?.role === 'facility_manager';
  const isOrgUser = isOrgOwner || isFacilityManager;

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
          <h1 className="text-3xl font-bold">{contract.rfqId.title}</h1>
          <p className="text-muted-foreground mt-2">{contract.rfqId.description}</p>
        </div>
        <Badge variant={getStatusColor(contract.status)}>
          {contract.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>

      {contract.status === 'pending_vendor_acceptance' && isVendor && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Action Required</CardTitle>
            <CardDescription>Please review and accept or decline this contract</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleAccept}>Accept Contract</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Decline Contract</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Decline Contract</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for declining this contract
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="declineReason">Reason</Label>
                  <Textarea
                    id="declineReason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Enter reason for declining..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleDecline}>
                    Confirm Decline
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {contract.status === 'pending_org_approval' && isOrgOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Approval Required</CardTitle>
            <CardDescription>The vendor has accepted this contract. Please review and approve it to begin work.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleApprove}>Approve Contract</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">Reject Contract</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Contract</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this contract
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="rejectReason">Reason</Label>
                  <Textarea
                    id="rejectReason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="destructive" onClick={handleDecline}>
                    Confirm Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
            <div className="text-2xl font-bold">₹{contract.totalContractValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.awardedTo.companyName}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected End Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(contract.expectedEndDate), 'MMM dd, yyyy')}
            </div>
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
                <Card key={milestone._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <CardDescription>{milestone.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(milestone.status)}>
                        {milestone.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
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

                    <div>
                      <div className="flex justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-sm font-semibold">{getMilestoneProgress(milestone)}%</p>
                      </div>
                      <Progress value={getMilestoneProgress(milestone)} />
                    </div>

                    {milestone.progressUpdates.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Recent Updates</p>
                        <div className="space-y-2">
                          {milestone.progressUpdates.slice(-3).reverse().map((update, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">{update.percentage}%</span>
                                <span>{format(new Date(update.updateDate), 'MMM dd, yyyy')}</span>
                              </div>
                              <p className="text-gray-600 mt-1">{update.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}


                    <div className="flex gap-2">
                      {isVendor && contract.status === 'active' &&
                        (milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'rejected') && (
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
                                  <Label htmlFor="progress">Progress (%)</Label>
                                  <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={(e) => setProgress(Number(e.target.value))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="comment">Comment</Label>
                                  <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
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

                      {isOrgUser && contract.status === 'active' &&
                        (milestone.status === 'completed' || milestone.status === 'rejected') && (
                          <>
                            <Button onClick={() => handleApproveMilestone(milestone._id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {milestone.status === 'rejected' && milestone.progressUpdates.length > 0 && (
                                <div className="mt-2 p-2 bg-red-50 rounded">
                                  <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                                  <p className="text-sm text-red-600">
                                    {milestone.progressUpdates[milestone.progressUpdates.length - 1].comment}
                                  </p>
                                </div>
                              )}
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
                                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                  />
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRejectMilestone(milestone._id)}
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
                  <p className="font-semibold">
                    {contract.startDate
                      ? format(new Date(contract.startDate), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Expected End Date</p>
                  <p className="font-semibold">
                    {contract.expectedEndDate
                      ? format(new Date(contract.expectedEndDate), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-semibold">
                    {contract.createdAt
                      ? format(new Date(contract.createdAt), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">
                    {contract.updatedAt
                      ? format(new Date(contract.updatedAt), 'MMM dd, yyyy')
                      : '—'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Signed by Organization</p>
                  <p className="font-semibold">
                    {contract.signedByOrg ? 'Yes' : 'No'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Signed by Vendor</p>
                  <p className="font-semibold">
                    {contract.signedByVendor ? 'Yes' : 'No'}
                  </p>
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
                <p>{contract.paymentTerms}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}