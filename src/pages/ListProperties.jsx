import CreatePropertyForm from "@/components/CreatePropertyForm"
import { ViewPropertyDialog } from "@/components/ViewPropertyDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import RealEstateAddress from '@/contracts/RealEstate-address.json'
import RealEstateNftAddress from '@/contracts/RealEstateNFT-address.json'
import { loadContracts } from "@/lib/contracts"
import axios from "axios"
import { useEffect, useState } from "react"
const ListProperties = () => {

    const [properties, setProperties] = useState([])

    useEffect(() => {
        getProperties()
    }, [])

    const getProperties = async () => {
        const {provider, nft }= await loadContracts()
        const signer = await provider.getSigner()
        const propertyIds = await nft.listNFTsForOwner(signer.address)
            .then(result => result.map(id => parseInt(id)))

        const getPropertyIpfsHash = async (id) => {
            const result = await nft.tokenURI(id)
            const response = await axios.get(`https://amethyst-adequate-roundworm-419.mypinata.cloud/ipfs/${result}?pinataGatewayToken=${import.meta.env.VITE_PINATA_GATEWAY_TOKEN}`)
            const metadata = response.data
            metadata["tokenId"] = id
            metadata["cid"] = result
            console.log(metadata)
            return metadata
        }

        const propertiesMetadata = await Promise.all(propertyIds.map(id => {
            return getPropertyIpfsHash(id)
        }))
        setProperties(propertiesMetadata)
    }

    const onPutOnSales = async (property) => {
        const { provider, marketplace, nft } = await loadContracts()
        await nft.setApprovalForAll(RealEstateAddress.address, true)
        console.log(RealEstateNftAddress.address, property.tokenId, 200)
        await provider.getSigner()
        const tx = await marketplace.offerProperty(RealEstateNftAddress.address, property.tokenId, 200)
        await provider.waitForTransaction(tx.hash)
        await getProperties()
        toast({
            description: "Property is on sales."
        })
    }

    return  (
        <main className='container py-8 md:py-16'>
            <div className='mb-8 flex flex-row justify-between'>
                <h1 className='text-4xl font-bold'>Properties</h1>
                <div>
                    <CreatePropertyForm getProperties={getProperties}></CreatePropertyForm>
                </div>  
            </div>
            <hr className='my-8'></hr>
            <div className="grid grid-cols-3 gap-4">
                {
                    properties.length <= 0 
                    ? <div>You have no property. Start create now.</div>
                    : properties.map(property => {
                        return (
                            <Card key={property.cid}>
                                <CardHeader>
                                    <CardTitle>{property.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p className="overflow-hidden text-ellipsis grid grid-cols-3 gap-2">
                                        <span className="font-medium">CID:</span> 
                                        <span className="col-span-2 overflow-hidden text-ellipsis">{property.cid}</span>
                                    </p>
                                    <p className="overflow-hidden text-ellipsis grid grid-cols-3 gap-2">
                                        <span className="font-medium">Address:</span>
                                        <span  className="col-span-2"> {property.address}</span>
                                    </p>
                                    <p className="overflow-hidden text-ellipsis grid grid-cols-3 gap-2">
                                        <span className="font-medium">Description:</span> 
                                        <span className="col-span-2">{property.description}</span>
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <div className="ml-auto space-x-2">
                                        <ViewPropertyDialog propertyId={property.tokenId}>View Details</ViewPropertyDialog>
                                        <Button onClick={async () => await onPutOnSales(property)}>Put on Sales</Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })
                }
            </div>
        </main>
    )   
}
export default ListProperties