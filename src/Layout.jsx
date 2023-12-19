import { cn } from "@/lib/utils";
import { MetaMaskButton } from "@metamask/sdk-react-ui";
import { School } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
function Layout() {
    const navItems = [
        {
            title: "Marketplace",
            href: ""
        },        
        {
            title: "Profile",
            href: "/profile"
        },
        {
            title: "Properties",
            href: "/properties"
        }
    ]
    return <div>
        <nav  className="border-b">
            <div className="container h-16 flex flex-row items-center justify-between">
                <div className="font-bold text-2xl flex flex-row gap-4 items-center">
                    <School></School>
                    Web3 Real Estate
                </div>
                <div>
                    <ul className="space-x-8 flex flex-row">
                        {navItems.map( item => 
                            <NavLink 
                                to={item.href}
                                key={item.href} 
                                className={({isActive}) => cn(
                        "flex items-center text-sm font-medium text-primary-foreground-foreground",
                        isActive || "opacity-50"
                                )}
                            >{item.title}</NavLink>
                  )}
                    </ul>
                </div>
                 <MetaMaskButton icon="original" removeDefaultStyles={true} className="metamask-button" theme="light" color="white"></MetaMaskButton>
            </div>
        </nav>
        <Outlet/>
        <Toaster />
    </div>
}
export default Layout