// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol";

contract CriptoReceiver {
    mapping(address => mapping(bytes32 => mapping(string => mapping(uint => bool)))) internal depositChecker;
    mapping(address => mapping(string => bytes32)) internal hashes;
    address public owner;
    bytes32 test;
    uint nonce = 0;

    constructor(address owner_) {
        owner = owner_;
    }

    function makeDeposit(uint value, address c, string memory telegramId) external returns (bool) {
        ERC20 crypto = ERC20(c);

        require(crypto.balanceOf(msg.sender) >= value, "ERROR: WALLET SEM SALDO");

        bool transferCrypto = crypto.transferFrom(msg.sender, owner, value);
        require(transferCrypto, "Transferencia falhou");

        if(transferCrypto){
            bytes32 transactionHash = keccak256(abi.encodePacked(msg.sender, c, value, block.timestamp, nonce));
            nonce += 1;
            hashes[msg.sender][telegramId] = transactionHash;
            depositChecker[msg.sender][transactionHash][telegramId][value] = true;
            test = transactionHash;
            return true;
        }
        return false;
    }

    function checkDeposit(address addressBuyer, bytes32 transactionHash, uint value, string memory telegramId) external view returns(bool){
       return depositChecker[addressBuyer][transactionHash][telegramId][value];
    }

    function getHash(address buyer, string memory telegramId) public view returns(bytes32){
        return hashes[buyer][telegramId];
    }
}

contract Dolar is ERC20 {
    constructor() ERC20("Dolares", "USD") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
