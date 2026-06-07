import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { login } from '../api/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      const response = await login(email, password);
      localStorage.setItem('token', response.accessToken);
      onLoginSuccess();
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Log Search Platform
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="メールアドレス"
        fullWidth
        sx={{ mb: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="パスワード"
        type="password"
        fullWidth
        sx={{ mb: 3 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={handleLogin}>
        ログイン
      </Button>
    </Box>
  );
};

export default LoginPage;