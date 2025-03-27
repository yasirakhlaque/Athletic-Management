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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
} from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const CareerSupport = () => {
  const [sponsorships, setSponsorships] = useState([]);
  const [careerGoals, setCareerGoals] = useState([]);
  const [openSponsorshipDialog, setOpenSponsorshipDialog] = useState(false);
  const [openGoalDialog, setOpenGoalDialog] = useState(false);
  const [newSponsorship, setNewSponsorship] = useState({
    company: '',
    type: '',
    value: '',
    status: 'Pending',
    notes: '',
  });
  const [newGoal, setNewGoal] = useState({
    title: '',
    deadline: '',
    progress: 0,
    description: '',
  });
  const [aiCareerAdvice, setAiCareerAdvice] = useState('');

  useEffect(() => {
    // Simulated data
    const mockSponsorships = [
      {
        id: 1,
        company: 'SportsTech Inc.',
        type: 'Equipment',
        value: '$10,000',
        status: 'Active',
        notes: 'Equipment sponsorship for training',
      },
      {
        id: 2,
        company: 'EnergyDrink Co.',
        type: 'Financial',
        value: '$5,000',
        status: 'Pending',
        notes: 'Monthly sponsorship deal',
      },
    ];

    const mockGoals = [
      {
        id: 1,
        title: 'National Championship',
        deadline: '2024-12-31',
        progress: 75,
        description: 'Win the national championship in my category',
      },
      {
        id: 2,
        title: 'Olympic Qualification',
        deadline: '2025-06-30',
        progress: 30,
        description: 'Qualify for the Olympic team',
      },
    ];

    setSponsorships(mockSponsorships);
    setCareerGoals(mockGoals);
    generateAICareerAdvice(mockGoals, mockSponsorships);
  }, []);

  const generateAICareerAdvice = async (goals, sponsorships) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Based on these career goals: ${JSON.stringify(goals)} and sponsorships: ${JSON.stringify(sponsorships)}, provide career development advice and sponsorship strategy recommendations.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiCareerAdvice(response.text());
    } catch (error) {
      console.error('Error generating AI career advice:', error);
      setAiCareerAdvice('Unable to generate career advice at this time.');
    }
  };

  const handleAddSponsorship = () => {
    setSponsorships([...sponsorships, { ...newSponsorship, id: sponsorships.length + 1 }]);
    setOpenSponsorshipDialog(false);
    setNewSponsorship({
      company: '',
      type: '',
      value: '',
      status: 'Pending',
      notes: '',
    });
  };

  const handleAddGoal = () => {
    setCareerGoals([...careerGoals, { ...newGoal, id: careerGoals.length + 1 }]);
    setOpenGoalDialog(false);
    setNewGoal({
      title: '',
      deadline: '',
      progress: 0,
      description: '',
    });
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Career & Sponsorship Support
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sponsorships</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenSponsorshipDialog(true)}>
                  Add Sponsorship
                </Button>
              </Box>
              <List>
                {sponsorships.map((sponsorship) => (
                  <ListItem key={sponsorship.id} divider>
                    <ListItemText
                      primary={sponsorship.company}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Type: {sponsorship.type} | Value: {sponsorship.value}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Notes: {sponsorship.notes}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={sponsorship.status}
                      color={sponsorship.status === 'Active' ? 'success' : 'warning'}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Career Goals</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenGoalDialog(true)}>
                  Add Goal
                </Button>
              </Box>
              <List>
                {careerGoals.map((goal) => (
                  <ListItem key={goal.id} divider>
                    <ListItemText
                      primary={goal.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Deadline: {goal.deadline}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            {goal.description}
                          </Typography>
                          <Box mt={1}>
                            <LinearProgress variant="determinate" value={goal.progress} />
                            <Typography variant="body2" color="textSecondary">
                              Progress: {goal.progress}%
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Career Advice
              </Typography>
              <Typography variant="body1">
                {aiCareerAdvice}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openSponsorshipDialog} onClose={() => setOpenSponsorshipDialog(false)}>
        <DialogTitle>Add New Sponsorship</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Company"
            fullWidth
            value={newSponsorship.company}
            onChange={(e) => setNewSponsorship({ ...newSponsorship, company: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Type"
            fullWidth
            value={newSponsorship.type}
            onChange={(e) => setNewSponsorship({ ...newSponsorship, type: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Value"
            fullWidth
            value={newSponsorship.value}
            onChange={(e) => setNewSponsorship({ ...newSponsorship, value: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={newSponsorship.notes}
            onChange={(e) => setNewSponsorship({ ...newSponsorship, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSponsorshipDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSponsorship} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)}>
        <DialogTitle>Add New Career Goal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Goal Title"
            fullWidth
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Deadline"
            type="date"
            fullWidth
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Progress (%)"
            type="number"
            fullWidth
            value={newGoal.progress}
            onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
            InputProps={{ inputProps: { min: 0, max: 100 } }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGoalDialog(false)}>Cancel</Button>
          <Button onClick={handleAddGoal} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareerSupport; 