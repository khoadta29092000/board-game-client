import Link from "next/link";

export default function Home() {
  return (
    <div className="h-fit flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Home Page</h1>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
