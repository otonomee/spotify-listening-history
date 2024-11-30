"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Coffee } from "lucide-react";

interface Track {
  id: string;
  name: string;
  artist: string;
  played_at?: string;
  album?: {
    images: { url: string }[];
  };
}

export default function Page() {
  const [currentMonthTracks, setCurrentMonthTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSpotifyLogin = () => {
    window.location.href = "https://spotify-monthly-playlister.vercel.app/auth/login";
  };

  const handleDonate = () => {
    window.open("https://buy.stripe.com/dR60443uah0m7WUcMM", "_blank");
  };

  const fetchCurrentMonthTracks = async () => {
    try {
      const response = await fetch("/api/current-month-tracks");
      if (response.ok) {
        const data = await response.json();
        setCurrentMonthTracks(data.tracks);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMonthTracks();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8h20c1.1 0 2 .9 2 2v16c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" fill="#1DB954" />
                <path d="M28 8l-4-4H8L4 8" fill="#1DB954" stroke="#1DB954" strokeWidth="2" strokeLinejoin="round" />
                <path d="M16 12a7 7 0 0 1 7 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 15a4 4 0 0 1 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="19" r="1.5" fill="white" />
              </svg>
              <span className="text-xl font-bold text-zinc-900">Spotchive</span>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleDonate} variant="outline" className="hidden sm:flex items-center gap-2 border-zinc-200 hover:bg-zinc-50">
                <Coffee className="w-4 h-4" />
                <span>Support Project</span>
              </Button>
              <Button onClick={handleSpotifyLogin} className="bg-[#1DB954] hover:bg-[#1DB954]/90 text-white flex items-center gap-2 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.01-1.859-6.802-2.28-11.262-1.25-.422.1-.851-.16-.95-.58-.101-.422.16-.851.58-.95 4.891-1.121 9.112-.63 12.482 1.5.372.23.49.721.251 1.04zm1.47-3.272c-.301.459-.921.61-1.391.301-3.442-2.14-8.682-2.76-12.723-1.51-.491.16-1.021-.13-1.181-.63-.16-.491.131-1.021.63-1.181 4.641-1.391 10.432-.721 14.394 1.7.48.301.63.921.301 1.381zm.13-3.391c-4.131-2.481-10.952-2.71-14.894-1.501-.601.18-1.231-.181-1.411-.781-.181-.601.18-1.231.78-1.411 4.561-1.381 12.133-1.121 16.894 1.73.571.341.761 1.082.421 1.652-.34.571-1.091.761-1.652.421z" />
                </svg>
                Connect Spotify
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-zinc-900">Your Monthly Music Archive</h1>
          <p className="text-zinc-600 text-lg">Spotchive automatically creates a playlist for every month, saving all the songs you discover.</p>
        </div>

        <Card className="max-w-3xl mx-auto border border-zinc-200 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50">
            <div>
              <CardTitle className="text-zinc-900">November 2024 Playlist</CardTitle>
              <p className="text-zinc-600 text-sm mt-1">Updated in real-time as you listen</p>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-2 bg-white hover:bg-zinc-100 shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.241-3.01-1.859-6.802-2.28-11.262-1.25-.422.1-.851-.16-.95-.58-.101-.422.16-.851.58-.95 4.891-1.121 9.112-.63 12.482 1.5.372.23.49.721.251 1.04zm1.47-3.272c-.301.459-.921.61-1.391.301-3.442-2.14-8.682-2.76-12.723-1.51-.491.16-1.021-.13-1.181-.63-.16-.491.131-1.021.63-1.181 4.641-1.391 10.432-.721 14.394 1.7.48.301.63.921.301 1.381zm.13-3.391c-4.131-2.481-10.952-2.71-14.894-1.501-.601.18-1.231-.181-1.411-.781-.181-.601.18-1.231.78-1.411 4.561-1.381 12.133-1.121 16.894 1.73.571.341.761 1.082.421 1.652-.34.571-1.091.761-1.652.421z" />
              </svg>
              Open in Spotify
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded" />
                ))}
              </div>
            ) : currentMonthTracks.length > 0 ? (
              <div className="space-y-4">
                {currentMonthTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    {track.album?.images[2] && (
                      <Image src={track.album.images[2].url} alt="Album art" width={48} height={48} className="rounded w-10 h-10 sm:w-12 sm:h-12" />
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    {track.played_at && (
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(track.played_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="text-muted-foreground mb-2">No tracks in this month&apos;s playlist yet</p>
                <p className="text-sm text-muted-foreground">Connect your Spotify account to start archiving your music</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
