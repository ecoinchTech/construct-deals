import { useState } from 'react';
import { useGetReportsQuery, useGenerateReportMutation, useDeleteReportMutation } from '@/store/api/reportApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Trash2, Plus, FileSpreadsheet, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import RoleGuard from '@/components/common/RoleGuard';
import { ReportType, ReportFormat } from '@/types/report.types';

const ReportList = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetReportsQuery({ page, limit: 10 });
  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation();
  const [deleteReport] = useDeleteReportMutation();

  const form = useForm({
    defaultValues: {
      type: 'rfq_summary' as ReportType,
      format: 'pdf' as ReportFormat,
    },
  });

  const handleGenerate = async (data: any) => {
    try {
      await generateReport(data).unwrap();
      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id).unwrap();
      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete report',
        variant: 'destructive',
      });
    }
  };

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileCheck className="h-4 w-4" />;
    }
  };

  return (
    <RoleGuard allowedRoles={['super_admin', 'org_owner', 'facility_manager']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate and download reports</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>Select report type and format</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rfq_summary">RFQ Summary</SelectItem>
                            <SelectItem value="bid_analysis">Bid Analysis</SelectItem>
                            <SelectItem value="contract_performance">Contract Performance</SelectItem>
                            <SelectItem value="vendor_performance">Vendor Performance</SelectItem>
                            <SelectItem value="financial_summary">Financial Summary</SelectItem>
                            <SelectItem value="dispute_report">Dispute Report</SelectItem>
                            <SelectItem value="payment_report">Payment Report</SelectItem>
                            <SelectItem value="milestone_report">Milestone Report</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
            <CardDescription>View and download your reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Generated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {report.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormatIcon(report.format)}
                            {report.format.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={report.fileUrl} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(report._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

export default ReportList;
