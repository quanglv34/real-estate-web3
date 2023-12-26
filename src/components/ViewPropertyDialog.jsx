import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { loadContracts } from "@/lib/contracts"
import { useState } from "react"

export function ViewPropertyDialog({ propertyId }) {
    const [purchases, setPurchases] = useState([])
    const getPurchasedEvents = async () => {
        const {marketplace } = await loadContracts()
        const filter =  marketplace.filters.PropertyPurchased(null,null,propertyId,null,null,null)
        const results = (await marketplace.queryFilter(filter)).map(i => i.args)
        console.log("results", results)
        setPurchases(results)
    }
    const [isOpened, setIsOpened] = useState(false)
    function onOpenChange(open) {
        setIsOpened(open)
        if(open == true) {
            getPurchasedEvents()
        }
    }
    return (
        <Dialog open={isOpened} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsOpened(true)}>View Property</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                <DialogTitle>View Property {propertyId}</DialogTitle>
                <DialogDescription>
                    View Your property purchase history.
                </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {purchases.map((purchase,index) => {
                        return (
                            <div className="border p-4 rounded-lg" key={index}>
                                <div>
                                    <span className="font-medium">Seller:</span> {purchase.seller}
                                    </div>
                                <div>
                                    <span className="font-medium">Buyer:</span> {purchase.buyer}
                                </div>
                                <div>
                                    <span className="font-medium">Price:</span> {parseInt(purchase.price)} REAL
                                    </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}