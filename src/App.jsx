import { useEffect, useState } from 'react';
import './globals.css';

// ABIs

// Config

import axios from 'axios';
import CreatePropertyForm from './components/CreatePropertyForm';
import { ViewPropertyDialog } from './components/ViewPropertyDialog';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { toast } from './components/ui/use-toast';
import { loadContracts } from './lib/contracts';

function App() {
  const [properties, setProperties] = useState([])
  const [signer, setSigner] = useState(null)

  const loadBlockchainData = async () => {
    const { provider, marketplace, nft } = await loadContracts()
    const user = await provider.getSigner()
    setSigner(user.address)
    const itemCount = parseInt(await marketplace.itemCount())
    console.log("itemCount", itemCount)
    const marketplaceProperties = await Promise.all(
      Array.from({length: itemCount}, async (_, item) => {
          const property = await marketplace.properties(item)
          const nftMetadata = await nft.tokenURI(property.tokenId)
          const metadata = await axios.get(`https://amethyst-adequate-roundworm-419.mypinata.cloud/ipfs/${nftMetadata}?pinataGatewayToken=${import.meta.env.VITE_PINATA_GATEWAY_TOKEN}`).then(response => response.data)
          return {
            id:  property.id,
            tokenId:  property.tokenId,
            price: property.price,
            seller: property.seller,
            isSold: property.sold,
            isAvailable: property.available,
            metadata: metadata
          }
        })
    )

    console.log(marketplaceProperties)

    setProperties(marketplaceProperties)
  }

  const onBuy = async (home) => {
    const { provider, marketplace, nft, token } = await loadContracts()
    const tx = await token.approve(marketplace.target, home.price);
    await provider.waitForTransaction(tx.hash)
    const tx2 = await marketplace.purchaseProperty(parseInt(home.id))
    await provider.waitForTransaction(tx2.hash)
    loadBlockchainData()
    toast({
      description: "You bought a property."
    })
  }

  const onCancel = async (home) => {
    const { provider, marketplace, nft, token } = await loadContracts()
    const tx2 = await marketplace.cancelPropertySales(parseInt(home.id))
    await provider.waitForTransaction(tx2.hash)
    loadBlockchainData()
    toast({
      description: "You cancel a property sales."
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <>
    <main className='container py-8 md:py-16'>
      <div className='mb-8 flex flex-row justify-between'>
        <h1 className='text-4xl font-bold'>Web3 Real Estate</h1>
        <div>
          <CreatePropertyForm></CreatePropertyForm>
        </div>  
      </div>
      <hr className='my-8'></hr>
      <div className='grid grid-cols-3 gap-4'>
          {properties.map((home, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md flex flex-col">
              <img src={`https://ipfs.io/ipfs/${home.metadata.imageCid}`} alt="Home"  className='rounded-t-lg aspect-video object-cover'/>
              <CardHeader>
                <Badge className="mb-2 w-fit">{parseInt(home.price)} REAL</Badge>
                <CardTitle className="space-y">
                  <span>{ home.metadata.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col grow gap-2">
                <p><span className="font-medium">Seller:</span> {home.seller}</p>   
                <p><span className="font-medium">Address:</span> {home.metadata.address}</p>   
                <p><span className="font-medium">Description:</span> {home.metadata.description}</p>   
                <div className='flex flex-row gap-2'>
                  {
                    home.isAvailable 
                    ? <Badge>{ home.isSold ? "Is Sold" : "Can Buy"}</Badge>
                    : <Badge variant="destructive">{ home.isAvailable  ? "Is Available" : "Is Cancelled"}</Badge>
                  } 
                </div>
              </CardContent>
              <CardFooter className="gap-4">
                <ViewPropertyDialog variant="outline" propertyId={home.tokenId}></ViewPropertyDialog>
                {
                  home.isSold || <div className='ml-auto'> 
                    {signer == home.seller 
                    ? <Button onClick={() => onCancel(home)} variant="outline">Cancel Sales</Button> 
                    : <Button onClick={() => onBuy(home)}>Buy Now</Button>
                    }
                  </div>
                }
              </CardFooter>
            </Card>
          ))}
        </div>
    </main>

    </>
  )
}

export default App