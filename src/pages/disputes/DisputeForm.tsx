import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCreateDisputeMutation } from '@/store/api/disputeApi';
import { useGetContractsQuery } from '@/store/api/contractApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface DisputeFormData {
  contractId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export default function DisputeForm() {
  const navigate = useNavigate();
  const { data: contractsData } = useGetContractsQuery({ page: 1, limit: 100 });
  const [createDispute, { isLoading }] = useCreateDisputeMutation();

  const contracts = contractsData?.data?.contracts || [];
  const activeContracts = contracts.filter(c => c.status === 'active');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DisputeFormData>();

  const onSubmit = async (data: DisputeFormData) => {
    try {
      await createDispute(data).unwrap();
      toast.success('Dispute raised successfully');
      navigate('/disputes');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to raise dispute');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/disputes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Disputes
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Raise Dispute</h1>
        <p className="text-muted-foreground">Submit a dispute for contract resolution</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Contract</Label>
              <Select onValueChange={(value) => setValue('contractId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract" />
                </SelectTrigger>
                <SelectContent>
                  {activeContracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.title} - {contract.vendorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contractId && (
                <p className="text-sm text-destructive mt-1">Contract is required</p>
              )}
            </div>

            <div>
              <Label>Title</Label>
              <Input
                {...register('title', { required: true })}
                placeholder="Brief description of the issue"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">Title is required</p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                {...register('description', { required: true })}
                placeholder="Detailed explanation of the dispute..."
                rows={6}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">Description is required</p>
              )}
            </div>

            <div>
              <Label>Priority</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive mt-1">Priority is required</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/disputes')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Raise Dispute'}
          </Button>
        </div>
      </form>
    </div>
  );
}
