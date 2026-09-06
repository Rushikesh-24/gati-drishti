# GATI DRISHTI

GATI DRISHTI is a next-generation Dynamic Railway ETA Intelligence and Network Management platform. It combines real-time movement data, historical patterns, and network conditions to continuously forecast train arrival times with unprecedented accuracy.

## Features

- **Live Train Tracking & Dynamic ETA**: High-frequency location updates integrated with machine learning models that adapt to current network conditions, adjusting predictions based on weather, congestion, and historical performance.
- **Network Intelligence Core**: A live simulation dashboard (focusing on the Mumbai — Delhi WR corridor) that visualizes train movements, tracks node congestion, and mathematically predicts overtaking and crossing events.
- **Historical Intelligence**: Deep analysis of past train runs to identify bottleneck patterns, systemic delays, and station performance metrics.
- **API Sandbox**: A comprehensive developer portal to test and integrate with our live mock APIs for historical data, infrastructure alerts, and real-time ETAs.
- **Internationalization (i18n)**: Seamless language switching supporting English, Hindi, Marathi, and Gujarati.
- **Modern Tech Stack**: Built with Next.js (App Router), Tailwind CSS, Framer Motion, and shadcn/ui for a highly responsive, animated, and accessible user experience.

## Getting Started

First, install the dependencies:

```bash
bun install
# or npm install, yarn, pnpm
```

Then, run the development server:

```bash
bun dev
# or npm run dev, yarn dev, pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Next.js App Router pages (Dashboard, Network Core, API Portal).
- `/components`: Reusable UI components including train search, live status, AI prediction panels, and network map SVGs.
- `/lib`: Utility functions, AI prediction logic, and mock data generators for trains, network nodes, and APIs.
- `/hooks`: Custom React hooks for data polling and state management.

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide React](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## License

This project is licensed under the MIT License.
