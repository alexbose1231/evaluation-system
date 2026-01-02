import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import api from '../api/axios';

const AdminCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    employee_id: '',
    group: '',
    sequence: ''
  });

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates/'); // 관리자용 전체 조회
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/candidates/', formData);
      alert('등록되었습니다.');
      setOpen(false);
      fetchCandidates();
      setFormData({ name: '', department: '', position: '', employee_id: '' });
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>평가대상자 관리</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        + 신규 대상자 등록
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>성명</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>직급</TableCell>
              <TableCell>수험번호</TableCell>
              <TableCell>조</TableCell>
              <TableCell>순번</TableCell>
              <TableCell>배정 현황</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((cand) => (
              <TableRow key={cand._id}>
                <TableCell>{cand.name}</TableCell>
                <TableCell>{cand.department}</TableCell>
                <TableCell>{cand.position}</TableCell>
                <TableCell>{cand.employee_id}</TableCell>
                <TableCell>{cand.group}</TableCell>
                <TableCell>{cand.sequence}</TableCell>
                <TableCell>{cand.assignments?.length || 0}명 배정됨</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>새 평가대상자 등록</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
          <TextField 
            label="성명" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="부서" 
            value={formData.department} 
            onChange={(e) => setFormData({...formData, department: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="직급" 
            value={formData.position} 
            onChange={(e) => setFormData({...formData, position: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="수험번호" 
            value={formData.employee_id} 
            onChange={(e) => setFormData({...formData, employee_id: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="조 (예: A조)" 
            value={formData.group} 
            onChange={(e) => setFormData({...formData, group: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="순번" 
            type="number"
            value={formData.sequence} 
            onChange={(e) => setFormData({...formData, sequence: e.target.value})} 
            fullWidth 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleCreate} variant="contained">등록</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminCandidates;