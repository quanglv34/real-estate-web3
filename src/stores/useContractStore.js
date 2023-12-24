import { ethers } from "ethers";
import { create } from 'zustand';
import RealEstateAbi from '../contracts/Marketplace.json';
import RealEstateNftAbi from '../contracts/NFT.json';
import RealEstateAddress from '../contracts/RealEstate-address.json';
import RealEstateNftAddress from '../contracts/RealEstateNFT-address.json';
import RealEstateTokenAddress from '../contracts/RealEstateToken-address.json';
import RealEstateTokenAbi from '../contracts/RealEstateToken.json';

export const provider = new ethers.providers.Web3Provider(window.ethereum)
export const marketplace = new ethers.Contract(RealEstateAddress.address, RealEstateAbi, provider)
export const nft = new ethers.Contract(RealEstateNftAddress.address, RealEstateNftAbi, provider)
export const token = new ethers.Contract(RealEstateTokenAddress.address, RealEstateTokenAbi, provider)

export const useContractStore = create((set) => ({
  provider: provider,
  marketplace: marketplace,
  nft: nft,
  token: token,
}))