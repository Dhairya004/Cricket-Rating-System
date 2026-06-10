import Navbar from "@/components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <p className="rounded-md border border-zinc-300 bg-white p-5 text-base leading-7 text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 justify-center">
          CricRating is a cricket team rating system that rates teams' batting, bowling, and fielding attributes out of 100. It includes ratings for all teams in the Indian Premier League (IPL) as well as international teams. The ratings are updated after every match based on the team's performances, and the overall team rating is a weighted average of the three attributes. The system provides fans with an easy way to compare teams and track their performance over time.
        </p> 
      </main>
    </>
  );
}
