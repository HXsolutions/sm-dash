import './globals.css';

export const metadata = {
  title: 'Haxxcel OS | Social Automation',
  description: 'AI-powered social media automation dashboard for Haxxcel Solutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
