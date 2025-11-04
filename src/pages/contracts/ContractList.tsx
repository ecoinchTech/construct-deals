import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetContractsQuery } from '@/store/api/contractApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Search, Calendar, Building, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function ContractList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

const { data, isLoading } = useGetContractsQuery({ 
    page, 
    limit: 10, 
    status: status === 'all' ? '' : status // Send empty string for "all" status
  });


  const contracts = data?.data?.contracts || [];
  const pagination = data?.pagination;

const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      draft: 'secondary',
      active: 'default',
      completed: 'outline',
      terminated: 'destructive',
    };
    return colors[status] || 'secondary';
  };


const filteredContracts = contracts.filter((contract: any) => {
  const searchTerm = search.toLowerCase();
  return (
    contract.rfqId?.title?.toLowerCase().includes(searchTerm) ||
    contract.awardedTo?.companyName?.toLowerCase().includes(searchTerm)
  );
});

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage all your service contracts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
  <SelectItem value="all">All Statuses</SelectItem> {/* ← Change empty string to "all" */}
  <SelectItem value="draft">Draft</SelectItem>
  <SelectItem value="active">Active</SelectItem>
  <SelectItem value="completed">Completed</SelectItem>
  <SelectItem value="terminated">Terminated</SelectItem>
</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No contracts found</h3>
              <p className="text-muted-foreground">Start by awarding a bid to create a contract</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContracts.map((contract: any) => (
                <Card
                  key={contract._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/contracts/${contract._id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{contract.rfqId?.title || 'N/A'}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {contract.awardedTo?.companyName || 'N/A'}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-semibold">₹{contract.totalContractValue?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-semibold">
                            {contract.startDate ? format(new Date(contract.startDate), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-semibold">
                            {contract.expectedEndDate ? format(new Date(contract.expectedEndDate), 'MMM dd, yyyy') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">
                        Milestones: {contract.milestones?.filter((m: any) => m.status === 'completed').length || 0} / {contract.milestones?.length || 0} completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  Page {page} of {pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
