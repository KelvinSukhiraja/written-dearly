"use client";
import { useEffect, useState } from "react";
export function ReceptionPass({
  token,
  name,
  table,
}: {
  token: string;
  name: string;
  table?: string | null;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    import("qrcode")
      .then((q) =>
        q.toDataURL("wd:" + token, {
          width: 280,
          margin: 4,
          errorCorrectionLevel: "M",
        }),
      )
      .then((url) => {
        if (active) setImage(url);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [token]);
  return (
    <div className="reception-pass">
      <p className="eyebrow">Your reception pass</p>
      <h3>{name}</h3>
      {image ? (
        <img
          src={image}
          width={280}
          height={280}
          alt={`Reception QR code for ${name}`}
        />
      ) : (
        <p role="status">
          {error
            ? "The code could not be loaded. You can also check in by name."
            : "Preparing your pass…"}
        </p>
      )}
      {table && <p>Table {table}</p>}
      <p>
        Present this code on arrival. Save it to your phone before the wedding;
        our team can also find you by name.
      </p>
      {image && (
        <a
          className="btn btn-secondary"
          href={image}
          download="wedding-reception-pass.png"
        >
          Save reception pass ↓
        </a>
      )}
    </div>
  );
}
