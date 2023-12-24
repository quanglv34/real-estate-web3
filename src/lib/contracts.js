import RealEstateAddress from '@/contracts/RealEstate-address.json';
import RealEstateAbi from '@/contracts/RealEstate.json';
import RealEstateNftAddress from '@/contracts/RealEstateNFT-address.json';
import RealEstateNftAbi from '@/contracts/RealEstateNFT.json';
import RealEstateTokenAddress from '@/contracts/RealEstateToken-address.json';
import RealEstateTokenAbi from '@/contracts/RealEstateToken.json';
import { ethers } from "ethers";

export const loadContracts = async () => {
    const provider = await new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const marketplace = await new ethers.Contract(RealEstateAddress.address, RealEstateAbi.abi, signer)
    const nft = await new ethers.Contract(RealEstateNftAddress.address, RealEstateNftAbi.abi, signer)
    const token = await new ethers.Contract(RealEstateTokenAddress.address, RealEstateTokenAbi.abi, signer)

    return {
        provider, marketplace, nft, token, signer
    }
}