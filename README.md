# Sports Management Platform

A comprehensive platform for athletes to manage their performance, health, career, and financial aspects with AI-powered insights.

## Features

1. **AI-Powered Performance Insights**
   - Real-time analytics
   - Training progress monitoring
   - Game strategy improvement

2. **Injury & Health Management**
   - Risk assessment
   - Rehabilitation tracking
   - Physiotherapy support

3. **Career & Sponsorship Support**
   - Talent scouting
   - Sponsorship matchmaking
   - Career roadmaps

4. **Financial & Contract Management**
   - Earnings tracking
   - Contract handling
   - Tax compliance

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Athletic-Management
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both client and server directories
   - Add your Google Gemini API key to both `.env` files

4. Start the development servers:
   ```bash
   # Start the server (from the server directory)
   npm run dev

   # Start the client (from the client directory)
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Server (.env)
```
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

## Technologies Used

- React
- Material-UI
- Express.js
- Google Gemini AI
- Recharts
- React Router

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
