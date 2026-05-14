import { useState } from 'react'
import { Container, Typography, Box, Dialog, DialogTitle, DialogContent } from '@mui/material';
import SearchBar from './components/SearchBar';
import EventsTable from './components/EventsTable';
import { searchEvents, type Event, type SearchResponse } from './api/events';

function App() {
  const [result, setResult] = useState<SearchResponse>({
    data: [],
    total: 0,
    page: 1,
    limit: 50,
  });

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [currentFilter, setCurrentFilter] = useState('');
  const [currentStartTime, setCurrentStartTime] = useState('');
  const [currentEndTime, setCurrentEndTime] = useState('');

  const handleSearch = async (filter: string, startTime: string, endTime: string) => {
    setCurrentFilter(filter);
    setCurrentStartTime(startTime);
    setCurrentEndTime(endTime);

    const res = await searchEvents({
      filter: filter || undefined,
      startTime: startTime ? new Date(startTime).toISOString() : undefined,
      endTime: endTime ? new Date(endTime).toISOString() : undefined,
      page: 1,
      limit: 50,
    });
    setResult(res);
  };

  const handlePageChange = async (page: number) => {
    const res = await searchEvents({
      filter: currentFilter || undefined,
      startTime: currentStartTime ? new Date(currentStartTime).toISOString() : undefined,
      endTime: currentEndTime ? new Date(currentEndTime).toISOString() : undefined,
      page,
      limit: 50,
    });
    setResult(res);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        SIEM Core - Event Search
      </Typography>

      <SearchBar onSearch={handleSearch} />

      <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
        {result.total} events found
      </Typography>

      <EventsTable
        events={result.data}
        total={result.total}
        page={result.page}
        limit={result.limit}
        onPageChange={handlePageChange}
        onRowClick={(event) => setSelectedEvent(event)}
      />

      <Dialog
        open={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              {selectedEvent.metadata_eventType} - {selectedEvent.metadata_logType}
            </DialogTitle>
            <DialogContent>
              <Box component="pre" sx={{ fontSize: 13, overflow: 'auto' }}>
                {JSON.stringify(selectedEvent, null, 2)}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default App
