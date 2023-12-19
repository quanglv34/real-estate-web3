// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateNFT is ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(
        address initialOwner
    ) ERC721("RealEstate", "REAL") Ownable(initialOwner) {}

    function safeMint(
        address to,
        string memory uri
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721, ERC721Enumerable) {

        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) 
    internal virtual
     override(ERC721, ERC721Enumerable)
      returns (address) {  
        return super._update(to, tokenId, auth);
    }

    function tokenURI( 
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
        ) public view override(ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public  view override(ERC721Enumerable) returns (uint256) {
        return _nextTokenId;
    }

    function listNFTsForOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

}