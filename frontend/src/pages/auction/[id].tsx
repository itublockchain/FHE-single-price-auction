import { useRouter } from 'next/router'

export default function Home() {

    const router = useRouter();
    return (<div className="w-full h-screen flex justify-center items-center bg-gray-500">
      <p>Auction: {router.query.id ? router.query.id : "None"}</p>
    </div>);
  }
  