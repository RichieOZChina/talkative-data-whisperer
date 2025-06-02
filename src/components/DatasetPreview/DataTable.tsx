
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { AnalysisData, ColumnAnalysis } from './utils';

interface DataTableProps {
  csvData: string[][];
  analysis: AnalysisData | null;
}

const DataTable = ({ csvData, analysis }: DataTableProps) => {
  const headers = csvData.length > 0 ? csvData[0] : [];
  const rows = csvData.length > 1 ? csvData.slice(1) : [];

  // Get column analysis for a specific column
  const getColumnAnalysis = (columnName: string): ColumnAnalysis | undefined => {
    return analysis?.column_analysis?.find(col => col.column_name === columnName);
  };

  if (csvData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5" />
          Raw Data Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => {
                  const colAnalysis = getColumnAnalysis(header);
                  return (
                    <TableHead key={index} className="font-semibold bg-muted/50 min-w-[150px]">
                      <div className="space-y-2">
                        <div className="font-medium">{header}</div>
                        {colAnalysis && (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="text-xs px-1 w-fit">
                              {colAnalysis.sql_type}
                            </Badge>
                            <div className="text-xs text-muted-foreground font-normal">
                              {colAnalysis.data_type}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="max-w-xs truncate text-sm">
                      {cell || <span className="text-muted-foreground italic">empty</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DataTable;
