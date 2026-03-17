import './globals.css';

export const metadata = {
  title: 'HashViz — Interactive Hash Table Visualizer',
  description: 'Learn, visualize, and master hash tables with our premium interactive platform. Watch hashing algorithms work in real-time with beautiful animations.',
  keywords: 'hash table, data structures, visualization, algorithms, hashing, education, interactive learning',
  openGraph: {
    title: 'HashViz — Interactive Hash Table Visualizer',
    description: 'Master hash tables with real-time interactive visualizations',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
