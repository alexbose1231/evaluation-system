import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        대시보드
      </Typography>
      <Grid container spacing={3}>
        {/* 진행 현황 카드 (예시) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              나의 진행률
            </Typography>
            <Typography component="p" variant="h4">
              0%
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              0 / 0 명 완료
            </Typography>
          </Paper>
        </Grid>
        
        {/* 공지사항 등 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              시스템 공지
            </Typography>
            <Typography>
              현재 평가 기간입니다. 기한 내에 완료해주세요.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
