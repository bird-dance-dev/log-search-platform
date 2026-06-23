import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

interface SearchBarProps {
  onSearch: (filter: string, startTime: string, endTime: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [filter, setFilter] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSearch = () => {
    onSearch(filter, startTime, endTime);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      <TextField
        label="フィルター"
        placeholder='metadata_eventType="USER_LOGIN" AND principal_ip="192.168.1.10"'
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        fullWidth
        multiline
        minRows={5}
        // maxRows={5}
        size="small"
        sx={{
          '& .MuiInputBase-inputMultiline': {
            resize: 'vertical',
          },
        }}
      />
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <TextField
          label="Start"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          sx={{ width: 220 }}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="End"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          sx={{ width: 220 }}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button variant="contained" onClick={handleSearch}>
          検索
        </Button>
      </Box>
    </Box>
  );
}
