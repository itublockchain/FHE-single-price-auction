import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
    return (<div className="w-full border-b-[1px] absolute px-[150px] h-[80px] bg-background text-foreground flex items-center justify-around">
        <div><h1>Logo</h1></div>
        <div className="flex justify-around items-center gap-12">
            <div>Home</div>
            <div>Create Auction</div>
            <div>GitHub</div>
            <div>Medium</div>
        </div>
        <div><ConnectButton /></div>
    </div>);
}