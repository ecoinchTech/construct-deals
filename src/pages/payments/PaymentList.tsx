import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetPaymentsQuery } from '@/store/api/paymentApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import RoleGuard from '@/components/common/RoleGuard';
import { PaymentStatus, PaymentMethod } from '@/types/payment.types';

const PaymentList = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPaymentsQuery({
    status: statusFilter as PaymentStatus,
    page,
    limit: 10,
  });

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      processing: { variant: 'default', icon: RefreshCw },
      completed: { variant: 'outline', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      refunded: { variant: 'outline', icon: RefreshCw },
    };

    const { variant, icon: Icon } = variants[status];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getMethodIcon = (method: PaymentMethod) => {
    return <CreditCard className="h-4 w-4" />;
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'org_owner', 'facility_manager', 'vendor']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground">Track and manage payments</p>
          </div>
          <Link to="/dashboard/payments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>View all payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-medium">
                          {payment.transactionId || payment._id.slice(-8)}
                        </TableCell>
                        <TableCell>{payment.invoiceId}</TableCell>
                        <TableCell className="font-bold">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            {payment.method.replace('_', ' ').toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default PaymentList;
