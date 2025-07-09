# Dealio 🎸

A web application for tracking deals and price history on guitars across online marketplaces. Users can add guitars to their dashboard and monitor when good deals appear for both new and used instruments.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python, FastAPI, SQLite (SQLAlchemy)
- **Styling**: Tailwind CSS with shadcn/ui components

## Project Structure

```
dealio/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components (including shadcn/ui)
│   └── lib/              # Utility functions
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── venv/             # Python virtual environment
└── README.md
```

## Features

### Dashboard UI ✅
- **Empty State**: Clear messaging when no guitars are being tracked
- **Sidebar**: Primary action button and filters for tracked guitars
- **Modal Dialog**: Add new guitars with type selection, brand dropdown, and model input
- **Guitar Cards**: Display tracked guitars with deal information
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS
- **Professional Styling**: Teal accent colors with clean, modern design

### Planned Features 🔄
- Guitar price tracking across multiple retailers
- Deal alerts when prices drop below thresholds
- Price history charts and analytics
- User authentication and profiles
- Favorite guitars and watchlists

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the virtual environment:
```bash
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows
```

3. Install dependencies (if not already done):
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`
- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate back to the root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## UI Components

### Dashboard Features
- **Navigation**: Logo with API status, search bar, user profile
- **Sidebar**: Primary action button, filters (type, brand, model)
- **Empty State**: Prominent call-to-action when dashboard is empty
- **Guitar Cards**: Thumbnail, brand/model, deal status, action buttons
- **Modal Form**: Guitar type (segmented buttons), brand (dropdown), model (text input)

### Design System
- **Colors**: Teal primary (`bg-teal-600`), neutral grays
- **Typography**: Clear hierarchy with proper font weights
- **Spacing**: Consistent padding and margins
- **Interactions**: Hover states, transitions, and feedback

## API Endpoints

- `GET /health` - Health check endpoint

## Development

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:8000`
- CORS is configured to allow frontend-backend communication

## Next Steps

- [ ] Implement Guitar model and `/guitars` endpoint
- [ ] Connect frontend to `/guitars` API
- [ ] Add price tracking and deal detection
- [ ] Implement web scraping for major retailers
- [ ] Add user authentication and personal dashboards
- [ ] Create price history charts and analytics

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
