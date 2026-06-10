import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      className="relative w-full h-16 border-b border-solid border-zinc-200 dark:border-zinc-700 bg-cover bg-center flex items-center justify-between px-4 overflow-hidden"
      style={{ backgroundImage: "url('/navbar_background.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div className="relative z-10 text-xl font-bold text-white">CricRating</div>
      <div className="relative z-10 flex items-center gap-4">
        <Link href="/home" className="text-white hover:text-blue-200">
          Home
        </Link>
        <Link href="/about" className="text-white hover:text-blue-200">
          About
        </Link>
      </div>
    </nav>
  );
}