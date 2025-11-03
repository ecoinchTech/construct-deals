import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateInvoiceMutation } from '@/store/api/invoiceApi';
import { useGetContractQuery } from '@/store/api/contractApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceLineItem } from '@/types/invoice.types';

interface InvoiceFormData {
  milestoneId: string;
  amount: number;
  lineItems: InvoiceLineItem[];
  dueDate: string;
  notes?: string;
}

export default function InvoiceForm() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();
  const { data: contractData } = useGetContractQuery(contractId!);
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const contract = contractData?.data?.contract;
  const completedMilestones = contract?.milestones.filter(m => m.status === 'approved') || [];

  const { register, handleSubmit, control, watch, setValue } = useForm<InvoiceFormData>({
    defaultValues: {
      lineItems: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  const lineItems = watch('lineItems');

  const calculateLineItemAmount = (index: number) => {
    const item = lineItems[index];
    const amount = item.quantity * item.rate;
    setValue(`lineItems.${index}.amount`, amount);
    return amount;
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const total = calculateTotal();
      await createInvoice({
        contractId: contractId!,
        milestoneId: data.milestoneId,
        amount: total,
        lineItems: data.lineItems,
        dueDate: data.dueDate,
        notes: data.notes,
      }).unwrap();

      toast.success('Invoice created successfully');
      navigate(`/contracts/${contractId}/invoices`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/contracts/${contractId}/invoices`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">Generate a new invoice for completed milestone</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Milestone</Label>
              <Select onValueChange={(value) => setValue('milestoneId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone" />
                </SelectTrigger>
                <SelectContent>
                  {completedMilestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title} - ₹{milestone.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input type="date" {...register('dueDate', { required: true })} />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea {...register('notes')} placeholder="Add any additional notes..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <Label>Description</Label>
                  <Input
                    {...register(`lineItems.${index}.description`, { required: true })}
                    placeholder="Item description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    {...register(`lineItems.${index}.quantity`, {
                      required: true,
                      valueAsNumber: true,
                      onChange: () => calculateLineItemAmount(index),
                    })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Rate</Label>
                  <Input
                    type="number"
                    {...register(`lineItems.${index}.rate`, {
                      required: true,
                      valueAsNumber: true,
                      onChange: () => calculateLineItemAmount(index),
                    })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    {...register(`lineItems.${index}.amount`)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Subtotal:</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">GST (18%):</span>
                    <span>₹{(calculateTotal() * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{(calculateTotal() * 1.18).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/contracts/${contractId}/invoices`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
