import React, { useState, useEffect, useRef } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box } from '@mui/material';
import api from '../api/axios';

const AdminMonitoring = () => {
  const [data, setData] = useState({ assessors: [], candidates: [] });
  const timerRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/monitoring/matrix/'); // Trailing slash
      setData(res.data);
    } catch (err) {
      console.error("모니터링 데이터 로드 실패:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // 10초마다 자동 갱신
    timerRef.current = setInterval(fetchData, 10000);
    return () => clearInterval(timerRef.current);
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'default'; // 미배정
    if (status === 'completed') return 'success';
    if (status === 'pending') return 'warning'; // 진행중/대기
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (!status) return '-';
    if (status === 'completed') return '완료';
    if (status === 'pending') return '대기';
    return '-';
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">실시간 평가 현황판</Typography>
        <Typography variant="caption" color="text.secondary">10초마다 자동 갱신됨</Typography>
      </Box>
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 50, fontWeight: 'bold' }}>조</TableCell>
              <TableCell sx={{ minWidth: 50, fontWeight: 'bold' }}>순번</TableCell>
              <TableCell sx={{ minWidth: 80, fontWeight: 'bold' }}>성명</TableCell>
              <TableCell sx={{ minWidth: 80, fontWeight: 'bold' }}>수험번호</TableCell>
              {data.assessors.map(assessor => (
                <TableCell key={assessor.id} align="center" sx={{ minWidth: 100 }}>
                  {assessor.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.candidates.map((cand) => (
              <TableRow key={cand.id} hover>
                <TableCell>{cand.group}</TableCell>
                <TableCell>{cand.sequence}</TableCell>
                <TableCell>{cand.name}</TableCell>
                <TableCell>{cand.employee_id}</TableCell>
                {data.assessors.map(assessor => {
                  const status = cand.assignments[assessor.id];
                  return (
                    <TableCell key={assessor.id} align="center">
                      <Chip 
                        label={getStatusLabel(status)} 
                        color={getStatusColor(status)} 
                        size="small" 
                        variant={status ? "filled" : "outlined"}
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default AdminMonitoring;
