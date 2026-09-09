import "./globals.css";

export const metadata = {
  title: "TAPE DECK BEATS",
  description: "Hip-Hop beats for lease or exclusive purchase.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="deck-frame">{children}</div>
      </body>
    </html>
  );
}
