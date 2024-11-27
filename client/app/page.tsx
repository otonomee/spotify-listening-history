"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

// Define the Track interface
interface Track {
  id: string; // Adjust the type as necessary
  name: string;
  artist: string;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);

  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3000/auth/login"; // Redirect to the login route
  };

  const handleArchiveTracks = async () => {
    try {
      const response = await fetch("/tracks/archive-tracks", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // Log success message
        setTracks(data.tracks); // Update the state with the fetched tracks
      } else {
        console.error("Failed to start track archiving.");
      }
    } catch (error) {
      console.error("Error during track archiving:", error);
    }
  };

  useEffect(() => {
    const fetchTracks = async () => {
      // Instead of fetching from a non-existent endpoint, trigger the archiving process
      await handleArchiveTracks(); // Call the function to fetch and archive tracks
    };

    fetchTracks();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Welcome to Your Music Archive</h1>
      <Button onClick={handleSpotifyLogin}>Connect to Spotify</Button>
      <Button onClick={handleArchiveTracks}>Archive Tracks</Button>

      <h2 className="mt-4">Your Listening Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Time Capsule</CardTitle>
          <CardDescription>Your complete listening archive.</CardDescription>
        </CardHeader>
        <CardContent>
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <p key={track.id}>
                {track.name} by {track.artist}
              </p>
            ))
          ) : (
            <p>No tracks found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
