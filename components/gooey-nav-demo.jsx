import React from 'react';
import GooeyNav from './ui/GooeyNav';

export default function GooeyNavDemo() {
  const items = [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "Commitments", href: "#commitments" },
    { label: "Process", href: "#process" },
    { label: "Technology", href: "#tech" },
    { label: "About", href: "#about" },
    { label: "All Services", href: "/services.html" }
  ];

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center bg-black p-8">
      <GooeyNav
        items={items}
        particleCount={12}
        particleDistances={[80, 15]}
        particleR={100}
        initialActiveIndex={0}
        animationTime={600}
        timeVariance={250}
        colors={[1, 2, 3, 1, 2, 3, 1, 4]}
      />
    </div>
  );
}
