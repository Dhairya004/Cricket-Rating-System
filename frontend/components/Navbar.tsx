import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-white dark:bg-black border-b border-solid border-zinc-200 dark:border-zinc-700 flex items-center justify-between px-4">
      <div className="text-xl font-bold text-black dark:text-zinc-50">CricRating</div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-black dark:text-zinc-50 hover:text-blue-500">
          Home
        </Link>
        <Link href="/about" className="text-black dark:text-zinc-50 hover:text-blue-500">
          About
        </Link>
      </div>
    </nav>
  );
}
