import React, { useState, useEffect } from 'react';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CandidatesList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('/candidates/me');
        setCandidates(response.data);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleEvaluate = (id) => {
    navigate(`/evaluate/${id}`);
  };

  // 현재 사용자의 배정 상태를 찾는 헬퍼 함수
  // (백엔드에서 내 배정만 필터링해서 주지만, 배열 구조상 안전하게 찾음)
  const getMyAssignmentStatus = (assignments) => {
    // 실제로는 로그인한 유저 ID와 매칭해야 하지만, 
    // /candidates/me API가 '내가 포함된 문서'를 반환하므로 
    // 여기서는 단순히 첫 번째 assignment나 로직을 단순화하여 표시
    // *개선 포인트: 백엔드에서 my_status 필드를 추가해서 내려주는 것이 좋음
    if (!assignments || assignments.length === 0) return 'unknown';
    return assignments[0].status; 
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      <Typography variant="h5" gutterBottom>
        평가 대상자 목록
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>성명</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>직급</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((row) => {
              const status = getMyAssignmentStatus(row.assignments);
              return (
                <TableRow
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>
                    <Chip 
                      label={status === 'completed' ? '완료' : '대기중'} 
                      color={status === 'completed' ? 'success' : 'warning'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => handleEvaluate(row._id)}
                      disabled={status === 'completed'}
                    >
                      평가하기
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CandidatesList;
