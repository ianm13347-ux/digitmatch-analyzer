# DigitMatch Analyzer

A production-ready Deriv digit-analysis web application with real-time market data, statistical analysis, signal generation, and backtesting capabilities.

## Features

- **Real-time Market Data**: Live WebSocket connection to Deriv market-data APIs
- **Digit Analysis**: Extract and analyze the last digit from market quotes
- **Statistical Engine**: Frequency analysis, pattern detection, and statistical validation
- **Signal Generation**: Data-driven signal engine with confidence metrics
- **Backtesting**: Walk-forward validation with historical performance tracking
- **Performance Tracking**: Transparent signal history and accuracy metrics
- **Responsive Design**: Mobile-first UI optimized for all devices
- **PWA Support**: Installable as a progressive web app
- **Demo Mode**: Test the application with simulated data
- **Dark Theme**: Professional trading-dashboard aesthetic

## ⚠️ Important Disclaimer

**DigitMatch Analyzer provides statistical analysis of historical and live market data. It does not guarantee the outcome of any future event or trade. Digit analysis is probabilistic and results are based on historical patterns that may not repeat. Use this tool for educational and analytical purposes only.**

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: Zustand
- **Authentication**: Supabase Auth
- **Data Source**: Deriv Public WebSocket API
- **PWA**: Service Worker + Web App Manifest

## Quick Start

### Installation

```bash
git clone https://github.com/ianm13347-ux/digitmatch-analyzer.git
cd digitmatch-analyzer
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials and settings.

### Development

```bash
npm run dev
```

Application will start at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── services/           # Business logic and APIs
├── hooks/              # Custom React hooks
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
├── stores/             # Zustand state stores
├── styles/             # Global styles
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Key Services

### DerivWebSocket Service
- Manages WebSocket connection to Deriv API
- Handles reconnection logic
- Manages subscription lifecycle
- Provides real-time tick data

### Tick Service
- Stores and manages tick history
- Implements rolling buffer pattern
- Handles tick normalization
- Provides efficient data access

### Analysis Engine
- Calculates digit statistics
- Detects patterns
- Performs frequency analysis
- Generates hot/cold digit classifications

### Signal Engine
- Generates candidate signals
- Calculates confidence scores
- Validates statistical evidence
- Tracks signal performance

### Backtesting Engine
- Simulates historical signals
- Prevents look-ahead bias
- Calculates performance metrics
- Provides walk-forward validation

## Deployment

### Vercel

```bash
vercel deploy
```

Environment variables will be configured in Vercel dashboard.

### Netlify

```bash
netlify deploy --prod
```

Create `netlify.toml` with build configuration.

### GitHub Pages

```bash
npm run build
gh-pages -d dist
```

## PWA Installation

Once deployed, the app can be installed on:
- Android devices (Chrome)
- iOS devices (Safari)
- Desktop (Chrome, Edge)

Click the install button in your browser's address bar.

## Signal Confidence & Accuracy

- **Model Confidence**: Based on feature strength and recent validation
- **Historical Validation**: Walk-forward accuracy on past data
- **Confidence Score**: NOT a guarantee of future accuracy
- **Sample Size**: Minimum data points required for signal
- **Model Status**: Indicates whether model has sufficient data

## Development Guidelines

1. **No Hardcoded Guarantees**: Never claim guaranteed accuracy
2. **Transparent Metrics**: Always show how confidence is calculated
3. **Clear Disclaimers**: Include risk warnings prominently
4. **No Auto-Trading**: Analysis only, no automatic trade execution
5. **Data Validation**: Verify digit extraction accuracy
6. **Memory Management**: Use rolling buffers for history
7. **Error Handling**: Graceful degradation on API failures

## Testing Checklist

- [ ] Application builds without TypeScript errors
- [ ] WebSocket connects and receives tick data
- [ ] Digit extraction works with different decimal precisions
- [ ] Backtesting prevents look-ahead bias
- [ ] Dashboard responsive on mobile devices
- [ ] Demo mode works without live data
- [ ] All signals are logged transparently
- [ ] UI distinguishes measured accuracy from confidence
- [ ] No unsupported accuracy guarantees in UI
- [ ] PWA installable and works offline

## Contributing

Fork the repository and create a feature branch:

```bash
git checkout -b feature/your-feature-name
git commit -am 'Add feature description'
git push origin feature/your-feature-name
```

Create a pull request with detailed description.

## License

MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions, please open a GitHub issue.

## Disclaimer

This application is provided for educational and analytical purposes only. It is not financial advice. Always conduct your own research and consult with financial professionals before making any trading decisions. Past performance does not guarantee future results.
