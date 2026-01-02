import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'assessor'
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/users/', formData);
      alert('생성되었습니다.');
      setOpen(false);
      fetchUsers();
      setFormData({ username: '', password: '', full_name: '', role: 'assessor' });
    } catch (err) {
      console.error(err);
      alert('생성 실패: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>평가위원 관리</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        + 신규 위원 등록
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>아이디</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>권한</TableCell>
              <TableCell>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.is_active ? '활성' : '비활성'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 등록 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>새 평가위원 등록</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
          <TextField 
            label="아이디" 
            value={formData.username} 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="비밀번호" 
            type="password"
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="이름" 
            value={formData.full_name} 
            onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
            fullWidth 
          />
          <FormControl fullWidth>
            <InputLabel>권한</InputLabel>
            <Select
              value={formData.role}
              label="권한"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <MenuItem value="assessor">평가위원 (Assessor)</MenuItem>
              <MenuItem value="admin">관리자 (Admin)</MenuItem>
              <MenuItem value="viewer">참관인 (Viewer)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleCreate} variant="contained">등록</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminUsers;