import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateRatingMutation } from '@/store/api/ratingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function RatingForm() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const [createRating, { isLoading }] = useCreateRatingMutation();

  const [qualityRating, setQualityRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!qualityRating || !timelinessRating || !communicationRating || !professionalismRating) {
      toast.error('Please provide all ratings');
      return;
    }

    try {
      await createRating({
        contractId: contractId!,
        qualityScore: qualityRating,
        timelinessScore: timelinessRating,
        communicationScore: communicationRating,
        comments: review,
      }).unwrap();

      toast.success('Rating submitted successfully');
      navigate(`/contracts/${contractId}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit rating');
    }
  };

  const RatingStars = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/contracts/${contractId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Rate Vendor Performance</h1>
        <p className="text-muted-foreground">Share your experience with this vendor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Ratings</CardTitle>
            <CardDescription>Rate the vendor on different aspects of their service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RatingStars
              label="Quality of Work"
              value={qualityRating}
              onChange={setQualityRating}
            />
            <RatingStars
              label="Timeliness"
              value={timelinessRating}
              onChange={setTimelinessRating}
            />
            <RatingStars
              label="Communication"
              value={communicationRating}
              onChange={setCommunicationRating}
            />
            <RatingStars
              label="Professionalism"
              value={professionalismRating}
              onChange={setProfessionalismRating}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Written Review</CardTitle>
            <CardDescription>Share your detailed feedback (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Describe your experience working with this vendor..."
              rows={6}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/contracts/${contractId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </div>
      </form>
    </div>
  );
}
