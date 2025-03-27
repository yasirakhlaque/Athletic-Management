import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const HealthManagement = () => {
  const [injuries, setInjuries] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newInjury, setNewInjury] = useState({
    type: '',
    severity: '',
    date: '',
    status: 'Active',
    notes: '',
  });
  const [aiRecommendations, setAiRecommendations] = useState('');

  useEffect(() => {
    // Simulated injury data
    const mockInjuries = [
      {
        id: 1,
        type: 'Knee Strain',
        severity: 'Moderate',
        date: '2024-03-15',
        status: 'Active',
        notes: 'Recovering from training session',
      },
      {
        id: 2,
        type: 'Shoulder Tendonitis',
        severity: 'Mild',
        date: '2024-03-10',
        status: 'Recovered',
        notes: 'Completed physiotherapy program',
      },
    ];
    setInjuries(mockInjuries);
    generateAIRecommendations(mockInjuries);
  }, []);

  const generateAIRecommendations = async (injuryData) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Based on these sports injuries: ${JSON.stringify(injuryData)}, provide rehabilitation recommendations and preventive measures.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiRecommendations(response.text());
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      setAiRecommendations('Unable to generate recommendations at this time.');
    }
  };

  const handleAddInjury = () => {
    setInjuries([...injuries, { ...newInjury, id: injuries.length + 1 }]);
    setOpenDialog(false);
    setNewInjury({
      type: '',
      severity: '',
      date: '',
      status: 'Active',
      notes: '',
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'mild':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'severe':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Health Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Injury History</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                  Add Injury
                </Button>
              </Box>
              <List>
                {injuries.map((injury) => (
                  <ListItem key={injury.id} divider>
                    <ListItemText
                      primary={injury.type}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Date: {injury.date}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Notes: {injury.notes}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={injury.severity}
                      color={getSeverityColor(injury.severity)}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Recommendations
              </Typography>
              <Typography variant="body1">
                {aiRecommendations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Injury</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Injury Type"
            fullWidth
            value={newInjury.type}
            onChange={(e) => setNewInjury({ ...newInjury, type: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Severity"
            fullWidth
            value={newInjury.severity}
            onChange={(e) => setNewInjury({ ...newInjury, severity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newInjury.date}
            onChange={(e) => setNewInjury({ ...newInjury, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={newInjury.notes}
            onChange={(e) => setNewInjury({ ...newInjury, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddInjury} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthManagement; 