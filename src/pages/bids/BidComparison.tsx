import { useParams, Link } from 'react-router-dom';
import { useGetBidComparisonQuery } from '@/store/api/bidApi';
import { useGetRFQQuery } from '@/store/api/rfqApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp, Clock, Star, Award } from 'lucide-react';

const BidComparison = () => {
  const { id } = useParams<{ id: string }>();
  const { data: rfqData, isLoading: rfqLoading } = useGetRFQQuery(id!);
  const { data: comparisonData, isLoading: comparisonLoading } = useGetBidComparisonQuery(id!);

  const rfq = rfqData?.data?.rfq;
  const comparison = comparisonData?.data?.comparison || [];
  const weights = comparisonData?.data?.evaluationWeights;

  const isLoading = rfqLoading || comparisonLoading;

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
              <p className="text-3xl font-bold text-primary">{topBid.finalScore.toFixed(1)}</p>
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
                        <span>{bid.priceScore.toFixed(1)}</span>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{bid.timelineScore.toFixed(1)}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>{bid.experienceScore.toFixed(1)}</span>
                        <Star className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </td>
                    <td className="p-3 text-right">{bid.qualityScore.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <span className={`text-lg font-bold ${index === 0 ? 'text-primary' : ''}`}>
                        {bid.finalScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
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
                {rfq.boqId?.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.description}</td>
                    <td className="p-2 text-center">{item.unit}</td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    {sortedBids.map((bid) => {
                      const bidItem = bid.breakdown.find(b => b.boqItemId === item.id);
                      return (
                        <td key={bid.vendorId} className="p-2 text-right">
                          {bidItem ? `$${bidItem.rate.toFixed(2)}` : '-'}
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
    </div>
  );
};

export default BidComparison;
