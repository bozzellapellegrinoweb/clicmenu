import Image from "next/image";

export function ClicmenuLogo({ height = 32, className = "" }: { height?: number; className?: string }) {
  const width = height * (1500 / 1000);
  return (
    <Image
      src="/logo.svg"
      alt="Clicmenu.ai"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}

export function ClicmenuIcon({ size = 32 }: { size?: number }) {
  // Solo asterisco verde su sfondo navy per icone compatte
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="22" fill="#0c2337" />
      <g transform="translate(50,50)">
        {[0, 45, 90, 135].map((deg) => (
          <line
            key={deg}
            x1={-28 * Math.cos((deg * Math.PI) / 180)}
            y1={-28 * Math.sin((deg * Math.PI) / 180)}
            x2={ 28 * Math.cos((deg * Math.PI) / 180)}
            y2={ 28 * Math.sin((deg * Math.PI) / 180)}
            stroke="#10b981"
            strokeWidth="11"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
