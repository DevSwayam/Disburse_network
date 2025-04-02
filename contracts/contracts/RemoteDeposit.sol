// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RemoteDeposit is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32; // <-- Important!
    address public validator;
    uint256 public nextRequestId;

    enum RequestStatus { Pending, Resolved }

    struct Request {
        address user;
        uint256 amount;
        RequestStatus status;
    }

    mapping(uint256 => Request) public requests;
    mapping(bytes32 => bool) public usedMessages;

    event FundsDeposited(address indexed user, uint256 amount, uint256 indexed requestId);
    event FundsWithdrawn(address indexed user, uint256 amount, uint256 indexed requestId);

    constructor(address _validator) Ownable(msg.sender) {
        validator = _validator;
    }

    function setValidator(address _validator) external onlyOwner {
        validator = _validator;
    }

    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");

        uint256 requestId = nextRequestId++;
        requests[requestId] = Request({
            user: msg.sender,
            amount: msg.value,
            status: RequestStatus.Pending
        });

        emit FundsDeposited(msg.sender, msg.value, requestId);
    }

    /**
     * Withdraw funds for a specific request with validator signature.
     * Signature must be over (user, amount, requestId, contract address)
     */
    function resolveRequest(uint256 requestId, bytes memory signature) external {
        Request storage request = requests[requestId];

        require(request.status == RequestStatus.Pending, "Request already resolved");
        require(request.user == msg.sender, "Not the original depositor");
        require(request.amount > 0, "No funds to withdraw");

        bytes32 message = keccak256(abi.encodePacked(msg.sender, request.amount, requestId, address(this)));
        require(!usedMessages[message], "Message already used");

        bytes32 ethSignedMessage = message.toEthSignedMessageHash();
        address recovered = ethSignedMessage.recover(signature);
        require(recovered == validator, "Invalid signature");

        usedMessages[message] = true;
        request.status = RequestStatus.Resolved;

        payable(msg.sender).transfer(request.amount);
        emit FundsWithdrawn(msg.sender, request.amount, requestId);
    }
}
