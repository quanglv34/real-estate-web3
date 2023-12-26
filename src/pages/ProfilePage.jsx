import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { loadContracts } from "@/lib/contracts";
import { useEffect, useState } from "react";
function ProfilePage() {
    const [tokenBalance, setTokenBalance] = useState(null)
    const { toast } = useToast()

    useEffect(() => {
        getAccountBalance()
    }, []);

    const onGetMoreCrypto = async () => {
        try {
            const { provider, token } = await loadContracts()
            const signer = await provider.getSigner()
            const mintTransaction = await token.mint(signer.address, 200)
            await provider.waitForTransaction(mintTransaction.hash)
            toast({
                    description: "Transaction is completed.",
            })
            await getAccountBalance()
        } catch (e) {
            console.log('Mint error', e.message)
            toast({
                    description: "An error has happened.",
            })
        }
    }

    const getAccountBalance = async () => {
        const { provider, token } = await loadContracts()
        const signer = await provider.getSigner()
        console.log('signer', signer.address)
        const newBalance = await token.balanceOf(signer.address)
        setTokenBalance(newBalance.toString())
    }
    return ( 
        <main className='container py-8 md:py-16'>
            <div className='mb-8 flex flex-row justify-between'>
                <h1 className='text-4xl font-bold'>Profile</h1>
                <div className="space-x-8 flex flex-row items-center">
                    <div className="font-medium text-lg">Balance: {tokenBalance ?? 0} REAL</div>
                    <Button onClick={onGetMoreCrypto} variant="default">Get More Crypto</Button>
                </div>  
            </div>
            <hr className='my-8'></hr>
        </main>
    )
}

export default ProfilePage