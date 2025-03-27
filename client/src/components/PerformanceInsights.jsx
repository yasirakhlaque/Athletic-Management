import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const PerformanceInsights = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated performance data
    const mockData = [
      { date: '2024-01', performance: 85, training: 90, recovery: 88 },
      { date: '2024-02', performance: 87, training: 92, recovery: 89 },
      { date: '2024-03', performance: 89, training: 95, recovery: 91 },
      { date: '2024-04', performance: 92, training: 94, recovery: 93 },
    ];

    setPerformanceData(mockData);
    generateAIInsights(mockData);
  }, []);

  const generateAIInsights = async (data) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze this sports performance data and provide insights: ${JSON.stringify(data)}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiInsights(response.text());
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights('Unable to generate insights at this time.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Performance Insights
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Trends
              </Typography>
              <LineChart width={700} height={300} data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="performance" stroke="#8884d8" name="Performance" />
                <Line type="monotone" dataKey="training" stroke="#82ca9d" name="Training" />
                <Line type="monotone" dataKey="recovery" stroke="#ffc658" name="Recovery" />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Analysis
              </Typography>
              <Typography variant="body1">
                {aiInsights}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceInsights; 