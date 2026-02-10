"use client";

import { useState, useEffect, useRef } from "react";

const heroLines = [
  "\"いいね\"を追う運用、まだ続けますか？",
  "リプライの重みは、いいねの150倍",
  "Xのソースコードは、嘘をつかない",
  "根拠のない提案に、クライアントは気づく",
  "アルゴリズムを読んだ人だけが勝つ時代",
];

export function TypewriterText() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentLine = heroLines[lineIndex];

    if (!isDeleting && charIndex <= currentLine.length) {
      timerRef.current = setTimeout(() => {
        setDisplayText(currentLine.slice(0, charIndex));
        setCharIndex((c) => c + 1);
      }, 100);
    } else if (!isDeleting && charIndex > currentLine.length) {
      timerRef.current = setTimeout(() => setIsDeleting(true), 3500);
    } else if (isDeleting && charIndex > 0) {
      timerRef.current = setTimeout(() => {
        setCharIndex((c) => c - 1);
        setDisplayText(currentLine.slice(0, charIndex - 1));
      }, 50);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setLineIndex((i) => (i + 1) % heroLines.length);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [charIndex, isDeleting, lineIndex]);

  return (
    <>
      <span className="text-gradient" aria-hidden="true">
        {displayText}
        <span className="animate-pulse text-primary">|</span>
      </span>
    </>
  );
}
