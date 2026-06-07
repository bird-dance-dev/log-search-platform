import { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Select, MenuItem,
  Button, Checkbox, FormControlLabel, FormGroup, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  getUsers, getDataRoles, getNamespaces, updateUserDataRole,
  updateDataRoleNamespaces, type User, type DataRole, type Namespace,
} from '../api/settings';

const SettingsPage = () => {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [dataRoles, setDataRoles] = useState<DataRole[]>([]);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);

  // データロール編集用
  const [editingRole, setEditingRole] = useState<DataRole | null>(null);
  const [selectedNamespaceIds, setSelectedNamespaceIds] = useState<string[]>([]);

  const loadData = async () => {
    const [u, d, n] = await Promise.all([getUsers(), getDataRoles(), getNamespaces()]);
    setUsers(u);
    setDataRoles(d);
    setNamespaces(n);
  };

  useEffect(() => { loadData(); }, []);

  // アカウントのデータロール変更
  const handleUserDataRoleChange = async (userId: string, dataRoleId: string) => {
    const user = users.find(u => u.id === userId);
    const role = dataRoles.find(r => r.id === dataRoleId);
    const confirmed = window.confirm(
        `${user?.name} のデータロールを「${role?.name}」に変更しますか？`
    );
    if (!confirmed) {
        await loadData(); // キャンセル時にドロップダウンを元に戻す
        return;
    }
    await updateUserDataRole(userId, dataRoleId);
    await loadData();
  };

  // データロールのnamespace編集ダイアログを開く
  const openNamespaceEditor = (role: DataRole) => {
    setEditingRole(role);
    setSelectedNamespaceIds(role.namespaces?.map(n => n.namespaceId) || []);
  };

  // namespace選択のトグル
  const toggleNamespace = (namespaceId: string) => {
    setSelectedNamespaceIds(prev =>
      prev.includes(namespaceId)
        ? prev.filter(id => id !== namespaceId)
        : [...prev, namespaceId]
    );
  };

  // データロールのnamespace更新
  const handleSaveNamespaces = async () => {
    if (!editingRole) return;
    await updateDataRoleNamespaces(editingRole.id, selectedNamespaceIds);
    setEditingRole(null);
    await loadData();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>設定</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="アカウント" />
        <Tab label="データロール" />
      </Tabs>

      {/* アカウント一覧 */}
      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名前</TableCell>
                <TableCell>メール</TableCell>
                <TableCell>機能ロール</TableCell>
                <TableCell>データロール</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.functionalRole.name}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={user.dataRoleId}
                      onChange={(e) => handleUserDataRoleChange(user.id, e.target.value)}
                      disabled={user.functionalRole.name === '管理者'}
                    >
                      {dataRoles.map(role => (
                        <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* データロール一覧 */}
      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ロール名</TableCell>
                <TableCell>許可されたNamespace</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataRoles.map(role => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>
                    {role.namespaces
                      ?.map(n => n.namespace.name)
                      .sort()
                      .join(', ') || 'なし'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => openNamespaceEditor(role)}>
                      編集
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Namespace編集ダイアログ */}
      <Dialog open={editingRole !== null} onClose={() => setEditingRole(null)}>
        <DialogTitle>{editingRole?.name} のNamespace設定</DialogTitle>
        <DialogContent>
          <FormGroup>
            {namespaces.map(ns => (
              <FormControlLabel
                key={ns.id}
                control={
                  <Checkbox
                    checked={selectedNamespaceIds.includes(ns.id)}
                    onChange={() => toggleNamespace(ns.id)}
                  />
                }
                label={ns.name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingRole(null)}>キャンセル</Button>
          <Button variant="contained" onClick={handleSaveNamespaces}>保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;