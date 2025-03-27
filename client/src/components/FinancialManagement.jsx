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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const FinancialManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [openContractDialog, setOpenContractDialog] = useState(false);
  const [openEarningDialog, setOpenEarningDialog] = useState(false);
  const [newContract, setNewContract] = useState({
    title: '',
    party: '',
    value: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: '',
  });
  const [newEarning, setNewEarning] = useState({
    source: '',
    amount: '',
    date: '',
    category: '',
    notes: '',
  });
  const [aiFinancialAdvice, setAiFinancialAdvice] = useState('');

  useEffect(() => {
    // Simulated data
    const mockContracts = [
      {
        id: 1,
        title: 'Sponsorship Agreement',
        party: 'SportsTech Inc.',
        value: '$50,000',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'Active',
        notes: 'Annual sponsorship contract',
      },
      {
        id: 2,
        title: 'Competition Contract',
        party: 'National League',
        value: '$25,000',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        status: 'Pending',
        notes: 'Season contract for competitions',
      },
    ];

    const mockEarnings = [
      {
        id: 1,
        source: 'Competition Prize',
        amount: '$10,000',
        date: '2024-03-15',
        category: 'Competition',
        notes: 'First place prize money',
      },
      {
        id: 2,
        source: 'Sponsorship Payment',
        amount: '$5,000',
        date: '2024-03-01',
        category: 'Sponsorship',
        notes: 'Monthly sponsorship payment',
      },
    ];

    setContracts(mockContracts);
    setEarnings(mockEarnings);
    generateAIFinancialAdvice(mockContracts, mockEarnings);
  }, []);

  const generateAIFinancialAdvice = async (contracts, earnings) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Based on these contracts: ${JSON.stringify(contracts)} and earnings: ${JSON.stringify(earnings)}, provide financial management advice, tax considerations, and investment recommendations.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAiFinancialAdvice(response.text());
    } catch (error) {
      console.error('Error generating AI financial advice:', error);
      setAiFinancialAdvice('Unable to generate financial advice at this time.');
    }
  };

  const handleAddContract = () => {
    setContracts([...contracts, { ...newContract, id: contracts.length + 1 }]);
    setOpenContractDialog(false);
    setNewContract({
      title: '',
      party: '',
      value: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      notes: '',
    });
  };

  const handleAddEarning = () => {
    setEarnings([...earnings, { ...newEarning, id: earnings.length + 1 }]);
    setOpenEarningDialog(false);
    setNewEarning({
      source: '',
      amount: '',
      date: '',
      category: '',
      notes: '',
    });
  };

  const calculateTotalEarnings = () => {
    return earnings.reduce((total, earning) => {
      const amount = parseFloat(earning.amount.replace(/[^0-9.-]+/g, ''));
      return total + amount;
    }, 0);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Financial & Contract Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Contracts</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenContractDialog(true)}>
                  Add Contract
                </Button>
              </Box>
              <List>
                {contracts.map((contract) => (
                  <ListItem key={contract.id} divider>
                    <ListItemText
                      primary={contract.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            Party: {contract.party} | Value: {contract.value}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Period: {contract.startDate} to {contract.endDate}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            Notes: {contract.notes}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={contract.status}
                      color={contract.status === 'Active' ? 'success' : 'warning'}
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
                <Typography variant="h6">Earnings</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenEarningDialog(true)}>
                  Add Earning
                </Button>
              </Box>
              <Typography variant="h6" gutterBottom>
                Total Earnings: ${calculateTotalEarnings().toLocaleString()}
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Category</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell>{earning.date}</TableCell>
                        <TableCell>{earning.source}</TableCell>
                        <TableCell>{earning.amount}</TableCell>
                        <TableCell>{earning.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Financial Advice
              </Typography>
              <Typography variant="body1">
                {aiFinancialAdvice}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openContractDialog} onClose={() => setOpenContractDialog(false)}>
        <DialogTitle>Add New Contract</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Contract Title"
            fullWidth
            value={newContract.title}
            onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Party"
            fullWidth
            value={newContract.party}
            onChange={(e) => setNewContract({ ...newContract, party: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Value"
            fullWidth
            value={newContract.value}
            onChange={(e) => setNewContract({ ...newContract, value: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            value={newContract.startDate}
            onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            value={newContract.endDate}
            onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={newContract.notes}
            onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContractDialog(false)}>Cancel</Button>
          <Button onClick={handleAddContract} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEarningDialog} onClose={() => setOpenEarningDialog(false)}>
        <DialogTitle>Add New Earning</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Source"
            fullWidth
            value={newEarning.source}
            onChange={(e) => setNewEarning({ ...newEarning, source: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Amount"
            fullWidth
            value={newEarning.amount}
            onChange={(e) => setNewEarning({ ...newEarning, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newEarning.date}
            onChange={(e) => setNewEarning({ ...newEarning, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={newEarning.category}
            onChange={(e) => setNewEarning({ ...newEarning, category: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={newEarning.notes}
            onChange={(e) => setNewEarning({ ...newEarning, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEarningDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEarning} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialManagement; 