import { cn } from "@/lib/utils";

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-[-1px] z-0 h-[48rem] overflow-hidden sm:h-[58rem] lg:h-[68rem]",
        className
      )}
    >
      <div
        className="absolute inset-x-[-18%] bottom-0 h-full opacity-95"
        style={{
          maskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
        }}
      >
        {/* Core central glow */}
        <div className="absolute left-1/2 top-1/2 -ml-[40rem] -mt-[20rem] h-[40rem] w-[80rem] animate-aurora-1 rounded-full bg-[rgba(185,198,210,0.6)] blur-[120px]" />
        
        {/* Left shifting glow */}
        <div className="absolute left-1/4 top-1/3 -ml-[30rem] -mt-[15rem] h-[30rem] w-[60rem] animate-aurora-2 rounded-full bg-[rgba(112,124,134,0.5)] blur-[140px]" />
        
        {/* Right shifting glow */}
        <div className="absolute bottom-1/4 right-1/4 -mb-[15rem] -mr-[30rem] h-[30rem] w-[60rem] animate-aurora-3 rounded-full bg-[rgba(130,143,255,0.25)] blur-[120px]" />
      </div>
    </div>
  );
}
