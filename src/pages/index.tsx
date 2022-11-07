import Head from "next/head";
import { Card } from "../components/card";
import VercelSvg from "../../public/vercel.svg";

const Home: React.FunctionComponent = () => {
  return (
    <div className="min-h-screen px-2 flex flex-col justify-center items-center">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20 flex flex-1 flex-col justify-center items-center">
        <h1 className="text-7xl text-center">
          Welcome to{" "}
          <a href="https://nextjs.org" className="text-indigo-500 hover:underline focus:underline">
            Next.js!
          </a>
        </h1>

        <p className="text-2xl leading-6 mt-4">
          Get started by editing <code className="bg-gray-100 rounded p-2 text-lg font-mono">pages/index.js</code>
        </p>

        <div className="grid max-w-4xl mt-12">
          <Card
            title="Documentation &rarr;"
            caption="Find in-depth information about Next.js features and API."
            href="https://nextjs.org/docs"
          />

          <Card
            title="Learn &rarr;"
            caption="Learn about Next.js in an interactive course with quizzes!"
            href="https://nextjs.org/learn"
          />

          <Card
            title="Examples &rarr;"
            caption="Discover and deploy boilerplate example Next.js projects."
            href="https://github.com/vercel/next.js/tree/master/examples"
          />

          <Card
            title="Deploy &rarr;"
            caption="Instantly deploy your Next.js site to a public URL with Vercel."
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          />
        </div>
      </main>

      <footer className="w-full h-24 border-t border-solid border-gray-200 flex justify-center items-center">
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          className="flex justify-center items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="mr-2">Powered by</span>
          <VercelSvg width={71} height={16} aria-label="Vercel logo" />
        </a>
      </footer>
    </div>
  );
};

export default Home;
