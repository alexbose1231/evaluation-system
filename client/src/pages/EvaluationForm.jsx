import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Grid, TextField, Button, Box, Divider, CircularProgress, Rating } from '@mui/material';
import api from '../api/axios';

const EvaluationForm = () => {
  const { id } = useParams(); // candidateId
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [items, setItems] = useState([]);
  const [scores, setScores] = useState({}); // { itemId: { raw: 4, strengths: '', weaknesses: '' } }
  const [loading, setLoading] = useState(true);
  const [assessorId, setAssessorId] = useState(null); // 내 ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 병렬 요청: 내 할당 목록(대상자 찾기 위함) + 전체 항목
        const [candRes, itemRes, userRes] = await Promise.all([
          api.get('/candidates/me'),
          api.get('/items/'),
          api.get('/users/')
        ]);

        const targetCandidate = candRes.data.find(c => c._id === id);
        if (!targetCandidate) {
          alert("유효하지 않은 평가 대상입니다.");
          navigate('/candidates');
          return;
        }
        setCandidate(targetCandidate);

        // 내 assessor_id 찾기
        if (targetCandidate.assignments.length > 0) {
          setAssessorId(targetCandidate.assignments[0].assessor_id);
        }

        // 할당된 항목 필터링
        const assignedItemIds = targetCandidate.assignments[0].item_ids;
        const filteredItems = itemRes.data.filter(item => assignedItemIds.includes(item._id));
        setItems(filteredItems);

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleScoreChange = (itemId, value, type) => {
    setScores(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], raw: Number(value) }
    }));
  };

  const handleTextChange = (itemId, value, field) => {
    setScores(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    if (!assessorId) {
        alert("평가자 정보를 찾을 수 없습니다.");
        return;
    }

    // 유효성 검사 및 데이터 변환
    const scoreList = items.map(item => {
      const input = scores[item._id] || { raw: 0 };
      let normalized = 0;
      
      if (item.input_type === 'scale_5') {
        normalized = (input.raw / 5) * 100;
      } else {
        normalized = input.raw; // 이미 100점 만점
      }

      return {
        item_id: item._id,
        raw_score: input.raw,
        normalized_score: normalized,
        strengths: input.strengths,
        weaknesses: input.weaknesses
      };
    });

    // 점수 입력 확인
    const missing = items.filter(item => !scores[item._id] || scores[item._id].raw === 0);
    if (missing.length > 0) {
        alert("모든 항목에 점수를 입력해주세요.");
        return;
    }

    try {
      const payload = {
        candidate_id: id,
        assessor_id: assessorId,
        scores: scoreList,
        total_normalized_score: scoreList.reduce((acc, curr) => acc + curr.normalized_score, 0) / scoreList.length
      };

      await api.post('/evaluations/', payload);
      alert("평가가 제출되었습니다.");
      navigate('/candidates');
    } catch (err) {
      console.error("제출 실패:", err);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (!candidate) return <Typography>대상자를 찾을 수 없습니다.</Typography>;

  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom color="primary">
        역량 평가: {candidate.name} ({candidate.position})
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        {items.map((item, index) => (
          <Grid item xs={12} key={item._id}>
            <Typography variant="h6" gutterBottom>
              {index + 1}. {item.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {item.category} | {item.input_type === 'scale_5' ? '5점 척도' : '100점 만점'}
            </Typography>
            
            <Box sx={{ my: 2 }}>
              {item.input_type === 'scale_5' ? (
                <Box>
                  <Typography component="legend">점수 (0.5점 단위)</Typography>
                  <Rating
                    name={`rating-${item._id}`}
                    value={scores[item._id]?.raw || 0}
                    precision={0.5}
                    onChange={(event, newValue) => {
                      handleScoreChange(item._id, newValue, 'scale_5');
                    }}
                    size="large"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {scores[item._id]?.raw || 0} 점
                  </Typography>
                </Box>
              ) : (
                <TextField
                  label="점수 (0~100)"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  value={scores[item._id]?.raw || ''}
                  onChange={(e) => handleScoreChange(item._id, e.target.value, 'score_100')}
                  fullWidth
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="강점 (탁월한 점)"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                value={scores[item._id]?.strengths || ''}
                onChange={(e) => handleTextChange(item._id, e.target.value, 'strengths')}
              />
              <TextField
                label="약점 (보완할 점)"
                multiline
                rows={2}
                fullWidth
                variant="outlined"
                value={scores[item._id]?.weaknesses || ''}
                onChange={(e) => handleTextChange(item._id, e.target.value, 'weaknesses')}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" size="large" onClick={handleSubmit}>
          평가 제출하기
        </Button>
      </Box>
    </Paper>
  );
};

export default EvaluationForm;