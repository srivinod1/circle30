import '../styles/globals.css';

export const metadata = {
  title: 'US EV CHARGING STATIONS',
  description: 'Analyze EV charging station distribution across US ZIP codes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
