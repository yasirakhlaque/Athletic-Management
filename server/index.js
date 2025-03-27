const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 2,
  queue: [],
  processing: false,
  lastRequestTime: 0
};

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Rate limiting function
const rateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - RATE_LIMIT.lastRequestTime;
  const minInterval = (60 * 1000) / RATE_LIMIT.requestsPerMinute;

  if (timeSinceLastRequest < minInterval) {
    await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
  }

  RATE_LIMIT.lastRequestTime = Date.now();
};

// Queue processing function
const processQueue = async () => {
  if (RATE_LIMIT.processing || RATE_LIMIT.queue.length === 0) return;

  RATE_LIMIT.processing = true;
  const { prompt, resolve, reject } = RATE_LIMIT.queue.shift();

  try {
    await rateLimit();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    resolve(response.text());
  } catch (error) {
    reject(error);
  } finally {
    RATE_LIMIT.processing = false;
    if (RATE_LIMIT.queue.length > 0) {
      processQueue();
    }
  }
};

// Queue a Gemini API request
const queueGeminiRequest = (prompt) => {
  return new Promise((resolve, reject) => {
    RATE_LIMIT.queue.push({ prompt, resolve, reject });
    processQueue();
  });
};

// MongoDB Schemas
const strengthSchema = new mongoose.Schema({
  exercise: String,
  weight: Number,
  reps: Number,
  sets: Number,
  notes: String,
  date: { type: Date, default: Date.now },
});

const cardioSchema = new mongoose.Schema({
  type: String,
  duration: Number,
  distance: Number,
  heartRate: Number,
  notes: String,
  date: { type: Date, default: Date.now },
});

const nutritionSchema = new mongoose.Schema({
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  notes: String,
  date: { type: Date, default: Date.now },
});

const recoverySchema = new mongoose.Schema({
  sleepHours: Number,
  hrv: Number,
  soreness: Number,
  notes: String,
  date: { type: Date, default: Date.now },
});

const wrestlingSchema = new mongoose.Schema({
  takedownPercentage: Number,
  sparringRounds: Number,
  technique: String,
  notes: String,
  date: { type: Date, default: Date.now },
});

const injurySchema = new mongoose.Schema({
  area: String,
  painLevel: Number,
  type: String,
  notes: String,
  date: { type: Date, default: Date.now },
});

// MongoDB Models
const Strength = mongoose.model('Strength', strengthSchema);
const Cardio = mongoose.model('Cardio', cardioSchema);
const Nutrition = mongoose.model('Nutrition', nutritionSchema);
const Recovery = mongoose.model('Recovery', recoverySchema);
const Wrestling = mongoose.model('Wrestling', wrestlingSchema);
const Injury = mongoose.model('Injury', injurySchema);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.post('/api/strength', async (req, res) => {
  try {
    const strengthData = new Strength(req.body);
    await strengthData.save();

    const prompt = `Analyze this strength training data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: strengthData
    });
  } catch (error) {
    console.error('Error saving strength data:', error);
    res.status(500).json({ error: 'Failed to save strength data' });
  }
});

app.post('/api/cardio', async (req, res) => {
  try {
    const cardioData = new Cardio(req.body);
    await cardioData.save();

    const prompt = `Analyze this cardio training data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: cardioData
    });
  } catch (error) {
    console.error('Error saving cardio data:', error);
    res.status(500).json({ error: 'Failed to save cardio data' });
  }
});

app.post('/api/nutrition', async (req, res) => {
  try {
    const nutritionData = new Nutrition(req.body);
    await nutritionData.save();

    const prompt = `Analyze this nutrition data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: nutritionData
    });
  } catch (error) {
    console.error('Error saving nutrition data:', error);
    res.status(500).json({ error: 'Failed to save nutrition data' });
  }
});

app.post('/api/recovery', async (req, res) => {
  try {
    const recoveryData = new Recovery(req.body);
    await recoveryData.save();

    const prompt = `Analyze this recovery data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: recoveryData
    });
  } catch (error) {
    console.error('Error saving recovery data:', error);
    res.status(500).json({ error: 'Failed to save recovery data' });
  }
});

app.post('/api/wrestling', async (req, res) => {
  try {
    const wrestlingData = new Wrestling(req.body);
    await wrestlingData.save();

    const prompt = `Analyze this wrestling training data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: wrestlingData
    });
  } catch (error) {
    console.error('Error saving wrestling data:', error);
    res.status(500).json({ error: 'Failed to save wrestling data' });
  }
});

app.post('/api/injury', async (req, res) => {
  try {
    const injuryData = new Injury(req.body);
    await injuryData.save();

    const prompt = `Analyze this injury data and provide insights: ${JSON.stringify(req.body)}`;
    const insights = await queueGeminiRequest(prompt);

    res.json({
      success: true,
      insights,
      data: injuryData
    });
  } catch (error) {
    console.error('Error saving injury data:', error);
    res.status(500).json({ error: 'Failed to save injury data' });
  }
});

// Get historical data
app.get('/api/history/:type', async (req, res) => {
  try {
    let data;
    switch (req.params.type) {
      case 'strength':
        data = await Strength.find().sort({ date: -1 });
        break;
      case 'cardio':
        data = await Cardio.find().sort({ date: -1 });
        break;
      case 'nutrition':
        data = await Nutrition.find().sort({ date: -1 });
        break;
      case 'recovery':
        data = await Recovery.find().sort({ date: -1 });
        break;
      case 'wrestling':
        data = await Wrestling.find().sort({ date: -1 });
        break;
      case 'injury':
        data = await Injury.find().sort({ date: -1 });
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get AI analysis for historical data
app.get('/api/analysis/:type', async (req, res) => {
  try {
    let data;
    switch (req.params.type) {
      case 'strength':
        data = await Strength.find().sort({ date: -1 }).limit(10);
        break;
      case 'cardio':
        data = await Cardio.find().sort({ date: -1 }).limit(10);
        break;
      case 'nutrition':
        data = await Nutrition.find().sort({ date: -1 }).limit(10);
        break;
      case 'recovery':
        data = await Recovery.find().sort({ date: -1 }).limit(10);
        break;
      case 'wrestling':
        data = await Wrestling.find().sort({ date: -1 }).limit(10);
        break;
      case 'injury':
        data = await Injury.find().sort({ date: -1 }).limit(10);
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    let prompt;
    switch (req.params.type) {
      case 'strength':
        prompt = `Analyze this strength training data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Progress analysis (improvements or plateaus)
        2. Form and technique recommendations
        3. Volume and intensity suggestions
        4. Recovery recommendations
        5. Specific exercise recommendations
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
        
      case 'cardio':
        prompt = `Analyze this cardio training data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Endurance progress analysis
        2. Heart rate zone optimization
        3. Training intensity distribution
        4. Recovery recommendations
        5. Specific workout suggestions
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
        
      case 'nutrition':
        prompt = `Analyze this nutrition data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Macro nutrient balance analysis
        2. Caloric needs assessment
        3. Meal timing recommendations
        4. Pre/post workout nutrition suggestions
        5. Hydration recommendations
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
        
      case 'recovery':
        prompt = `Analyze this recovery data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Sleep quality analysis
        2. HRV trends and implications
        3. Soreness patterns
        4. Recovery optimization suggestions
        5. Rest day recommendations
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
        
      case 'wrestling':
        prompt = `Analyze this wrestling training data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Technique effectiveness analysis
        2. Takedown success rate trends
        3. Sparring intensity assessment
        4. Specific technique recommendations
        5. Training volume suggestions
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
        
      case 'injury':
        prompt = `Analyze this injury data and provide detailed insights and recommendations:
        ${JSON.stringify(data)}
        
        Please include:
        1. Injury risk assessment
        2. Pain pattern analysis
        3. Prevention recommendations
        4. Rehabilitation suggestions
        5. Training modifications
        6. Warning signs or potential issues
        7. Action items for improvement`;
        break;
    }

    const insights = await queueGeminiRequest(prompt);

    res.json({
      insights,
      data: data
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    if (error.message.includes('429')) {
      res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again in a few minutes.',
        retryAfter: 60
      });
    } else {
      res.status(500).json({ error: 'Failed to generate analysis' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 