import { motion } from "framer-motion";

export function LoadingShell() {
  return (
    <div className="space-y-6">
      <div className="section-frame p-8">
        <div className="shimmer animate-shimmer h-10 w-48 rounded-xl" />
        <div className="mt-4 shimmer animate-shimmer h-6 w-72 rounded-xl" />
        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="shimmer animate-shimmer h-16 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2, delay: index * 0.1 }}
            className="shimmer h-48 rounded-xl2"
          />
        ))}
      </div>
    </div>
  );
}
