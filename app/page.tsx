import Link from "next/link";

function Home() {
  return (
    <div>
      DARUNNAZAT MADRASA{" "}
      <Link className="text-blue-500 underline" href="/dashboard">
        dashboard
      </Link>
    </div>
  );
}

export default Home;
