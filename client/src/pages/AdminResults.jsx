import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import api from '../api/axios';

const AdminResults = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 수정 모달 State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null); // 수정할 Result 데이터 (상세)
  const [editScores, setEditScores] = useState([]); // 수정 중인 점수 목록

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/monitoring/results');
      setRows(res.data);
    } catch (err) {
      console.error("결과 집계 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (detail) => {
    setSelectedResult(detail);
    setEditScores(JSON.parse(JSON.stringify(detail.scores))); // Deep copy
    setEditOpen(true);
  };

  const handleScoreChange = (index, field, value) => {
    const newScores = [...editScores];
    newScores[index][field] = value;
    // raw_score 변경 시 normalized_score 자동 계산 (100점 만점 기준 가정)
    // 5점 척도인지 100점인지 알 수 없으므로, 일단 raw 값만 변경
    // *실제로는 Item 정보를 조회해서 계산해야 함. 여기서는 단순 입력값 반영.
    if (field === 'raw_score') {
        newScores[index]['normalized_score'] = Number(value); 
    }
    setEditScores(newScores);
  };

  const handleSaveEdit = async () => {
    try {
      // 평균 재계산
      const total = editScores.reduce((acc, curr) => acc + Number(curr.normalized_score), 0);
      const avg = total / editScores.length;

      const payload = {
        candidate_id: "dont_care", // 업데이트 시 사용 안 함
        assessor_id: selectedResult.assessor_id,
        scores: editScores,
        total_normalized_score: avg
      };

      await api.put(`/evaluations/${selectedResult.result_id}`, payload);
      alert("수정되었습니다.");
      setEditOpen(false);
      fetchData(); // 재조회
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const columns = [
    { field: 'rank', headerName: '순위', width: 70, type: 'number' },
    { field: 'group', headerName: '조', width: 70 },
    { field: 'sequence', headerName: '순번', width: 70 },
    { field: 'employee_id', headerName: '수험번호', width: 120 },
    { field: 'name', headerName: '성명', width: 100 },
    { field: 'score_avg', headerName: '평균 점수', width: 100, type: 'number' },
    { 
      field: 'details', 
      headerName: '상세 점수 (평균 편차)', 
      width: 400,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
          {params.value.map((detail, idx) => (
            <Button 
              key={idx} 
              variant="outlined" 
              size="small" 
              color={detail.deviation >= 1.5 ? "error" : "primary"}
              onClick={() => handleEditClick(detail)}
              title={`평가위원ID: ${detail.assessor_id}`}
            >
              {detail.score} ({detail.deviation})
            </Button>
          ))}
        </Box>
      )
    },
  ];

  return (
    <Paper sx={{ height: 700, width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>최종 집계 및 조정</Typography>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        slots={{ toolbar: GridToolbar }}
        disableRowSelectionOnClick
      />

      {/* 점수 수정 모달 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>점수 상세 및 조정</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {editScores.map((score, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Typography sx={{ width: 100 }}>{score.item_id}</Typography>
                <TextField
                  label="점수"
                  type="number"
                  value={score.raw_score}
                  onChange={(e) => handleScoreChange(index, 'raw_score', e.target.value)}
                  size="small"
                />
                <TextField
                  label="강점"
                  value={score.strengths || ''}
                  onChange={(e) => handleScoreChange(index, 'strengths', e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="약점"
                  value={score.weaknesses || ''}
                  onChange={(e) => handleScoreChange(index, 'weaknesses', e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>취소</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">저장</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminResults;
