import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Grid, Paper, List, ListItem, ListItemButton, ListItemText, Checkbox, Button, FormControl, InputLabel, Select, MenuItem, Box, Divider, FormControlLabel } from '@mui/material';
import api from '../api/axios';

const AdminAssignment = () => {
  const [candidates, setCandidates] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  
  // Selection State
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectedAssessor, setSelectedAssessor] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // 배정할 항목 ID 목록

  // Filter State
  const [filterGroup, setFilterGroup] = useState('all');

  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, userRes, itemRes] = await Promise.all([
          api.get('/candidates/'),
          api.get('/users/'),
          api.get('/items/')
        ]);
        setCandidates(candRes.data);
        setUsers(userRes.data);
        setItems(itemRes.data);
        
        // 초기에는 모든 항목 선택
        setSelectedItems(itemRes.data.map(i => i._id));
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    fetchData();
  }, []);

  // 그룹 목록 추출 (Unique)
  const groups = useMemo(() => {
    const g = new Set(candidates.map(c => c.group).filter(Boolean));
    return Array.from(g).sort();
  }, [candidates]);

  // 필터링된 대상자 목록
  const filteredCandidates = useMemo(() => {
    if (filterGroup === 'all') return candidates;
    return candidates.filter(c => c.group === filterGroup);
  }, [candidates, filterGroup]);

  // 대상자 선택 토글
  const handleToggleCandidate = (id) => {
    const currentIndex = selectedCandidates.indexOf(id);
    const newChecked = [...selectedCandidates];
    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedCandidates(newChecked);
  };

  // 항목 선택 토글
  const handleToggleItem = (id) => {
    const currentIndex = selectedItems.indexOf(id);
    const newChecked = [...selectedItems];
    if (currentIndex === -1) {
      newChecked.push(id);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setSelectedItems(newChecked);
  };

  // 필터링된 목록 전체 선택/해제
  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredCandidates.map(c => c._id);
    // 이미 다 선택되어 있으면 해제, 아니면 전체 선택
    const isAllSelected = allFilteredIds.every(id => selectedCandidates.includes(id));
    
    if (isAllSelected) {
      // 현재 필터링된 것들만 해제
      setSelectedCandidates(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // 현재 필터링된 것들을 추가 (중복 방지)
      const newSelected = new Set([...selectedCandidates, ...allFilteredIds]);
      setSelectedCandidates(Array.from(newSelected));
    }
  };

  const handleAssign = async () => {
    if (!selectedAssessor) {
      alert("평가위원을 선택해주세요.");
      return;
    }
    if (selectedCandidates.length === 0) {
      alert("대상자를 선택해주세요.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("평가할 항목을 최소 하나 이상 선택해주세요.");
      return;
    }

    try {
      const promises = selectedCandidates.map(candId => 
        api.put(`/candidates/${candId}/assign`, {
          assessor_id: selectedAssessor,
          item_ids: selectedItems
        })
      );

      await Promise.all(promises);
      alert(`${selectedCandidates.length}명에게 배정이 완료되었습니다.`);
      setSelectedCandidates([]);
      // 데이터 갱신 (배정 현황 업데이트 확인용)
      const candRes = await api.get('/candidates/');
      setCandidates(candRes.data);
    } catch (err) {
      console.error("배정 실패:", err);
      alert("배정 중 오류가 발생했습니다.");
    }
  };

  return (
    <Grid container spacing={3}>
      {/* 왼쪽: 평가 대상자 목록 */}
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>평가 대상자 선택</Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>조 (Group)</InputLabel>
              <Select
                value={filterGroup}
                label="조 (Group)"
                onChange={(e) => setFilterGroup(e.target.value)}
              >
                <MenuItem value="all">전체 보기</MenuItem>
                {groups.map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={handleSelectAllFiltered}>
              {filterGroup === 'all' ? '전체 선택' : `${filterGroup} 전체 선택`}
            </Button>
          </Box>

          <List dense component="div" role="list" sx={{ flex: 1, overflow: 'auto', maxHeight: 500 }}>
            {filteredCandidates.map((cand) => (
              <ListItem key={cand._id} disablePadding>
                <ListItemButton role={undefined} onClick={() => handleToggleCandidate(cand._id)} dense>
                  <Checkbox
                    edge="start"
                    checked={selectedCandidates.indexOf(cand._id) !== -1}
                    tabIndex={-1}
                    disableRipple
                  />
                  <ListItemText 
                    primary={`${cand.name} (${cand.position})`} 
                    secondary={`${cand.group ? `[${cand.group}] ` : ''}수험번호: ${cand.employee_id} | 배정: ${cand.assignments?.length || 0}명`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            {filteredCandidates.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                표시할 대상자가 없습니다.
              </Typography>
            )}
          </List>
          <Typography variant="caption" sx={{ mt: 1 }}>
            선택된 대상자: {selectedCandidates.length}명
          </Typography>
        </Paper>
      </Grid>

      {/* 중앙: 배정 컨트롤 */}
      <Grid item xs={12} md={2} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleAssign}>
          배정하기 &gt;&gt;
        </Button>
      </Grid>

      {/* 오른쪽: 평가위원 및 항목 선택 */}
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>설정</Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>1. 평가위원 선택</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>평가위원</InputLabel>
              <Select
                value={selectedAssessor}
                label="평가위원"
                onChange={(e) => setSelectedAssessor(e.target.value)}
              >
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.full_name || user.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>2. 평가 항목 선택</Typography>
            <Typography variant="caption" color="text.secondary">
              선택한 항목만 해당 위원에게 할당됩니다.
            </Typography>
            <List dense>
              {items.map(item => (
                <ListItem key={item._id} disablePadding>
                  <ListItemButton role={undefined} onClick={() => handleToggleItem(item._id)} dense>
                    <Checkbox
                      edge="start"
                      checked={selectedItems.indexOf(item._id) !== -1}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText 
                      primary={item.title} 
                      secondary={item.input_type === 'scale_5' ? '5점 척도' : '100점 만점'} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdminAssignment;