import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetBidComparisonQuery } from '@/store/api/bidApi';
import { useGetRFQQuery } from '@/store/api/rfqApi';
import { useCreateContractMutation } from '@/store/api/contractApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, TrendingUp, Clock, Star, Award, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { format } from 'date-fns';

const BidComparison = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rfqData, isLoading: rfqLoading } = useGetRFQQuery(id!);
  const { data: comparisonData, isLoading: comparisonLoading } = useGetBidComparisonQuery(id!);
  const [createContract, { isLoading: isCreatingContract }] = useCreateContractMutation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [showAwardDialog, setShowAwardDialog] = useState(false);
  const [selectedBidVendorId, setSelectedBidVendorId] = useState<string>('');
  const [contractDetails, setContractDetails] = useState({
    startDate: '',
    endDate: '',
    terms: '',
  });

  const rfq = rfqData?.data?.rfq;
  const comparison = comparisonData?.data?.comparison || [];
  const weights = comparisonData?.data?.evaluationWeights;

  const isLoading = rfqLoading || comparisonLoading;
  const isFacilityManager = user?.role === 'facility_manager' || user?.role === 'org_owner';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!rfq || comparison.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No bids to compare</p>
          <Button className="mt-4" asChild>
            <Link to={`/rfqs/${id}`}>Back to RFQ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sortedBids = [...comparison].sort((a, b) => b.finalScore - a.finalScore);
  const topBid = sortedBids[0];

  const handleAwardContract = async () => {
    try {
      // Find the selected bid data
      const selectedBid = comparison.find((bid) => bid.vendorId === selectedBidVendorId);
      
      if (!selectedBid || !rfq) {
        toast.error('Unable to find bid details');
        return;
      }

      console.log('selectedBid ', selectedBid);

      // Create milestone structure (split payment evenly for now)
      const milestones = [
        {
          title: 'Project Kickoff',
          description: 'Initial milestone upon contract acceptance',
          amount: selectedBid.totalAmount * 0.3,
          dueDate: contractDetails.startDate,
        },
        {
          title: 'Mid-Project Review',
          description: 'Milestone for mid-project completion',
          amount: selectedBid.totalAmount * 0.4,
          dueDate: new Date(new Date(contractDetails.startDate).getTime() + (new Date(contractDetails.endDate).getTime() - new Date(contractDetails.startDate).getTime()) / 2).toISOString(),
        },
        {
          title: 'Project Completion',
          description: 'Final milestone upon project completion',
          amount: selectedBid.totalAmount * 0.3,
          dueDate: contractDetails.endDate,
        },
      ];

      const payload = {
        rfqId: id!,
        bidId: selectedBid.bidId, // Assuming vendorId is used as bidId

        // title: rfq.title,
        // description: `Contract for ${rfq.title}`,
        // totalAmount: selectedBid.totalAmount,
        // startDate: contractDetails.startDate,
        // endDate: contractDetails.endDate,
        // milestones,
        // terms: contractDetails.terms || 'Standard contract terms and conditions apply.',
      };
      console.log(payload);

      const result = await createContract(payload).unwrap();
      toast.success('Contract awarded successfully!');
      setShowAwardDialog(false);
      
      // Navigate to contract details
      if (result?.data?.contract?._id) {
        navigate(`/contracts/${result.data.contract._id}`);
      } else {
        navigate('/contracts');
      }
    } catch (error: any) {
      console.error('Error awarding contract:', error);
      toast.error(error?.data?.message || 'Failed to award contract');
    }
  };

  const openAwardDialog = (vendorId: string) => {
    setSelectedBidVendorId(vendorId);
    setShowAwardDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/rfqs/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bid Comparison</h1>
          <p className="text-muted-foreground mt-1">{rfq.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Ranked Bid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
            <div>
              <p className="text-2xl font-bold">{topBid.vendorName}</p>
              <p className="text-sm text-muted-foreground">Highest evaluation score</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {topBid.finalScore ? topBid.finalScore.toFixed(1) : '0.0'}
              </p>
              <p className="text-sm text-muted-foreground">Total Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Criteria Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">{weights?.price}%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Timeline</p>
              <p className="text-2xl font-bold">{weights?.timeline}%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="text-2xl font-bold">{weights?.experience}%</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Quality</p>
              <p className="text-2xl font-bold">{weights?.quality}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>All bids ranked by evaluation score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Vendor</th>
                  <th className="text-right p-3">Total Amount</th>
                  <th className="text-right p-3">Timeline</th>
                  <th className="text-right p-3">Price Score</th>
                  <th className="text-right p-3">Timeline Score</th>
                  <th className="text-right p-3">Experience</th>
                  <th className="text-right p-3">Quality</th>
                  <th className="text-right p-3">Final Score</th>
                  <th className="text-center p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedBids.map((bid, index) => (
                  <tr key={bid.vendorId} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="p-3 font-medium">{bid.vendorName}</td>
                    <td className="p-3 text-right">${bid.totalAmount.toLocaleString()}</td>
                    <td className="p-3 text-right">{bid.timelineDays} days</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{bid.priceScore ? bid.priceScore.toFixed(1) : '0.0'}</span>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{bid.timelineScore ? bid.timelineScore.toFixed(1) : '0.0'}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{bid.experienceScore ? bid.experienceScore.toFixed(1) : '0.0'}</span>
                        <Star className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">{bid.qualityScore ? bid.qualityScore.toFixed(1) : '0.0'}</td>
                    <td className="p-3 text-right">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-primary' : ''}`}>
                        {bid.finalScore ? bid.finalScore.toFixed(1) : '0.0'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {isFacilityManager && rfq?.status !== 'awarded' && (
                          <Button 
                            size="sm" 
                            onClick={() => openAwardDialog(bid.vendorId)}
                            className="gap-1"
                          >
                            <Trophy className="h-3 w-3" />
                            Award
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>BOQ Breakdown Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-center p-2">Unit</th>
                  <th className="text-right p-2">Qty</th>
                  {sortedBids.map((bid) => (
                    <th key={bid.vendorId} className="text-right p-2">
                      {bid.vendorName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rfq.boqId?.items?.map((item, itemIndex) => (
                  <tr key={item.id || itemIndex} className="border-b">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.unit}</td>
                    <td className="p-2 text-right">{item.quantity}</td>

                    {sortedBids.map((bid) => {
                      const bidItem = bid?.breakdown?.[itemIndex]; // ✅ Safe optional chaining
                      return (
                        <td key={bid.vendorId} className="p-2 text-right">
                          {bidItem?.rate !== undefined
                            ? `$${bidItem.rate.toFixed(2)}`
                            : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <Link to={`/rfqs/${id}`}>
            Back to RFQ
          </Link>
        </Button>
      </div>

      {/* Award Contract Dialog */}
      <Dialog open={showAwardDialog} onOpenChange={setShowAwardDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Award Contract
            </DialogTitle>
            <DialogDescription>
              Create a contract for the selected vendor. This will change the RFQ status to "awarded".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Selected Vendor</Label>
              <Input 
                value={comparison.find(b => b.vendorId === selectedBidVendorId)?.vendorName || ''} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input 
                  value={`₹${comparison.find(b => b.vendorId === selectedBidVendorId)?.totalAmount?.toLocaleString() || 0}`} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <Input 
                  value={`${comparison.find(b => b.vendorId === selectedBidVendorId)?.timelineDays || 0} days`} 
                  disabled 
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Contract Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={contractDetails.startDate}
                  onChange={(e) => setContractDetails({ ...contractDetails, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Contract End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={contractDetails.endDate}
                  onChange={(e) => setContractDetails({ ...contractDetails, endDate: e.target.value })}
                  min={contractDetails.startDate}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={contractDetails.terms}
                onChange={(e) => setContractDetails({ ...contractDetails, terms: e.target.value })}
                placeholder="Enter contract terms and conditions..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                If left empty, standard terms will be applied
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Milestone Structure (Auto-generated)</h4>
              <div className="text-sm space-y-1">
                <p>• Kickoff (30%): Due on start date</p>
                <p>• Mid-project (40%): Due at mid-point</p>
                <p>• Completion (30%): Due on end date</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAwardDialog(false)} disabled={isCreatingContract}>
              Cancel
            </Button>
            <Button 
              onClick={handleAwardContract} 
              disabled={!contractDetails.startDate || !contractDetails.endDate || isCreatingContract}
            >
              {isCreatingContract ? 'Creating Contract...' : 'Award Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidComparison;
