import React from "react";

interface TeamLogoProps {
  name: string;
  logo?: string | null;
  size?: number;
}

// Team crest; when the team has no logo it shows its initials in a circle.
export default function TeamLogo({ name, logo, size = 32 }: TeamLogoProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0 overflow-hidden"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(10, Math.round(size * 0.36))}px`,
        backgroundColor: logo ? "#ffffff" : "#70B038",
      }}
      title={name}
    >
      {logo ? (
        <img
          src={logo}
          alt={`Escudo de ${name}`}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <span>{initials || "E"}</span>
      )}
    </div>
  );
}
