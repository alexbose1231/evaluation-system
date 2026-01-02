import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';

const AdminItems = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    category: '',
    title: '',
    input_type: 'scale_5',
    config: { max_score: 5 } // scale_5 default
  });

  const fetchItems = async () => {
    try {
      const res = await api.get('/items/');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async () => {
    try {
      // input_type에 따라 config 자동 설정
      const payload = { ...formData };
      if (payload.input_type === 'scale_5') {
        payload.config = { max_score: 5, labels: ["미흡", "보통", "우수"] }; // 예시
      } else {
        payload.config = { max_score: 100 };
      }
      
      await api.post('/items/', payload);
      alert('등록되었습니다.');
      setOpen(false);
      fetchItems();
      setFormData({ code: '', category: '', title: '', input_type: 'scale_5', config: { max_score: 5 } });
    } catch (err) {
      console.error(err);
      alert('등록 실패');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (err) {
        alert('삭제 실패');
      }
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>평가기준 관리</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        + 신규 평가항목 등록
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>코드</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>항목명</TableCell>
              <TableCell>입력방식</TableCell>
              <TableCell>삭제</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                    {item.input_type === 'scale_5' ? '5점 척도 (정성)' : '100점 만점 (정량)'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(item._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>새 평가항목 등록</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
          <TextField 
            label="코드 (예: Q1)" 
            value={formData.code} 
            onChange={(e) => setFormData({...formData, code: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="카테고리 (예: 전문성)" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            fullWidth 
          />
          <TextField 
            label="항목명" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            fullWidth 
          />
          <FormControl fullWidth>
            <InputLabel>입력 방식</InputLabel>
            <Select
              value={formData.input_type}
              label="입력 방식"
              onChange={(e) => setFormData({...formData, input_type: e.target.value})}
            >
              <MenuItem value="scale_5">5점 척도 (정성 평가)</MenuItem>
              <MenuItem value="score_100">100점 만점 (정량 평가)</MenuItem>
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

export default AdminItems;