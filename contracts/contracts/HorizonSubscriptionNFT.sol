// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract HorizonSubscriptionNFT is ERC721, Ownable {
    using Strings for uint256;

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
    mapping(Tier => uint256) public tierAutoLoggingRateLimits;

    string public baseTokenURI = "https://horizon-aiops.vercel.app/nft/metadata/";
    string public contractMetadataURI = "https://horizon-aiops.vercel.app/nft/metadata/contract.json";
    string public constant THEME_COLOR = "#0047AB";
    string public constant NFT_IMAGE_URL = "https://horizon-aiops.vercel.app/horizon.jpg";

    event SubscriptionMinted(address indexed user, uint256 tokenId, Tier tier, uint256 expiresAt, uint256 rateLimit);
    event SubscriptionRenewed(address indexed user, uint256 tokenId, Tier tier, uint256 expiresAt);
    event AutoLoggingRateLimitUpdated(Tier indexed tier, uint256 rateLimit);

    constructor() ERC721("Horizon Subscription NFT", "HZN-SUB") Ownable(msg.sender) {
        // Initialize pricing
        tierPrices[Tier.EXPLORER] = 0.01 ether;
        tierPrices[Tier.GUARDIAN] = 0.05 ether;
        tierPrices[Tier.SENTINEL] = 0.1 ether;
        tierPrices[Tier.ENTERPRISE] = 0.5 ether;

        uint256 month = 30 days;
        tierDurations[Tier.EXPLORER] = month;
        tierDurations[Tier.GUARDIAN] = month;
        tierDurations[Tier.SENTINEL] = month;
        tierDurations[Tier.ENTERPRISE] = month;

        // AutoLogging Rate Limits: 5, 10, 15, 20
        tierAutoLoggingRateLimits[Tier.EXPLORER] = 5;
        tierAutoLoggingRateLimits[Tier.GUARDIAN] = 10;
        tierAutoLoggingRateLimits[Tier.SENTINEL] = 15;
        tierAutoLoggingRateLimits[Tier.ENTERPRISE] = 20;
    }

    function setTierConfig(Tier tier, uint256 price, uint256 duration, uint256 autoLoggingRateLimit) external onlyOwner {
        tierPrices[tier] = price;
        tierDurations[tier] = duration;
        tierAutoLoggingRateLimits[tier] = autoLoggingRateLimit;
        emit AutoLoggingRateLimitUpdated(tier, autoLoggingRateLimit);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
    }

    function setContractURI(string memory newContractURI) external onlyOwner {
        contractMetadataURI = newContractURI;
    }

    function contractURI() external view returns (string memory) {
        return contractMetadataURI;
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

        emit SubscriptionMinted(msg.sender, tokenId, tier, expiresAt, tierAutoLoggingRateLimits[tier]);
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

    function getAutoLoggingRateLimit(address user) external view returns (uint256) {
        uint256 tokenId = userToTokenId[user];
        if (tokenId == 0 || subscriptions[tokenId].expiresAt <= block.timestamp) {
            return 5; // Default baseline rate limit: 5 events/minute
        }
        return tierAutoLoggingRateLimits[subscriptions[tokenId].tier];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 tierNum = uint256(subscriptions[tokenId].tier);
        return string(abi.encodePacked(baseTokenURI, tierNum.toString(), ".json"));
    }
}
