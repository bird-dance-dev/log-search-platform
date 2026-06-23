import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import SearchBar from './components/SearchBar';
import EventsTable from './components/EventsTable';
import LoginPage from './components/LoginPage';
import SettingsPage from './components/SettingsPage';
import { searchEvents, type Event, type SearchResponse } from './api/events';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentPage, setCurrentPage] = useState<'search' | 'settings'>(
    'search',
  );

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

  // トークンからロール情報を取得
  const parseToken = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    return payload.functionalRoleName;
  };
  // const parseToken = (token: string) => {
  //   const payload = JSON.parse(atob(token.split('.')[1]));
  //   return payload.functionalRoleName;
  // };

  // 起動時にトークンがあればログイン状態を復元
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const role = parseToken(token);
        setUserRole(role);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLoginSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = parseToken(token);
      setUserRole(role);
      setIsLoggedIn(true);
      setResult({ data: [], total: 0, page: 1, limit: 50 });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole('');
    setCurrentPage('search');
  };

  const handleSearch = async (
    filter: string,
    startTime: string,
    endTime: string,
  ) => {
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
      startTime: currentStartTime
        ? new Date(currentStartTime).toISOString()
        : undefined,
      endTime: currentEndTime
        ? new Date(currentEndTime).toISOString()
        : undefined,
      page,
      limit: 50,
    });
    setResult(res);
  };

  // ログインしてなければログイン画面
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Log Search Platform</Typography>
        <Button variant="outlined" onClick={handleLogout}>
          ログアウト
        </Button>
      </Box>

      {/* メニュー：管理者のみ設定タブが見える */}
      <Tabs
        value={currentPage}
        onChange={(_, v) => setCurrentPage(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="検索" value="search" />
        {userRole === '管理者' && <Tab label="設定" value="settings" />}
      </Tabs>

      {/* 検索画面 */}
      {currentPage === 'search' && (
        <>
          <SearchBar onSearch={handleSearch} />
          <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
            {result.total}件のログが見つかりました
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
                  {selectedEvent.metadata_eventType} -{' '}
                  {selectedEvent.metadata_logType}
                </DialogTitle>
                <DialogContent>
                  <Box component="pre" sx={{ fontSize: 13, overflow: 'auto' }}>
                    {JSON.stringify(selectedEvent, null, 2)}
                  </Box>
                </DialogContent>
              </>
            )}
          </Dialog>
        </>
      )}

      {/* 設定画面：管理者のみ */}
      {currentPage === 'settings' && userRole === '管理者' && <SettingsPage />}
    </Container>
  );
}

export default App;
