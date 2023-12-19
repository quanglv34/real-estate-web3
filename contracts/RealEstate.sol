// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

contract RealEstate {
    address public erc20Address;
    uint public itemCount; 

    constructor(address  _currency) {
        erc20Address = _currency;
    }

    mapping(uint => Property) public properties;

    struct Property {
        uint id;
        IERC721 nft;
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
        bool available;
    }

    event PropertyOffered (
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event PropertyCancelled (
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    event PropertyPurchased (
        uint itemId,
        address nft,
        uint indexed tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    function offerProperty(IERC721 _nft, uint _tokenId, uint256 _price) public {
        require(_price > 0, "Price must be greater than zero");
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        properties[itemCount] = Property(itemCount, _nft, _tokenId, _price, payable(msg.sender), false, true);

        emit PropertyOffered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );

        itemCount++;
    }

    function cancelPropertySales(uint _itemId) public {
        require(_itemId >= 0 && _itemId <= itemCount, "item doesn't exist");

        Property storage item = properties[_itemId];

        require(msg.sender == item.seller, "only seller can cancel sales");
        require(item.available, "item doesn't available");
        require(!item.sold, "item is sold");

        item.available = true;
        
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        emit PropertyCancelled(_itemId, address(item.nft), item.tokenId, item.price, item.seller);
    }

    function purchaseProperty(uint256 _itemId) public payable { 
        Property storage item = properties[_itemId];

        require(_itemId >= 0 && _itemId <= itemCount, "item doesn't exist");
        require(!item.sold, "item already sold");
        require(item.available, "item not available");
        require(IERC20(erc20Address).allowance(msg.sender, address(this)) >= properties[_itemId].price, "not enough fund to cover item price");

        IERC20(erc20Address).transferFrom(msg.sender, item.seller, properties[_itemId].price); 
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        item.sold = true;

        emit PropertyPurchased(_itemId, address(item.nft), item.tokenId, item.price, item.seller, msg.sender);
    }
}