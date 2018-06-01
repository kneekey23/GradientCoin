pragma solidity ^0.4.23;

import "./ERC721.sol";

contract GradientCoin is ERC721 {
    /*** CONSTANTS ***/
    string public constant name = "GradientCoin";
    string public constant symbol = "GRD";

    bytes4 constant InterfaceID_ERC165 = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant InterfaceID_ERC721 =
        bytes4(keccak256("name()")) ^
        bytes4(keccak256("symbol()")) ^
        bytes4(keccak256("totalSupply()")) ^
        bytes4(keccak256("balanceOf(address)")) ^
        bytes4(keccak256("ownerOf(uint256)")) ^
        bytes4(keccak256("approve(address,uint256)")) ^
        bytes4(keccak256("transfer(address,uint256)")) ^
        bytes4(keccak256("transferFrom(address,address,uint256)")) ^
        bytes4(keccak256("tokensOfOwner(address)"));

    /*** DATA TYPES ***/
    struct Gradient {
        string outer;
        string inner;
    }

    /*** STORAGE ***/
    address public contractOwner;
    Gradient[] public gradients;

    mapping (uint256 => address) public tokenIndexToOwner;
    mapping (address => uint256) public ownershipTokenCount;
    mapping (uint256 => address) public tokenIndexToApproved;

    /*** EVENTS ***/
    event Mint(address owner, uint256 tokenId);

    /*** CONSTRUCTOR ***/
    constructor() 
    {
        contractOwner = msg.sender;
    }

    /*** INTERNAL FUNCTIONS ***/

    function _owns(address _claimant, uint256 _tokenId) 
        internal 
        view 
        returns (bool) 
    {
        return tokenIndexToOwner[_tokenId] == _claimant;
    }

    function _approvedFor(address _claimant, uint256 _tokenId) 
        internal 
        view 
        returns (bool) 
    {
        return tokenIndexToApproved[_tokenId] == _claimant;
    }

    function _approve(address _to, uint256 _tokenId) 
        internal 
    {
        tokenIndexToApproved[_tokenId] = _to;
        emit Approval(tokenIndexToOwner[_tokenId], tokenIndexToApproved[_tokenId], _tokenId);
    }

    function _transfer(address _from, address _to, uint256 _tokenId) 
        internal 
    {
        ownershipTokenCount[_to]++;
        tokenIndexToOwner[_tokenId] = _to;
        if (_from != address(0)) {
            ownershipTokenCount[_from]--;
            delete tokenIndexToApproved[_tokenId];
        }

        emit Transfer(_from, _to, _tokenId);
    }

    function _mint(address _sender, string _outer, string _inner) 
        internal 
        returns (uint256 tokenId) 
    {
        require(_sender == contractOwner);

        Gradient memory newToken = Gradient({
            outer: _outer,
            inner: _inner
        });

        tokenId = gradients.push(newToken) - 1;

        emit Mint(msg.sender, tokenId);

        _transfer(0, msg.sender, tokenId);
    }


  /*** ERC721 IMPLEMENTATION ***/

    function supportsInterface(bytes4 _interfaceID) 
        external 
        view 
        returns (bool) 
    {
        return ((_interfaceID == InterfaceID_ERC165) || (_interfaceID == InterfaceID_ERC721));
    }

    function totalSupply() 
        public 
        view 
        returns (uint256) 
    {
        return gradients.length;
    }

    function balanceOf(address _owner) 
        public 
        view 
        returns (uint256) 
    {
        return ownershipTokenCount[_owner];
    }

    function ownerOf(uint256 _tokenId) 
        external 
        view 
        returns (address owner) 
    {
        owner = tokenIndexToOwner[_tokenId];
        require(owner != address(0));
    }

    function approve(address _to, uint256 _tokenId) 
        external 
    {
        require(_owns(msg.sender, _tokenId));

        _approve(_to, _tokenId);
    }

    function transfer(address _to, uint256 _tokenId) 
        external 
    {
        require(_to != address(0));
        require(_to != address(this));
        require(_owns(msg.sender, _tokenId));

        _transfer(msg.sender, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) 
        external 
    {
        require(_to != address(0));
        require(_to != address(this));
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));

        _transfer(_from, _to, _tokenId);
    }

    function tokensOfOwner(address _owner) 
        external 
        view 
        returns (uint256[]) 
    {
        uint256 balance = balanceOf(_owner);

        if (balance == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](balance);
            uint256 maxTokenId = totalSupply();
            uint256 idx = 0;

            uint256 tokenId;
            for (tokenId = 1; tokenId <= maxTokenId; tokenId++) {
                if (tokenIndexToOwner[tokenId] == _owner) {
                    result[idx] = tokenId;
                    idx++;
                }
            }
        }

        return result;
    }


  /*** OTHER EXTERNAL FUNCTIONS ***/

    function mint(string _outer, string _inner) 
        external 
        returns (uint256) 
    {
        require(msg.sender == contractOwner);
        return _mint(msg.sender, _outer, _inner);
    }

    function getToken(uint256 _tokenId) 
        external 
        view 
        returns (string outer, string inner) 
    {
        Gradient memory gradient = gradients[_tokenId];

        outer = gradient.outer;
        inner = gradient.inner;
    }
}

//// Every ERC721 token contract must implement the following functions
// contract ERC721 {
//    // ERC20 compatible functions
//    function name() constant returns (string name);
//    function symbol() constant returns (string symbol);
//    function totalSupply() constant returns (uint256 totalSupply);
//    function balanceOf(address _owner) constant returns (uint balance);
//    // Functions that define ownership
//    function ownerOf(uint256 _tokenId) constant returns (address owner);
//    function approve(address _to, uint256 _tokenId);
//    function takeOwnership(uint256 _tokenId);
//    function transfer(address _to, uint256 _tokenId);
//    function tokenOfOwnerByIndex(address _owner, uint256 _index) constant returns (uint tokenId);
//    // Token metadata
//    function tokenMetadata(uint256 _tokenId) constant returns (string infoUrl);
//    // Events
//    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
//    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
// }