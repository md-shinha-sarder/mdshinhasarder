interface SkillItem {
  name: string;
  level: number; // 0 - 100
  category: "Technical" | "Creative" | "Professional";
  color: string;
  iconText?: string;
}

const skillsData: SkillItem[] = [
  { name: "HTML / CSS / JS", level: 30, category: "Technical", color: "#f97316" },
  { name: "Python", level: 30, category: "Technical", color: "#3b82f6" },
  { name: "Java", level: 25, category: "Technical", color: "#ef4444" },
  { name: "C / C++", level: 10, category: "Technical", color: "#6366f1" },
  { name: "Entrepreneurship", level: 95, category: "Professional", color: "#8b5cf6" },
  { name: "Content Creation", level: 90, category: "Creative", color: "#ec4899" },
  { name: "Music Production", level: 80, category: "Creative", color: "#10b981" },
  { name: "Research & Writing", level: 85, category: "Professional", color: "#14b8a6" },
];

export const SkillCircle = ({
  name,
  level,
  color,
}: {
  name: string;
  level: number;
  color: string;
}) => {
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (level / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm transition-all hover:scale-105">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700/50"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-mono">
            {level}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 text-center line-clamp-1">
        {name}
      </span>
    </div>
  );
};

export const SkillCircleGraph = () => {
  return (
    <div className="w-full my-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {skillsData.map((s) => (
          <SkillCircle key={s.name} name={s.name} level={s.level} color={s.color} />
        ))}
      </div>
    </div>
  );
};

export default SkillCircleGraph;
