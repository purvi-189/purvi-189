// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITemplateNFT {
    struct TemplateData {
        uint tokenIds;
        address creator;
        string tokenIpfsUri;
    }

    function safeMint(address to, uint256 tokenId, string memory uri) external;

    function safeMintOwnership(
        address to,
        uint256 creatorId,
        string memory uri
    ) external;

    function mintTemplate(
        address _to,
        string memory _uri,
        uint _proposalId
    ) external;

    function mintcreatorNFT(address _to, string memory _uri) external;

    function mintMemberNFT(address _to, string memory _uri) external;

    function tokenURI(uint256 tokenId) external;

    function getTemplateDetails(
        uint _templateId
    ) external view returns (address);
}
