// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HorizonSubscriptionNFT is ERC721, Ownable {
    enum Tier { NONE, EXPLORER, GUARDIAN, SENTINEL, ENTERPRISE }

    struct Subscription {
        Tier tier;
        uint256 expiresAt;
    }

    uint256 private _nextTokenId = 1;
    mapping(uint256 => Subscription) public subscriptions;
    mapping(address => uint256) public userToTokenId;

    mapping(Tier => uint256) public tierPrices;
    mapping(Tier => uint256) public tierDurations;

    event SubscriptionMinted(address indexed user, uint256 tokenId, Tier tier, uint256 expiresAt);
    event SubscriptionRenewed(address indexed user, uint256 tokenId, Tier tier, uint256 expiresAt);

    constructor() ERC721("Horizon Subscription NFT", "HZN-SUB") Ownable(msg.sender) {
        // Initialize basic tier configurations
        tierPrices[Tier.EXPLORER] = 0.01 ether;
        tierPrices[Tier.GUARDIAN] = 0.05 ether;
        tierPrices[Tier.SENTINEL] = 0.1 ether;
        tierPrices[Tier.ENTERPRISE] = 0.5 ether;

        uint256 month = 30 days;
        tierDurations[Tier.EXPLORER] = month;
        tierDurations[Tier.GUARDIAN] = month;
        tierDurations[Tier.SENTINEL] = month;
        tierDurations[Tier.ENTERPRISE] = month;
    }

    function setTierConfig(Tier tier, uint256 price, uint256 duration) external onlyOwner {
        tierPrices[tier] = price;
        tierDurations[tier] = duration;
    }

    function mintSubscription(Tier tier) external payable {
        require(tier != Tier.NONE, "Invalid tier");
        require(msg.value >= tierPrices[tier], "Insufficient payment");
        require(userToTokenId[msg.sender] == 0, "Already has a subscription token");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        uint256 expiresAt = block.timestamp + tierDurations[tier];
        subscriptions[tokenId] = Subscription({
            tier: tier,
            expiresAt: expiresAt
        });
        userToTokenId[msg.sender] = tokenId;

        emit SubscriptionMinted(msg.sender, tokenId, tier, expiresAt);
    }

    function renewSubscription() external payable {
        uint256 tokenId = userToTokenId[msg.sender];
        require(tokenId != 0, "No subscription found");

        Subscription storage sub = subscriptions[tokenId];
        require(sub.tier != Tier.NONE, "Invalid subscription state");
        require(msg.value >= tierPrices[sub.tier], "Insufficient payment");

        if (sub.expiresAt < block.timestamp) {
            sub.expiresAt = block.timestamp + tierDurations[sub.tier];
        } else {
            sub.expiresAt += tierDurations[sub.tier];
        }

        emit SubscriptionRenewed(msg.sender, tokenId, sub.tier, sub.expiresAt);
    }

    function isSubscriptionActive(address user) external view returns (bool) {
        uint256 tokenId = userToTokenId[user];
        if (tokenId == 0) return false;
        return subscriptions[tokenId].expiresAt > block.timestamp;
    }

    function getUserTier(address user) external view returns (Tier) {
        uint256 tokenId = userToTokenId[user];
        if (tokenId == 0) return Tier.NONE;
        return subscriptions[tokenId].tier;
    }
}
