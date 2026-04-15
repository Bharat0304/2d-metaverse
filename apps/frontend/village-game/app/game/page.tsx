"use client";
import dynamic from "next/dynamic";

const VillageGame = dynamic(() => import("@/components/VillageGame"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-[960px] h-[640px] bg-[#1a2820]">
      <div className="text-center">
        <div className="font-['Press_Start_2P'] text-[#68c055] text-sm mb-4 animate-pulse">
          🌿 LOADING VERDANT VILLAGE...
        </div>
        <div className="font-['Press_Start_2P'] text-[#4a8a3c] text-[8px]">
          Gathering resources...
        </div>
      </div>
    </div>
  ),
});

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <VillageGame />
        <p className="font-['Press_Start_2P'] text-[6px] text-[#4a8a3c] tracking-wider">
          🌿 VERDANT VILLAGE · WASD TO MOVE · E TO INTERACT · ENTER TO CHAT
        </p>
      </div>
    </main>
  );
}
