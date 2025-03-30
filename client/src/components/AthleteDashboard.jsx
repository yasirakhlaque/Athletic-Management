import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  FitnessCenter,
  DirectionsRun,
  Restaurant,
  Bed,
  SportsKabaddi,
  LocalHospital,
} from '@mui/icons-material';

const API_BASE_URL = 'https://athletic-management-backend.onrender.com/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AthleteDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [historicalData, setHistoricalData] = useState({
    strength: [],
    cardio: [],
    nutrition: [],
    recovery: [],
    wrestling: [],
    injury: [],
  });
  const [aiInsights, setAiInsights] = useState({
    strength: '',
    cardio: '',
    nutrition: '',
    recovery: '',
    wrestling: '',
    injury: '',
  });
  const [alerts, setAlerts] = useState([]);

  // Form states
  const [strengthData, setStrengthData] = useState({
    exercise: '',
    weight: '',
    reps: '',
    sets: '',
    notes: '',
  });

  const [cardioData, setCardioData] = useState({
    type: '',
    duration: '',
    distance: '',
    heartRate: '',
    notes: '',
  });

  const [nutritionData, setNutritionData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    notes: '',
  });

  const [recoveryData, setRecoveryData] = useState({
    sleepHours: '',
    hrv: '',
    soreness: '',
    notes: '',
  });

  const [wrestlingData, setWrestlingData] = useState({
    takedownPercentage: '',
    sparringRounds: '',
    technique: '',
    notes: '',
  });

  const [injuryData, setInjuryData] = useState({
    area: '',
    painLevel: '',
    type: '',
    notes: '',
  });

  useEffect(() => {
    fetchHistoricalData();
    fetchAIInsights();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const types = ['strength', 'cardio', 'nutrition', 'recovery', 'wrestling', 'injury'];
      const data = {};
      
      for (const type of types) {
        const response = await fetch(`${API_BASE_URL}/history/${type}`);
        if (!response.ok) throw new Error(`Failed to fetch ${type} data`);
        data[type] = await response.json();
      }
      
      setHistoricalData(data);
      analyzeDataForAlerts(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to load historical data');
    }
  };

  const fetchAIInsights = async () => {
    try {
      const types = ['strength', 'cardio', 'nutrition', 'recovery', 'wrestling', 'injury'];
      const insights = {};
      
      for (const type of types) {
        try {
          const response = await fetch(`${API_BASE_URL}/analysis/${type}`);
          if (response.status === 429) {
            const data = await response.json();
            insights[type] = `Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`;
            continue;
          }
          if (!response.ok) throw new Error(`Failed to fetch ${type} insights`);
          const data = await response.json();
          insights[type] = data.insights;
        } catch (error) {
          console.error(`Error fetching ${type} insights:`, error);
          insights[type] = `Error loading insights. Please try again later.`;
        }
      }
      
      setAiInsights(insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setError('Failed to load AI insights');
    }
  };

  const analyzeDataForAlerts = (data) => {
    const newAlerts = [];

    // STRENGTH ANALYSIS
    if (data.strength.length > 0) {
      const latestStrength = data.strength[0];
      const weight = parseInt(latestStrength.weight);
      const reps = parseInt(latestStrength.reps);
      const sets = parseInt(latestStrength.sets);
      
      // Check for high weight
      if (weight > 90) {
        newAlerts.push({
          type: 'warning',
          category: 'strength',
          message: 'High weight detected. Ensure proper form and technique to prevent injury.',
          icon: <Warning />,
          priority: 2
        });
      }
      
      // Check for training volume
      const volume = weight * reps * sets;
      if (volume > 3000) {
        newAlerts.push({
          type: 'warning',
          category: 'strength',
          message: 'High training volume detected. Ensure adequate recovery time.',
          icon: <Warning />,
          priority: 1
        });
      }
      
      // Check for progression if we have historical data
      if (data.strength.length > 1) {
        const previousStrength = data.strength[1];
        const previousVolume = parseInt(previousStrength.weight) * parseInt(previousStrength.reps) * parseInt(previousStrength.sets);
        
        if (volume < previousVolume * 0.8) {
          newAlerts.push({
            type: 'info',
            category: 'strength',
            message: 'Significant decrease in training volume detected. Check for fatigue or technique issues.',
            icon: <Info />,
            priority: 2
          });
        } else if (volume > previousVolume * 1.2) {
          newAlerts.push({
            type: 'success',
            category: 'strength',
            message: 'Significant increase in training volume! Great progress.',
            icon: <CheckCircle />,
            priority: 3
          });
        }
      }
    }

    // RECOVERY ANALYSIS
    if (data.recovery.length > 0) {
      const latestRecovery = data.recovery[0];
      const hrv = parseInt(latestRecovery.hrv);
      const sleepHours = parseInt(latestRecovery.sleepHours);
      const soreness = parseInt(latestRecovery.soreness);
      
      // Check HRV (Heart Rate Variability)
      if (hrv < 50) {
        newAlerts.push({
          type: 'error',
          category: 'recovery',
          message: 'Low HRV detected. Consider taking a rest day or reducing training intensity.',
          icon: <Error />,
          priority: 1
        });
      }
      
      // Check sleep quality
      if (sleepHours < 7) {
        newAlerts.push({
          type: 'warning',
          category: 'recovery',
          message: 'Insufficient sleep detected. Aim for 7-9 hours of sleep for optimal recovery.',
          icon: <Warning />,
          priority: 1
        });
      }
      
      // Check soreness levels
      if (soreness > 7) {
        newAlerts.push({
          type: 'warning',
          category: 'recovery',
          message: 'High soreness level detected. Consider active recovery techniques.',
          icon: <Warning />,
          priority: 2
        });
      }
      
      // Check recovery trends if we have historical data
      if (data.recovery.length > 2) {
        let consistentLowHRV = true;
        let consistentPoorSleep = true;
        
        for (let i = 0; i < 3; i++) {
          if (parseInt(data.recovery[i].hrv) >= 50) {
            consistentLowHRV = false;
          }
          if (parseInt(data.recovery[i].sleepHours) >= 7) {
            consistentPoorSleep = false;
          }
        }
        
        if (consistentLowHRV) {
          newAlerts.push({
            type: 'error',
            category: 'recovery',
            message: 'Consistently low HRV detected across multiple days. High risk of overtraining.',
            icon: <Error />,
            priority: 1
          });
        }
        
        if (consistentPoorSleep) {
          newAlerts.push({
            type: 'error',
            category: 'recovery',
            message: 'Consistently poor sleep detected. This severely impacts recovery and performance.',
            icon: <Error />,
            priority: 1
          });
        }
      }
    }

    // NUTRITION ANALYSIS
    if (data.nutrition.length > 0) {
      const latestNutrition = data.nutrition[0];
      const calories = parseInt(latestNutrition.calories);
      const protein = parseInt(latestNutrition.protein);
      const carbs = parseInt(latestNutrition.carbs);
      const fats = parseInt(latestNutrition.fats);

      // Check protein intake (0.8g per pound of bodyweight as rough estimate)
      const estimatedProteinNeed = 150; // Assuming 185lb athlete
      if (protein < estimatedProteinNeed) {
        newAlerts.push({
          type: 'warning',
          category: 'nutrition',
          message: `Low protein intake detected (${protein}g). Increase protein intake for better recovery and muscle growth.`,
          icon: <Warning />,
          priority: 2
        });
      }

      // Check carb intake for energy
      if (carbs < 200) {
        newAlerts.push({
          type: 'warning',
          category: 'nutrition',
          message: `Low carbohydrate intake detected (${carbs}g). Increase carbs for better energy levels and performance.`,
          icon: <Warning />,
          priority: 3
        });
      }
      
      // Check overall calorie intake
      const estimatedCalorieNeed = 2500; // Rough estimate for athlete
      if (calories < estimatedCalorieNeed * 0.8) {
        newAlerts.push({
          type: 'error',
          category: 'nutrition',
          message: `Calorie intake is significantly below needs (${calories}). This may impact recovery and performance.`,
          icon: <Error />,
          priority: 1
        });
      } else if (calories > estimatedCalorieNeed * 1.2) {
        newAlerts.push({
          type: 'info',
          category: 'nutrition',
          message: `Calorie intake is above estimated needs (${calories}). Ensure this aligns with your current training phase.`,
          icon: <Info />,
          priority: 3
        });
      }
      
      // Check macronutrient balance
      const proteinCalories = protein * 4;
      const carbCalories = carbs * 4;
      const fatCalories = fats * 9;
      
      const proteinPercentage = (proteinCalories / calories) * 100;
      const carbPercentage = (carbCalories / calories) * 100;
      const fatPercentage = (fatCalories / calories) * 100;
      
      if (proteinPercentage < 20) {
        newAlerts.push({
          type: 'warning',
          category: 'nutrition',
          message: `Protein is only ${Math.round(proteinPercentage)}% of your diet. Consider increasing relative protein intake.`,
          icon: <Warning />,
          priority: 2
        });
      }
      
      if (fatPercentage < 15) {
        newAlerts.push({
          type: 'warning',
          category: 'nutrition',
          message: `Fat intake is only ${Math.round(fatPercentage)}% of your diet. Healthy fats are essential for hormone production.`,
          icon: <Warning />,
          priority: 3
        });
      }
    }

    // WRESTLING ANALYSIS
    if (data.wrestling.length > 0) {
      const latestWrestling = data.wrestling[0];
      const takedownPercentage = parseInt(latestWrestling.takedownPercentage);
      const sparringRounds = parseInt(latestWrestling.sparringRounds);
      
      // Check takedown efficiency
      if (takedownPercentage < 40) {
        newAlerts.push({
          type: 'warning',
          category: 'wrestling',
          message: `Low takedown percentage detected (${takedownPercentage}%). Focus on technique improvement.`,
          icon: <Warning />,
          priority: 2
        });
      } else if (takedownPercentage > 70) {
        newAlerts.push({
          type: 'success',
          category: 'wrestling',
          message: `Excellent takedown percentage (${takedownPercentage}%)! Your technique is working well.`,
          icon: <CheckCircle />,
          priority: 3
        });
      }
      
      // Check training volume
      if (sparringRounds > 10) {
        newAlerts.push({
          type: 'warning',
          category: 'wrestling',
          message: `High number of sparring rounds (${sparringRounds}). Ensure adequate recovery.`,
          icon: <Warning />,
          priority: 2
        });
      }
      
      // Check for trends if we have historical data
      if (data.wrestling.length > 1) {
        const previousWrestling = data.wrestling[1];
        const previousTakedownPercentage = parseInt(previousWrestling.takedownPercentage);
        
        if (takedownPercentage < previousTakedownPercentage * 0.8) {
          newAlerts.push({
            type: 'info',
            category: 'wrestling',
            message: 'Significant decrease in takedown percentage. Review technique and strategy.',
            icon: <Info />,
            priority: 2
          });
        } else if (takedownPercentage > previousTakedownPercentage * 1.2) {
          newAlerts.push({
            type: 'success',
            category: 'wrestling',
            message: 'Significant improvement in takedown percentage! Your practice is paying off.',
            icon: <CheckCircle />,
            priority: 3
          });
        }
      }
    }

    // INJURY ANALYSIS
    if (data.injury.length > 0) {
      const latestInjury = data.injury[0];
      const painLevel = parseInt(latestInjury.painLevel);
      const area = latestInjury.area;
      
      // Check pain levels
      if (painLevel > 7) {
        newAlerts.push({
          type: 'error',
          category: 'injury',
          message: `High pain level (${painLevel}/10) detected in ${area}. Seek medical evaluation.`,
          icon: <Error />,
          priority: 1
        });
      } else if (painLevel > 4) {
        newAlerts.push({
          type: 'warning',
          category: 'injury',
          message: `Moderate pain (${painLevel}/10) detected in ${area}. Consider modifying training.`,
          icon: <Warning />,
          priority: 1
        });
      }
      
      // Check for recurring injuries
      const areaInjuries = data.injury.filter(injury => injury.area === area);
      if (areaInjuries.length > 1) {
        newAlerts.push({
          type: 'error',
          category: 'injury',
          message: `Recurring injury detected in ${area}. This may indicate a chronic issue that needs addressing.`,
          icon: <Error />,
          priority: 1
        });
      }
    }

    // CARDIO ANALYSIS
    if (data.cardio.length > 0) {
      const latestCardio = data.cardio[0];
      const heartRate = parseInt(latestCardio.heartRate);
      const duration = parseInt(latestCardio.duration);
      
      // Check heart rate zones
      if (heartRate > 180) {
        newAlerts.push({
          type: 'warning',
          category: 'cardio',
          message: `Very high heart rate detected (${heartRate} bpm). Ensure this is appropriate for your training.`,
          icon: <Warning />,
          priority: 2
        });
      }
      
      // Check session duration
      if (duration > 90) {
        newAlerts.push({
          type: 'info',
          category: 'cardio',
          message: `Long cardio session (${duration} min). Ensure this aligns with your training goals.`,
          icon: <Info />,
          priority: 3
        });
      }
      
      // Check for trends if we have historical data
      if (data.cardio.length > 3) {
        let totalDistance = 0;
        let totalDuration = 0;
        
        for (let i = 0; i < 3; i++) {
          totalDistance += parseFloat(data.cardio[i].distance) || 0;
          totalDuration += parseFloat(data.cardio[i].duration) || 0;
        }
        
        const averagePace = totalDuration / totalDistance;
        
        if (averagePace > 10) { // Example threshold, 10 min/mile
          newAlerts.push({
            type: 'info',
            category: 'cardio',
            message: 'Your recent cardio pace is slower than optimal. Consider adding some speed work.',
            icon: <Info />,
            priority: 3
          });
        }
      }
    }

    // Sort alerts by priority (lower number = higher priority)
    newAlerts.sort((a, b) => a.priority - b.priority);
    
    setAlerts(newAlerts);
  };

  const handleSubmit = async (type) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let data;
      switch (type) {
        case 'strength':
          data = strengthData;
          break;
        case 'cardio':
          data = cardioData;
          break;
        case 'nutrition':
          data = nutritionData;
          break;
        case 'recovery':
          data = recoveryData;
          break;
        case 'wrestling':
          data = wrestlingData;
          break;
        case 'injury':
          data = injuryData;
          break;
      }

      const response = await fetch(`${API_BASE_URL}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(`Rate limit exceeded. Please try again in ${data.retryAfter} seconds.`);
        return;
      }

      if (!response.ok) throw new Error(`Failed to submit ${type} data`);

      const result = await response.json();
      setSuccess(`Successfully submitted ${type} data`);
      
      // Reset form
      switch (type) {
        case 'strength':
          setStrengthData({ exercise: '', weight: '', reps: '', sets: '', notes: '' });
          break;
        case 'cardio':
          setCardioData({ type: '', duration: '', distance: '', heartRate: '', notes: '' });
          break;
        case 'nutrition':
          setNutritionData({ calories: '', protein: '', carbs: '', fats: '', notes: '' });
          break;
        case 'recovery':
          setRecoveryData({ sleepHours: '', hrv: '', soreness: '', notes: '' });
          break;
        case 'wrestling':
          setWrestlingData({ takedownPercentage: '', sparringRounds: '', technique: '', notes: '' });
          break;
        case 'injury':
          setInjuryData({ area: '', painLevel: '', type: '', notes: '' });
          break;
      }

      // Refresh data
      fetchHistoricalData();
      fetchAIInsights();
    } catch (error) {
      console.error(`Error submitting ${type} data:`, error);
      setError(`Failed to submit ${type} data`);
    } finally {
      setLoading(false);
    }
  };

  const renderAlerts = () => {
    if (alerts.length === 0) {
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alerts & Notifications
            </Typography>
            <Typography color="text.secondary">
              No alerts at this time. Continue logging your data for personalized alerts.
            </Typography>
          </CardContent>
        </Card>
      );
    }
    
    // Group alerts by category
    const groupedAlerts = {};
    alerts.forEach(alert => {
      if (!groupedAlerts[alert.category]) {
        groupedAlerts[alert.category] = [];
      }
      groupedAlerts[alert.category].push(alert);
    });
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} color="warning" />
            Alerts & Recommendations
            <Chip 
              label={`${alerts.length} ${alerts.length === 1 ? 'alert' : 'alerts'}`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }}
            />
          </Typography>
          
          <Grid container spacing={2}>
            {Object.keys(groupedAlerts).map(category => (
              <Grid item xs={12} md={6} key={category}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: category === 'injury' ? 'rgba(244, 67, 54, 0.05)' : 
                                    category === 'recovery' ? 'rgba(33, 150, 243, 0.05)' :
                                    'rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ 
                    mb: 1, 
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    pb: 1
                  }}>
                    {category} Alerts
                  </Typography>
                  
                  <List dense>
                    {groupedAlerts[category].map((alert, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          py: 1,
                          backgroundColor: alert.type === 'error' ? 'rgba(244, 67, 54, 0.08)' :
                                          alert.type === 'warning' ? 'rgba(255, 152, 0, 0.08)' :
                                          alert.type === 'success' ? 'rgba(76, 175, 80, 0.08)' :
                                          'rgba(33, 150, 243, 0.08)',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {alert.type === 'error' && <Error color="error" sx={{ mr: 1 }} />}
                              {alert.type === 'warning' && <Warning color="warning" sx={{ mr: 1 }} />}
                              {alert.type === 'success' && <CheckCircle color="success" sx={{ mr: 1 }} />}
                              {alert.type === 'info' && <Info color="info" sx={{ mr: 1 }} />}
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {alert.message}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
          
          {alerts.length > 0 && alerts.some(alert => alert.type === 'error') && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error">
                <AlertTitle>Attention Required</AlertTitle>
                You have critical alerts that need immediate attention. Please review the recommendations.
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAIInsights = () => {
    const tabs = ['strength', 'cardio', 'nutrition', 'recovery', 'wrestling', 'injury'];
    const currentType = tabs[activeTab];
    const currentInsights = aiInsights[currentType];

    if (!currentInsights) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No AI insights available. Submit data to generate insights.
        </Alert>
      );
    }

    // Check if we have a rate limit message instead of actual insights
    if (currentInsights.includes('Rate limit exceeded')) {
      return (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {currentInsights}
        </Alert>
      );
    }

    // Parse the insights into sections if possible
    let structuredInsights = { 
      raw: currentInsights,
      sections: []
    };

    try {
      // Try to identify sections in the AI response using patterns like numbered lists
      const numberedSections = currentInsights.split(/\d+\.\s+/);
      
      if (numberedSections.length > 1) {
        // First item is usually empty or an intro, skip it if empty
        const startIndex = numberedSections[0].trim() === '' ? 1 : 0;
        
        for (let i = startIndex; i < numberedSections.length; i++) {
          const sectionText = numberedSections[i].trim();
          if (sectionText) {
            // Try to split into title and content
            const lines = sectionText.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            structuredInsights.sections.push({
              title: title,
              content: content || title // if no content, use title as content
            });
          }
        }
      }
    } catch (e) {
      console.error('Error parsing AI insights:', e);
      // Fall back to raw text if parsing fails
    }

    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              AI Performance Report & Recommendations
            </Typography>
            <Tooltip title="Refresh Insights">
              <IconButton onClick={fetchAIInsights}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {structuredInsights.sections.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {structuredInsights.sections.map((section, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 255, 0.03)' : 'rgba(0, 128, 0, 0.03)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ 
                        color: index % 2 === 0 ? 'primary.main' : 'success.main',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {index === 0 && <TrendingUp sx={{ mr: 1 }} />}
                        {index === 1 && <Info sx={{ mr: 1 }} />}
                        {index === 2 && <CheckCircle sx={{ mr: 1 }} />}
                        {section.title}
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {section.content}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Insights & Recommendations
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {structuredInsights.raw}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {currentInsights}
            </Typography>
          )}
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Key Action Items:
            </Typography>
            {renderActionItems(currentType, currentInsights)}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderActionItems = (type, insights) => {
    // Extract action items from the insights
    let actionItems = [];
    
    try {
      // Look for patterns that may indicate action items
      const actionPatterns = [
        /Action items?[:\s]+([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i,
        /Recommendations?[:\s]+([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i, 
        /You should[:\s]+([\s\S]+?)(?=\n\n|\n[A-Z]|$)/i
      ];
      
      let actionText = '';
      
      for (const pattern of actionPatterns) {
        const match = insights.match(pattern);
        if (match && match[1]) {
          actionText = match[1].trim();
          break;
        }
      }
      
      if (actionText) {
        // Split into bullet points or lines
        actionItems = actionText
          .split(/\n|•|\*|\-/)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
      
      // If no action items found, create default ones based on type
      if (actionItems.length === 0) {
        switch(type) {
          case 'strength':
            actionItems = [
              "Focus on proper form to prevent injuries and maximize gains",
              "Ensure adequate rest between training sessions",
              "Progressive overload by gradually increasing weight or reps"
            ];
            break;
          case 'cardio':
            actionItems = [
              "Maintain heart rate in the optimal zone for your goals",
              "Vary intensity with interval training for better results",
              "Stay hydrated during cardio sessions"
            ];
            break;
          case 'nutrition':
            actionItems = [
              "Ensure adequate protein intake for muscle recovery",
              "Time carbohydrate intake around workout sessions",
              "Stay hydrated throughout the day"
            ];
            break;
          case 'recovery':
            actionItems = [
              "Prioritize sleep quality and duration",
              "Use active recovery techniques on rest days",
              "Monitor HRV to detect overtraining early"
            ];
            break;
          case 'wrestling':
            actionItems = [
              "Practice key techniques with high repetition",
              "Use video analysis to identify areas for improvement",
              "Focus on conditioning specific to wrestling demands"
            ];
            break;
          case 'injury':
            actionItems = [
              "Follow proper rehabilitation protocols",
              "Don't rush back to training before fully recovered",
              "Address biomechanical issues that may have caused the injury"
            ];
            break;
        }
      }
    } catch (e) {
      console.error('Error extracting action items:', e);
      // Provide default action items if extraction fails
      actionItems = [
        "Continue monitoring your performance trends",
        "Focus on recovery between training sessions",
        "Maintain consistent data logging for better insights"
      ];
    }
    
    // Render action items as a list
    return (
      <List>
        {actionItems.map((item, index) => (
          <ListItem key={index} sx={{ py: 0.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body1">{item}</Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderPerformanceCharts = () => {
    const tabs = ['strength', 'cardio', 'nutrition', 'recovery', 'wrestling', 'injury'];
    const currentType = tabs[activeTab];
    const currentData = historicalData[currentType];

    if (!currentData || currentData.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No historical data available for visualization. Submit data to see performance charts.
        </Alert>
      );
    }

    // Prepare data for charts based on type
    let lineChartData = [];
    let pieChartData = [];

    switch(currentType) {
      case 'strength':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          weight: Number(item.weight),
          reps: Number(item.reps),
          sets: Number(item.sets),
          volume: Number(item.weight) * Number(item.reps) * Number(item.sets)
        })).reverse();
        
        if (lineChartData.length > 0) {
          const exerciseCount = {};
          currentData.forEach(item => {
            exerciseCount[item.exercise] = (exerciseCount[item.exercise] || 0) + 1;
          });
          
          pieChartData = Object.keys(exerciseCount).map(key => ({
            name: key,
            value: exerciseCount[key]
          }));
        }
        break;
        
      case 'cardio':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          duration: Number(item.duration),
          distance: Number(item.distance),
          heartRate: Number(item.heartRate)
        })).reverse();
        
        if (lineChartData.length > 0) {
          const typeCount = {};
          currentData.forEach(item => {
            typeCount[item.type] = (typeCount[item.type] || 0) + 1;
          });
          
          pieChartData = Object.keys(typeCount).map(key => ({
            name: key,
            value: typeCount[key]
          }));
        }
        break;
        
      case 'nutrition':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          calories: Number(item.calories),
          protein: Number(item.protein),
          carbs: Number(item.carbs),
          fats: Number(item.fats)
        })).reverse();
        
        if (lineChartData.length > 0 && lineChartData[0].calories) {
          pieChartData = [
            { name: 'Protein', value: (Number(lineChartData[0].protein) * 4) },
            { name: 'Carbs', value: (Number(lineChartData[0].carbs) * 4) },
            { name: 'Fats', value: (Number(lineChartData[0].fats) * 9) }
          ];
        }
        break;
        
      case 'recovery':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          sleepHours: Number(item.sleepHours),
          hrv: Number(item.hrv),
          soreness: Number(item.soreness)
        })).reverse();
        
        if (lineChartData.length > 0) {
          pieChartData = [
            { name: 'Sleep', value: lineChartData[0].sleepHours },
            { name: 'Recovery', value: 10 - lineChartData[0].soreness },
            { name: 'Stress', value: 100 - lineChartData[0].hrv }
          ];
        }
        break;
        
      case 'wrestling':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          takedownPercentage: Number(item.takedownPercentage),
          sparringRounds: Number(item.sparringRounds)
        })).reverse();
        
        if (lineChartData.length > 0) {
          const techniqueCount = {};
          currentData.forEach(item => {
            techniqueCount[item.technique] = (techniqueCount[item.technique] || 0) + 1;
          });
          
          pieChartData = Object.keys(techniqueCount).map(key => ({
            name: key,
            value: techniqueCount[key]
          }));
        }
        break;
        
      case 'injury':
        lineChartData = currentData.slice(0, 10).map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          painLevel: Number(item.painLevel)
        })).reverse();
        
        if (lineChartData.length > 0) {
          const areaCount = {};
          currentData.forEach(item => {
            areaCount[item.area] = (areaCount[item.area] || 0) + 1;
          });
          
          pieChartData = Object.keys(areaCount).map(key => ({
            name: key,
            value: areaCount[key]
          }));
        }
        break;
    }

    // Get line chart keys and colors
    const getLineKeys = () => {
      switch(currentType) {
        case 'strength': return [
          { key: 'weight', color: '#8884d8', name: 'Weight (lbs)' },
          { key: 'volume', color: '#82ca9d', name: 'Volume' }
        ];
        case 'cardio': return [
          { key: 'duration', color: '#8884d8', name: 'Duration (min)' }, 
          { key: 'distance', color: '#82ca9d', name: 'Distance (mi)' },
          { key: 'heartRate', color: '#ff8042', name: 'Heart Rate (bpm)' }
        ];
        case 'nutrition': return [
          { key: 'calories', color: '#8884d8', name: 'Calories' },
          { key: 'protein', color: '#82ca9d', name: 'Protein (g)' },
          { key: 'carbs', color: '#ffc658', name: 'Carbs (g)' },
          { key: 'fats', color: '#ff8042', name: 'Fats (g)' }
        ];
        case 'recovery': return [
          { key: 'sleepHours', color: '#8884d8', name: 'Sleep (hrs)' },
          { key: 'hrv', color: '#82ca9d', name: 'HRV' },
          { key: 'soreness', color: '#ff8042', name: 'Soreness (1-10)' }
        ];
        case 'wrestling': return [
          { key: 'takedownPercentage', color: '#8884d8', name: 'Takedown %' },
          { key: 'sparringRounds', color: '#82ca9d', name: 'Sparring Rounds' }
        ];
        case 'injury': return [
          { key: 'painLevel', color: '#ff8042', name: 'Pain Level (1-10)' }
        ];
        default: return [];
      }
    };

    const lineKeys = getLineKeys();

    return (
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)} Performance Trends
                <Typography variant="caption" sx={{ ml: 1 }}>
                  (Last 10 entries)
                </Typography>
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <ChartTooltip 
                    formatter={(value, name) => [`${value}`, name]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  {lineKeys.map(item => (
                    <Line 
                      key={item.key}
                      type="monotone" 
                      dataKey={item.key} 
                      stroke={item.color} 
                      name={item.name}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)} Distribution
              </Typography>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ pt: 10, pb: 10, textAlign: 'center' }}>
                  Not enough data for distribution analysis
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderStrengthForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Exercise"
            value={strengthData.exercise}
            onChange={(e) => setStrengthData({ ...strengthData, exercise: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Weight (lbs)"
            value={strengthData.weight}
            onChange={(e) => setStrengthData({ ...strengthData, weight: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Reps"
            value={strengthData.reps}
            onChange={(e) => setStrengthData({ ...strengthData, reps: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Sets"
            value={strengthData.sets}
            onChange={(e) => setStrengthData({ ...strengthData, sets: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={strengthData.notes}
            onChange={(e) => setStrengthData({ ...strengthData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderCardioForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Type"
            value={cardioData.type}
            onChange={(e) => setCardioData({ ...cardioData, type: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Duration (minutes)"
            value={cardioData.duration}
            onChange={(e) => setCardioData({ ...cardioData, duration: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Distance (miles)"
            value={cardioData.distance}
            onChange={(e) => setCardioData({ ...cardioData, distance: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Heart Rate (bpm)"
            value={cardioData.heartRate}
            onChange={(e) => setCardioData({ ...cardioData, heartRate: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={cardioData.notes}
            onChange={(e) => setCardioData({ ...cardioData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderNutritionForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Calories"
            value={nutritionData.calories}
            onChange={(e) => setNutritionData({ ...nutritionData, calories: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Protein (g)"
            value={nutritionData.protein}
            onChange={(e) => setNutritionData({ ...nutritionData, protein: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Carbs (g)"
            value={nutritionData.carbs}
            onChange={(e) => setNutritionData({ ...nutritionData, carbs: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Fats (g)"
            value={nutritionData.fats}
            onChange={(e) => setNutritionData({ ...nutritionData, fats: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={nutritionData.notes}
            onChange={(e) => setNutritionData({ ...nutritionData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderRecoveryForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Sleep Hours"
            value={recoveryData.sleepHours}
            onChange={(e) => setRecoveryData({ ...recoveryData, sleepHours: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="HRV"
            value={recoveryData.hrv}
            onChange={(e) => setRecoveryData({ ...recoveryData, hrv: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Soreness (1-10)"
            value={recoveryData.soreness}
            onChange={(e) => setRecoveryData({ ...recoveryData, soreness: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={recoveryData.notes}
            onChange={(e) => setRecoveryData({ ...recoveryData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderWrestlingForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Takedown Percentage"
            value={wrestlingData.takedownPercentage}
            onChange={(e) => setWrestlingData({ ...wrestlingData, takedownPercentage: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Sparring Rounds"
            value={wrestlingData.sparringRounds}
            onChange={(e) => setWrestlingData({ ...wrestlingData, sparringRounds: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Technique"
            value={wrestlingData.technique}
            onChange={(e) => setWrestlingData({ ...wrestlingData, technique: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={wrestlingData.notes}
            onChange={(e) => setWrestlingData({ ...wrestlingData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderInjuryForm = () => (
    <Box component="form" sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Area"
            value={injuryData.area}
            onChange={(e) => setInjuryData({ ...injuryData, area: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Pain Level (1-10)"
            value={injuryData.painLevel}
            onChange={(e) => setInjuryData({ ...injuryData, painLevel: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Type"
            value={injuryData.type}
            onChange={(e) => setInjuryData({ ...injuryData, type: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={injuryData.notes}
            onChange={(e) => setInjuryData({ ...injuryData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 0:
        return renderStrengthForm();
      case 1:
        return renderCardioForm();
      case 2:
        return renderNutritionForm();
      case 3:
        return renderRecoveryForm();
      case 4:
        return renderWrestlingForm();
      case 5:
        return renderInjuryForm();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(120deg, #2196F3 0%, #1976D2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Athlete Performance Dashboard
            </Typography>
            <Typography variant="subtitle1">
              Track, analyze, and optimize your training with AI-powered insights
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button 
              variant="contained" 
              onClick={fetchAIInsights}
              startIcon={<Refresh />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
              }}
            >
              Refresh Insights
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {renderAlerts()}

      <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: '#f5f5f5',
            '& .MuiTab-root': {
              py: 2,
              minHeight: '72px',
              textTransform: 'none',
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TrendingUp sx={{ mb: 0.5 }} />
                <Typography variant="body2">Strength</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style={{ marginBottom: '4px' }}>
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
                </svg>
                <Typography variant="body2">Cardio</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style={{ marginBottom: '4px' }}>
                  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                </svg>
                <Typography variant="body2">Nutrition</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style={{ marginBottom: '4px' }}>
                  <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z" />
                </svg>
                <Typography variant="body2">Recovery</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" style={{ marginBottom: '4px' }}>
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z" />
                </svg>
                <Typography variant="body2">Injury</Typography>
              </Box>
            } 
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            pb: 1, 
            mb: 2, 
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            textTransform: 'capitalize'
          }}>
            {['Strength Training', 'Cardio', 'Nutrition', 'Recovery', 'Wrestling', 'Injury'][activeTab]} Data Input
          </Typography>
          
          {renderForm()}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(['strength', 'cardio', 'nutrition', 'recovery', 'wrestling', 'injury'][activeTab])}
              disabled={loading}
              sx={{ px: 4, py: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit & Analyze'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {renderAIInsights()}
      {renderPerformanceCharts()}
    </Container>
  );
};

export default AthleteDashboard; 