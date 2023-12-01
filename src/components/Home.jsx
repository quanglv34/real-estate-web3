import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';


const Home = ({ toggle, home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        // -- Buyer

        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)

        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought)

        // -- Seller

        const seller = await escrow.seller()
        setSeller(seller)

        const hasSold = await escrow.approval(home.id, seller)
        setHasSold(hasSold)

        // -- Lender

        const lender = await escrow.lender()
        setLender(lender)

        const hasLended = await escrow.approval(home.id, lender)
        setHasLended(hasLended)

        // -- Inspector

        const inspector = await escrow.inspector()
        setInspector(inspector)

        const hasInspected = await escrow.inspectionPassed(home.id)
        setHasInspected(hasInspected)
    }

    const fetchOwner = async () => {
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner()

        // Buyer deposit earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Buyer approves...
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        // Inspector updates status
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait()

        setHasInspected(true)
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner()

        // Lender approves...
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Lender sends funds to contract...
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        // Seller approves...
        let transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Seller finalize...
        transaction = await escrow.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasSold(true)
    }

    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])

    return (
        <>
            <Dialog open={toggle} onOpenChange={togglePop}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className='font-bold text-3xl'>{home.name}</DialogTitle>
                    </DialogHeader>
                    <div className='grid grid-cols-2 gap-8'>
                    
                        <div className="home__overview flex flex-col gap-2">
                            <div className="flex h-5 items-center space-x-4 text-sm">
                                <Badge>{home.attributes[0].value} ETH</Badge>
                                <strong>{home.attributes[2].value}</strong>&nbsp;bds
                                <Separator orientation="vertical" />
                                <strong>{home.attributes[3].value}</strong>&nbsp;ba
                                <Separator orientation="vertical" />
                                <strong>{home.attributes[4].value}</strong>&nbsp;sqft
                            </div>
                            <p>{home.address}</p>

                            <Separator className="my-2" />

                            <h2 className='font-bold'>Overview</h2>

                            <p>
                                {home.description}
                            </p>

                            <Separator className="my-2" />

                            <h2 className='font-bold'>Facts and features</h2>

                            <ul>
                                {home.attributes.map((attribute, index) => (
                                    <li key={index}><span className='font-medium'>{attribute.trait_type}</span> : <span className='text-slate-500 font-light'>{attribute.value}</span></li>
                                ))}
                            </ul>
                                                <DialogFooter className="mt-8 sm:justify-start">
                        {owner ? (
                            <div className='home__owned'>
                                Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                            </div>
                        ) : (
                            <div className='space-x-2'>
                                {(account === inspector) ? (
                                    <Button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                        Approve Inspection
                                    </Button>
                                ) : (account === lender) ? (
                                    <Button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                        Approve & Lend
                                    </Button>
                                ) : (account === seller) ? (
                                    <Button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                        Approve & Sell
                                    </Button>
                                ) : (
                                    <Button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                        Buy Now
                                    </Button>
                                )}

                                <Button variant="outline" className='home__contact'>
                                    Contact Agent
                                </Button>
                            </div>
                        )}

                    </DialogFooter>
                        </div>
                        <div className="home__image h-full">
                            <img className='rounded-lg h-full object-cover' src={home.image} alt="Home" />
                        </div>
                    </div>

                </DialogContent>
            </Dialog>
        </>
    );
}

export default Home;