import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './globals.css';

// ABIs
import Escrow from './abis/Escrow.json';
import RealEstate from './abis/RealEstate.json';

// Config
import config from './config.json';

import CreatePropertyForm from './components/CreatePropertyForm';
import Home from './components/Home';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Separator } from './components/ui/separator';

function App() {
  const [provider, setProvider] = useState(null)
  const [escrow, setEscrow] = useState(null)

  const [account, setAccount] = useState(null)

  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  const [toggle, setToggle] = useState(false);

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstate.totalSupply()
    const homes = []
    
    for (var i = 0; i < Number(totalSupply); i++) {
      const uri = await realEstate.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }
    console.log("totalSupply", homes);
    
    
    setHomes(homes)

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
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
          {homes.map((home, index) => (
            <Card onClick={() => togglePop(home)} key={index} className="cursor-pointer hover:shadow-md flex flex-col">
              <img src={home.image} alt="Home"  className='rounded-t-lg'/>
              <CardHeader>
                <Badge className="mb-2 w-fit">{home.attributes[0].value} ETH</Badge>
                <CardTitle className="space-y">
                <span>{ home.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col grow">
                <div className=''>
                  <p className="flex h-5 items-center space-x-2 text-sm">
                  <strong>{home.attributes[2].value}</strong> bds 
                  <Separator orientation="vertical" />
                  <strong>{home.attributes[3].value}</strong> ba 
                  <Separator orientation="vertical" />
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
                </div>
   
              </CardContent>
            </Card>
          ))}
        </div>
        {toggle && (
        <Home toggle={toggle} home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
        )}
    </main>

    </>
  )
}

export default App