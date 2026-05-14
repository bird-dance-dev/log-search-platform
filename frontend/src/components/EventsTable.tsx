import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TablePagination,
} from '@mui/material';
import type { Event } from '../api/events';

interface EventsTableProps {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onRowClick: (event: Event) => void;
}

export default function EventsTable({
  events, total, page, limit, onPageChange, onRowClick,
}: EventsTableProps) {
  const severityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Log Type</TableCell>
              <TableCell>Principal</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Severity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={event.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick(event)}
              >
                <TableCell>
                  {new Date(event.metadata_eventTimestamp).toLocaleString()}
                </TableCell>
                <TableCell>{event.metadata_eventType}</TableCell>
                <TableCell>{event.metadata_logType}</TableCell>
                <TableCell>
                  {event.principal_user_userid || event.principal_ip || '-'}
                </TableCell>
                <TableCell>
                  {event.target_ip || event.target_url || event.target_resourceName || '-'}
                </TableCell>
                <TableCell>
                  {event.securityResults?.[0]?.action || '-'}
                </TableCell>
                <TableCell>
                  {event.securityResults?.[0]?.severity ? (
                    <Chip
                      label={event.securityResults[0].severity}
                      color={severityColor(event.securityResults[0].severity)}
                      size="small"
                    />
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPageOptions={[50]}
      />
    </Paper>
  );
}