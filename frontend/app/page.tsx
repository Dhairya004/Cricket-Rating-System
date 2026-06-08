import Navbar from "@/components/Navbar";
import TeamsTabs from "@/components/TeamsTabs";
import NoSsr from "@/components/NoSsr";
import RatingsTable from "@/components/RatingsTable";

export default function Home() {
  return <>
    <Navbar />
    <NoSsr>
      <TeamsTabs />
    </NoSsr>
    <NoSsr>
      <RatingsTable />
    </NoSsr>
  </>;
}
