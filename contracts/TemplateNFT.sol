// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol"; 

contract TemplateNFT is ERC721, ERC721URIStorage, Ownable {
    constructor() ERC721("MyTemplate", "MTL") {}

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _creatorIdCounter;
    Counters.Counter private _memberIdCounter;

    struct TemplateData {
        uint tokenIds;
        address creator;
        string tokenIpfsUri;
    }

    struct creatorData {
        uint creatorId;
        address owner;
        string badgeIpfsUri;
    }
    struct memberData {
        uint memberId;
        address member;
        string memberIpfsUri;
    }


    // Template NFT
    mapping(address => uint[]) public templateIdToUser;
    mapping(uint => TemplateData) public idToTemplateData;
    mapping(uint => uint) public proposalIdToTempId;

    // creator NFT
    mapping(address => uint[]) public userTocreatorNFTs;
    mapping(uint => creatorData) public creatorIdTocreatorData;

    // member NFT
    mapping(address => uint[]) public userTomemberNFTs;
    mapping(uint => memberData) public memberIdTomemberData;

    address public samhitaAddress;
    address public langDAOAddress;


    function safeMint(address to, uint256 tokenId, string memory uri) internal {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // function safeMintOwnership(
    //     address to,
    //     uint256 creatorId,
    //     string memory uri
    // ) public {
    //     // _safeMintOwnership(to,creatorId );
    //     _safeMint(to, creatorId);
    //     _setTokenURI(creatorId, uri);
    // }

    function setSamhitaAddress(address _address) public onlyOwner {
        samhitaAddress = _address;
    }
        function setLanguageDAOAddress(address _address) public onlyOwner {
        langDAOAddress = _address;
    }

    function mintTemplate(
        address _to,
        string memory _uri,
        uint _proposalId
    ) public {
        require(
            msg.sender == samhitaAddress || msg.sender == langDAOAddress, 
            "only samhita or langDAO contract can call this function"
        );
        uint256 tokenId = _tokenIdCounter.current();
        proposalIdToTempId[_proposalId] = tokenId;

        _tokenIdCounter.increment();
        safeMint(_to, tokenId, _uri);
        templateIdToUser[_to].push(tokenId);
        idToTemplateData[tokenId] = TemplateData(tokenId, _to, _uri);

    }

    function mintcreatorNFT(address _to, string memory _uri) external {
        uint256 creatorId = _creatorIdCounter.current(); // Get the unique creator ID
        _creatorIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        safeMint(_to, tokenId, _uri);
        // Store creator data associated with the creatorId.
        creatorIdTocreatorData[creatorId] = creatorData(tokenId, _to, _uri);
        // Add the creatorId to the user's list of owned creator NFTs.
        userTocreatorNFTs[_to].push(creatorId);
    }

    // member NFT
    function mintMemberNFT(address _to, string memory _uri) public {
        uint256 memberId = _memberIdCounter.current(); // Get the unique creator ID
        _memberIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();


        safeMint(_to, tokenId, _uri);

        //   Store creator data associated with the creatorId.
        memberIdTomemberData[memberId] = memberData(tokenId, _to, _uri);

        // Add the creatorId to the user's list of owned creator NFTs.
        userTomemberNFTs[_to].push(memberId);
    }

    // Function to retrieve all creator NFTs owned by a user.
    function getUsercreatorNFTs(
        address _user
    ) public view returns (uint[] memory) {
        return userTocreatorNFTs[_user];
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getAlltemplateIDS(
        address _user
    ) public view returns (uint[] memory) {
        return templateIdToUser[_user];
    }

    function getTemplateDetails(
        uint _templateId
    ) public view returns (address) {
        return idToTemplateData[_templateId].creator;
    }

    function getCreatorNFTs(address _user) public view returns (uint[] memory) {
        return userTocreatorNFTs[_user];
    }

    // Override supportsInterface to specify which base contract's function to use
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
