// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "./RealEstateNFT.sol"; 

contract RealEstateMarketplace is RealEstateNFT {
    address public erc20Address;

    constructor(address  _currency) RealEstateNFT(msg.sender) {
        erc20Address = _currency;
    }

    Property[] properties;

    // Struct
    struct Property {
        uint id;
        IERC721 nft;
        string name;
        uint price;
        address payable owner;
        address payable seller;
        bool sold;
    }

    // EVENTS
    event PropertyCreated (
        uint tokenId,
        string name,
        string uri
    );

    event PropertyPurchased (
        uint tokenId,
        string price,
        string uri
    );

    // Function 
    function createProperty(string memory uri, uint256 _price) public {
        require(msg.sender == owner(), "You are not owner");
        require(_price > 0, "Product price should be greater than 0");

        uint256 tokenId = safeMint(owner(), uri); 

        Property memory newProduct;
        newProduct.tokenId = tokenId; 
        newProduct.price = _price;
        newProduct.uri = uri;
        tokenIdToProduct[tokenId] = newProduct;
        
        emit PropertyCreated(productCount, _name, _price, msg.sender, false);
        products.push(newProduct); 

    }

    function purchaseProperty(uint256 _tokenId) public { 
        require(IERC20(erc20Address).allowance(msg.sender, address(this)) >= tokenIdToProduct[_tokenId].price, "insufficient approval");
        IERC20(erc20Address).transferFrom(msg.sender, address(this), tokenIdToProduct[_tokenId].price); 
        this.transferFrom(owner(), msg.sender, _tokenId);

        emit PropertyPurchased(_id, myProduct.name, myProduct.price, seller, myProduct.owner, true);
    }

    function getAllProperties() public view returns (Property[] memory) {
        return products; 
    }
}