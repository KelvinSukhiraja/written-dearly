"use client";

import { useState } from "react";
import { youtubeVideoId } from "@/lib/invitations/youtube";
import "./youtube-music.css";

export function YouTubeMusic({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const id = youtubeVideoId(url);
  if (!id) return null;
  return (
    <div className="youtube-music">
      {loaded ? (
        <>
          <iframe
            key={id}
            title={`${title} — YouTube video`}
            src={`https://www.youtube-nocookie.com/embed/${id}?playsinline=1`}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width: "100%",
              minHeight: 200,
              aspectRatio: "16 / 9",
              border: 0,
            }}
          />
          <button type="button" onClick={() => setLoaded(false)}>
            Close YouTube player
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setLoaded(true)}>
          Load YouTube player
        </button>
      )}
      <p>
        Press play in the video to listen. If it cannot play here,{" "}
        <a
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          open on YouTube
        </a>
        .
      </p>
      <small>
        Loading the player connects to YouTube.{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Privacy Policy
        </a>{" "}
        ·{" "}
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube Terms
        </a>
      </small>
    </div>
  );
}
