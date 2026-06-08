import Image from "next/image";
import Link  from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <p className="text-blue-300 text-3xl m-5 hover:text-red-200">Testing</p>
          <Link className="text-blue text" href="/account">click me</Link>
      </main>
    </div>
  );
}
