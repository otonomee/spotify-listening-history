"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Image from "next/image";

// Define the Track interface
interface Track {
  id: string; // Adjust the type as necessary
  name: string;
  artist: string;
  archived_at?: string;
  album?: {
    // Add the album property
    images: { url: string }[]; // Define the structure of the album images
  };
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [archivedTracks, setArchivedTracks] = useState<Track[]>([]);

  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3000/auth/login"; // Redirect to the login route
  };

  const handleArchiveTracks = async () => {
    try {
      const response = await fetch("/archive-tracks", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Track archiving process started:", data.message);
        setTracks(data.tracks); // Update the state with the fetched tracks
      } else {
        console.error("Failed to start track archiving.");
      }
    } catch (error) {
      console.error("Error during track archiving:", error);
    }
  };

  const fetchArchivedTracks = async () => {
    try {
      const response = await fetch("http://localhost:3001/archive-tracks"); // Adjust the endpoint as needed
      if (response.ok) {
        const data = await response.json();
        setArchivedTracks(data.tracks); // Assuming the response contains the archived tracks
      } else {
        console.error("Failed to fetch archived tracks.");
      }
    } catch (error) {
      console.error("Error fetching archived tracks:", error);
    }
  };

  useEffect(() => {
    const fetchTracks = async () => {
      // Instead of fetching from a non-existent endpoint, trigger the archiving process
      await handleArchiveTracks(); // Call the function to fetch and archive tracks
    };

    fetchTracks();
    fetchArchivedTracks(); // Fetch archived tracks on component mount
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

      <h2 className="mt-4">Your Archived Tracks</h2>
      <div id="archived-tracks">
        {archivedTracks.map((track) => (
          <div key={track.id} className="track">
            {track.album && track.album.images[2] ? (
              <Image src={track.album.images[2].url} alt="Album art" width={500} height={500} />
            ) : (
              <Image src="/placeholder.jpg" alt="Placeholder art" width={500} height={500} />
            )}
            <strong>{track.name}</strong> by {track.artist}
            <br />
            <small>Archived at: {track.archived_at ? new Date(track.archived_at).toLocaleString() : "Not archived"}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
