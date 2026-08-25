function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#EEF2FF] to-gray-100">
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animation: "shimmer 1.6s infinite" }} />
      </div>
      <div className="p-4">
        <div className="relative h-4 w-3/4 overflow-hidden rounded-full bg-gray-100">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animation: "shimmer 1.6s infinite" }} />
        </div>
        <div className="relative mt-2 h-3 w-1/2 overflow-hidden rounded-full bg-gray-100">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animation: "shimmer 1.6s infinite" }} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <div className="h-3 w-14 rounded-full bg-gray-100" />
          <div className="h-7 w-16 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default ProjectCardSkeleton;