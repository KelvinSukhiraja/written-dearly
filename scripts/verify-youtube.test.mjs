import test from "node:test";
import assert from "node:assert/strict";
import { youtubeVideoId, youtubeUrl } from "../src/lib/invitations/youtube.ts";

test("supported single-video links normalize without tracking or playlist parameters", () => {
  for (const url of [
    "https://www.youtube.com/watch?v=M7lc1UVf-VE&list=other",
    "https://youtu.be/M7lc1UVf-VE?si=tracking",
    "https://music.youtube.com/watch?v=M7lc1UVf-VE",
    "https://m.youtube.com/shorts/M7lc1UVf-VE",
    "https://youtube.com/embed/M7lc1UVf-VE",
    "https://youtube.com/live/M7lc1UVf-VE",
  ]) {
    assert.equal(youtubeVideoId(url), "M7lc1UVf-VE");
    assert.equal(
      youtubeUrl(url),
      "https://www.youtube.com/watch?v=M7lc1UVf-VE",
    );
  }
});
test("rejects impersonation, credentials, scripts, playlists and malformed IDs", () => {
  for (const url of [
    null,
    {},
    "",
    "javascript:alert(1)",
    "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE",
    "https://youtube.com@evil.test/watch?v=M7lc1UVf-VE",
    "https://user@youtube.com/watch?v=M7lc1UVf-VE",
    "https://youtube.com:8443/watch?v=M7lc1UVf-VE",
    "https://youtube.com/playlist?list=123",
    "https://youtu.be/short",
    "https://youtu.be/M7lc1UVf-VE/extra",
    "https://youtube.com/watch?v=%3Cscript%3E",
  ]) {
    assert.equal(youtubeVideoId(url), null);
    assert.equal(youtubeUrl(url), "");
  }
});
