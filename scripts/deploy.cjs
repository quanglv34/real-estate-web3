const hre = require("hardhat");

async function main() {
  // Setup accounts
  const [owner] = await ethers.getSigners()
  
  console.log(
    `Deploying the contracts with the account: ${owner.address}\n`,
    );
    
    // Deploy Real Estate
    const RealEstateToken = await ethers.getContractFactory('RealEstateToken')
    const realEstateToken = await RealEstateToken.deploy(owner.address)
    await realEstateToken.waitForDeployment()

    console.log("Deploy RealEstateToken at", realEstateToken.target )

    const RealEstateNFT = await ethers.getContractFactory('RealEstateNFT')
    const realEstateNft = await RealEstateNFT.deploy(owner.address)
    await realEstateNft.waitForDeployment()

    console.log("Deploy RealEstateNFT at", realEstateNft.target )

    const RealEstate = await ethers.getContractFactory('RealEstate')
    const realEstate = await RealEstate.deploy(realEstateToken.target )
    await realEstate.waitForDeployment()

    console.log("Deploy realEstate at", realEstate.target )

    saveFrontendFiles(realEstateToken , "RealEstateToken");
    saveFrontendFiles(realEstateNft , "RealEstateNFT");
    saveFrontendFiles(realEstate , "RealEstate");

  console.log(`Finished.`)
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.target }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});