import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrganizationsQuery } from '@/store/api/organizationApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Search, MapPin, Calendar } from 'lucide-react';

const OrganizationList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useGetOrganizationsQuery({ page, limit: 10 });

  const filteredOrganizations = data?.data.organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.address.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">Manage your organization profiles</p>
          </div>
          <Link to="/organizations/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Organization
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Organizations Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first organization'}
              </p>
              {!searchTerm && (
                <Link to="/organizations/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <Link key={org.id} to={`/organizations/${org.id}`}>
                <Card className="h-full transition-smooth hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="mt-4">{org.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {org.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">GST Number:</span>
                        <span className="font-medium">{org.gstNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span className="font-medium">{org.defaultCurrency}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground pt-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          Created {new Date(org.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.data.pagination.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
  );
};

export default OrganizationList;
