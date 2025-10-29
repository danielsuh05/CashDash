import React from "react";

export default function AchievementCard({ achievement }) {
  const { title, description, icon, color, unlocked, progress, maxProgress } = achievement;
  const progressPercentage = (progress / maxProgress) * 100;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        unlocked
          ? "border-yellow-400 bg-gradient-to-br " + color
          : "border-slate-300 bg-white"
      }`}
    >

      {!unlocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/80 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="text-center">
            <div className="mb-2 text-5xl">🔒</div>
            <div className="text-sm font-semibold text-slate-700">Locked</div>
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-center">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-6xl transition-transform group-hover:scale-110 ${
            unlocked ? "bg-white/20 shadow-xl" : "bg-slate-100 grayscale"
          }`}
        >
          {icon}
        </div>
      </div>

      <h3
        className={`mb-2 text-center text-lg font-bold ${
          unlocked ? "text-white" : "text-slate-800"
        }`}
      >
        {title}
      </h3>

      <p
        className={`mb-4 text-center text-sm ${
          unlocked ? "text-white/90" : "text-slate-600"
        }`}
      >
        {description}
      </p>

      {!unlocked && progress > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
            <span>Progress</span>
            <span>
              {progress} / {maxProgress}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {unlocked && (
        <div className="mt-4 flex items-center justify-center">
          <div className="rounded-full bg-white/30 px-4 py-1 backdrop-blur-sm">
            <span className="text-sm font-bold text-white">✓ Unlocked</span>
          </div>
        </div>
      )}
    </div>
  );
}
