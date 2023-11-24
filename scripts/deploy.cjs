const hre = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [minter, buyer, seller, inspector, lender] = await ethers.getSigners()
  
  console.log(
    `Deploying the contracts with the account: ${minter.address}\n`,
    );
    
    // Deploy Real Estate
    const RealEstate = await ethers.getContractFactory('RealEstate')
    const realEstate = await RealEstate.deploy(minter.address)
    await realEstate.waitForDeployment()

  console.log(`Deployed Real Estate Contract at: ${await realEstate.getAddress()}\n`)

  // console.log(`Minting 3 properties...\n`)

  for (let i = 0; i < 3; i++) {
    // console.log(`Create new token for seller: ${seller.address}\n`)
    const transaction = await realEstate.connect(minter).safeMint(
      seller.address, 
      `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i + 1}.json`
    )
    await transaction.wait()
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    await realEstate.getAddress(),
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.waitForDeployment()

  console.log(`Deployed Escrow Contract at: ${await escrow.getAddress()}\n`)
  
  for (let i = 0; i < 3; i++) {
    // Approve properties...
    // console.log(`Approve properties ${i} for ${await escrow.getAddress()}\n`)
    let transaction = await realEstate.connect(seller).approve(await escrow.getAddress(), i)
    await transaction.wait()
  }
  // console.log(`Listing 3 properties...\n`)
  // Listing properties...
  transaction = await escrow.connect(seller).list(0, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(10), tokens(5))
  await transaction.wait()

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});