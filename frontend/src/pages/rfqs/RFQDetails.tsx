import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetRFQQuery, usePublishRFQMutation, useAddAddendumMutation, useUploadAttachmentMutation } from '@/store/api/rfqApi';
import { useGetBidsByRFQQuery } from '@/store/api/bidApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PreBidQueries from '@/components/rfq/PreBidQueries';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, DollarSign, Building, FileText, Upload, Send, Plus, Download } from 'lucide-react';

const RFQDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading } = useGetRFQQuery(id!);
  const { data: bidsData } = useGetBidsByRFQQuery(id!);
  const [publishRFQ] = usePublishRFQMutation();
  const [addAddendum] = useAddAddendumMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();

  const [addendumOpen, setAddendumOpen] = useState(false);
  const [addendumTitle, setAddendumTitle] = useState('');
  const [addendumDesc, setAddendumDesc] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const rfq = data?.data?.rfq;
  const bids = bidsData?.data?.bids || [];

  const handlePublish = async () => {
    try {
      await publishRFQ(id!).unwrap();
      toast.success('RFQ published successfully');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to publish RFQ');
    }
  };

  const handleAddAddendum = async () => {
    if (!addendumTitle.trim() || !addendumDesc.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await addAddendum({ id: id!, title: addendumTitle, description: addendumDesc }).unwrap();
      toast.success('Addendum added successfully');
      setAddendumOpen(false);
      setAddendumTitle('');
      setAddendumDesc('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add addendum');
    }
  };

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      await uploadAttachment({ id: id!, files: formData }).unwrap();
      toast.success('Attachments uploaded successfully');
      setFiles(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload attachments');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rfq) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">RFQ not found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'outline',
      published: 'default',
      closed: 'secondary',
      awarded: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/rfqs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{rfq.title}</h1>
          <p className="text-muted-foreground mt-1">RFQ Details</p>
        </div>
        {getStatusBadge(rfq.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${rfq.estBudgetMin?.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              to ${rfq.estBudgetMax?.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Close Date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Date(rfq.closeDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Bids Received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bids.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              BOQ Items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rfq.boqId?.items?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {rfq.status === 'draft' && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">This RFQ is in draft status</p>
                <p className="text-sm text-muted-foreground">Publish it to make it visible to vendors</p>
              </div>
              <Button onClick={handlePublish}>
                <Send className="mr-2 h-4 w-4" />
                Publish RFQ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="boq">BOQ</TabsTrigger>
          <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
          <TabsTrigger value="queries">Pre-Bid Queries</TabsTrigger>
          <TabsTrigger value="addenda">Addenda ({rfq.addenda.length})</TabsTrigger>
          <TabsTrigger value="attachments">Attachments ({rfq.attachments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{rfq.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Building</p>
                  <p className="font-medium">{rfq.buildingId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{rfq.categoryId?.name}</p>
                </div>
              </div>
              {rfq.preBidQueryDeadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Pre-Bid Query Deadline</p>
                  <p className="font-medium">
                    {new Date(rfq.preBidQueryDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">{rfq.evaluationWeights?.priceWeight}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className="text-2xl font-bold">{rfq.evaluationWeights?.timelineWeight}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{rfq.evaluationWeights?.ratingWeight}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certification</p>
                  <p className="text-2xl font-bold">{rfq.evaluationWeights?.certificationWeight}%</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Maximum Price</p>
                  <p className="text-lg font-bold">${rfq.evaluationWeights?.maxPrice?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Maximum Timeline</p>
                  <p className="text-lg font-bold">{rfq.evaluationWeights?.maxTimeline} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Visibility</p>
                  <p className="font-medium capitalize">{rfq.visibility}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{rfq.createdBy?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">{new Date(rfq.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(rfq.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {rfq.preBidQueryDeadline && (
            <Card>
              <CardHeader>
                <CardTitle>Pre-Bid Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pre-Bid Query Deadline</p>
                    <p className="font-medium">
                      {new Date(rfq.preBidQueryDeadline).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {rfq.eligibilityCriteria && rfq.eligibilityCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rfq.eligibilityCriteria.map((criteria, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{criteria.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{criteria.description}</p>
                      <Badge variant={criteria.type === 'mandatory' ? 'destructive' : 'outline'} className="mt-2">
                        {criteria.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


        </TabsContent>

        <TabsContent value="boq">
          <Card>
            <CardHeader>
              <CardTitle>Bill of Quantities</CardTitle>
              <CardDescription>
                BOQ Version {rfq.boqId?.version} • Created {new Date(rfq.boqId?.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-left p-3 font-medium">Unit</th>
                      <th className="text-right p-3 font-medium">Quantity</th>
                      <th className="text-right p-3 font-medium">Baseline Rate</th>
                      <th className="text-right p-3 font-medium">Total Amount</th>
                      <th className="text-left p-3 font-medium">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.boqId?.items?.map((item, index) => {
                      const totalAmount = item.quantity * (item.baselineRate || 0);
                      return (
                        <tr key={item._id || index} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{index + 1}</td>
                          <td className="p-3">{item.description}</td>
                          <td className="p-3">{item.unit}</td>
                          <td className="p-3 text-right">{item.quantity.toLocaleString()}</td>
                          <td className="p-3 text-right">
                            {item.baselineRate ? `$${item.baselineRate.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {item.baselineRate ? `$${totalAmount.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{item.spec || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {rfq.boqId?.items?.some(item => item.baselineRate) && (
                    <tfoot>
                      <tr className="border-t bg-muted/50 font-medium">
                        <td colSpan={5} className="p-3 text-right">Grand Total:</td>
                        <td className="p-3 text-right">
                          ${rfq.boqId?.items?.reduce((total, item) =>
                            total + (item.quantity * (item.baselineRate || 0)), 0
                          ).toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {(!rfq.boqId?.items || rfq.boqId.items.length === 0) && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No BOQ items found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Submitted Bids</CardTitle>
                {bids.length > 0 && (
                  <Button asChild>
                    <Link to={`/rfqs/${id}/bids`}>
                      Compare Bids
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bids submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid) => (
                    <Link key={bid._id} to={`/bids/${bid._id}`}>
                      <div className="p-4 border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{bid.vendorName}</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {new Date(bid.createdAt).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-1">{bid.status}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              ${(bid.financialBid?.totalAmount || bid.totalAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {bid.financialBid?.timelineDays || bid.timelineDays || 0} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries">
          <PreBidQueries rfqId={id!} preBidDeadline={rfq.preBidQueryDeadline} />
        </TabsContent>

        <TabsContent value="addenda">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Addenda</CardTitle>
                <Dialog open={addendumOpen} onOpenChange={setAddendumOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Addendum
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Addendum</DialogTitle>
                      <DialogDescription>Add clarifications or changes to this RFQ</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={addendumTitle}
                          onChange={(e) => setAddendumTitle(e.target.value)}
                          placeholder="Addendum title"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={addendumDesc}
                          onChange={(e) => setAddendumDesc(e.target.value)}
                          placeholder="Addendum details..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddendumOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddAddendum}>Add Addendum</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!rfq.addenda || rfq.addenda.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No addenda</p>
              ) : (
                <div className="space-y-3">
                  {rfq.addenda.map((addendum) => (
                    <div key={addendum._id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{addendum.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{addendum.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(addendum.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                  id="attachment-upload"
                />
                <label htmlFor="attachment-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">Click to upload attachments</p>
                </label>
              </div>

              {files && (
                <>
                  <div className="space-y-2">
                    {Array.from(files).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm flex-1">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleUpload} className="w-full">Upload Files</Button>
                </>
              )}

              {rfq.attachments && rfq.attachments.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {rfq.attachments.map((attachment) => (
                    <div key={attachment._id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{attachment.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={attachment.url} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {user?.role === 'vendor' && rfq.status === 'published' && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Interested in this project?</p>
                <p className="text-sm text-muted-foreground">Submit your two-stage bid before the closing date</p>
              </div>
              <Button asChild>
                <Link to={`/rfqs/${id}/submit-bid`}>
                  Submit Bid
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RFQDetails;