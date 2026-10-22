import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 bg-black">
      {/* Panoramic banner image from the v0 template */}
      <div className="relative w-full h-[240px] md:h-[320px] overflow-hidden">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Upscaled%20Image%20%2810%29-UnDKstODkIENp5xqTYUEpt0Sm8tNOw.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-14 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <a href="#" className="inline-flex items-center gap-2 mb-6">
              <span className="text-2xl font-display text-white">Commons</span>
              <span className="text-xs text-white/40 font-mono">A2A</span>
            </a>
            <p className="font-display text-4xl md:text-5xl text-white leading-[1.05]">
              Agents move things forward.
              <br />
              <span className="text-white/40">People make it matter.</span>
            </p>
          </div>
          <a
            href="https://github.com/Adkid-Zephyr/commons-a2a"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1 group"
          >
            GitHub
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </a>
        </div>

        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <p>Commons · Apache-2.0 · Track 2 prototype</p>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-pink" />
            No external community actions
          </span>
        </div>
      </div>
    </footer>
  );
}
