// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IMailbox} from "./interfaces/IMailbox.sol";

/**
 * @title MultiSender
 * @dev A contract that uses Hyperlane’s mailbox to dispatch messages to multiple chains,
 *      verifying data with an ECDSA signature from a trusted solver.
 */
contract MultiSender is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32; // <-- Important!

    mapping(uint32 => bytes32) public remoteRecipients;

    // -----------------------------------------------------
    // Data Structures
    // -----------------------------------------------------
    struct Distribution {
        address[] recipients;
        uint256[] amounts;
        uint256 totalAmount;
        uint32 chainId;
    }

    struct RemoteRecipient {
        address recipient;
        uint32 chainId;
    }

    // -----------------------------------------------------
    // State Variables
    // -----------------------------------------------------
    IMailbox public mailbox;
    address public solver;
    bytes32 public remoteRecipient;

    // -----------------------------------------------------
    // Constructor
    // -----------------------------------------------------
    constructor(address _mailbox, address _solver) Ownable(msg.sender) {
        mailbox = IMailbox(_mailbox);
        solver = _solver;
    }

    // here we will provide a array of struct wher each chain id will have its remoteRecipient contract
    function initialize(
        RemoteRecipient[] memory _recipients
    ) external onlyOwner {
        for (uint256 i = 0; i < _recipients.length; i++) {
            RemoteRecipient memory recipient = _recipients[i];
            remoteRecipients[recipient.chainId] = bytes32(
                uint256(uint160(recipient.recipient))
            );
        }
    }

    function multiSendWithNativeEth(bytes calldata data) external payable {
        // Decode the data into an array of Distribution structs
        Distribution[] memory distributions = abi.decode(
            data,
            (Distribution[])
        );

        uint256 totalAmountToSend = 0;

        // 4) Dispatch a Hyperlane message for each Distribution
        for (uint256 i = 0; i < distributions.length; i++) {
            Distribution memory dist = distributions[i];

            // Optional checks, e.g. dist.recipients.length == dist.amounts.length
            // and possibly that remoteRecipients[dist.chainId] is set:
            require(
                remoteRecipients[dist.chainId] != bytes32(0),
                "No remote recipient configured for this chain ID"
            );

            bytes memory messageToSend = abi.encode(
                dist.recipients,
                dist.amounts,
                dist.totalAmount
            );

            totalAmountToSend += dist.totalAmount;

            // Use the chain-specific remoteRecipient from the mapping
            mailbox.dispatch(
                dist.chainId,
                remoteRecipients[dist.chainId],
                messageToSend
            );
        }

        // Transfer the total amount to this contract
        require(msg.value == totalAmountToSend, "Incorrect amount of ETH sent");
        (bool success, ) = msg.sender.call{value: totalAmountToSend}("");
        require(success, "Failed to send ETH");
    }

    // -----------------------------------------------------
    // Primary Function
    // -----------------------------------------------------
    function multiSend(bytes calldata data, bytes calldata signature) external {
        // 1) Compute the ETH-signed message hash by first hashing `data`,
        //    then applying EIP-191 prefix.
        bytes32 rawHash = keccak256(data);
        bytes32 ethSignedMessageHash = rawHash.toEthSignedMessageHash();

        // 2) Recover signer and compare with solver
        address recovered = ECDSA.recover(ethSignedMessageHash, signature);
        require(recovered == solver, "Invalid signature from solver");

        // 3) Decode the data into an array of Distribution structs
        Distribution[] memory distributions = abi.decode(
            data,
            (Distribution[])
        );

        // 4) Dispatch a Hyperlane message for each Distribution
        for (uint256 i = 0; i < distributions.length; i++) {
            Distribution memory dist = distributions[i];

            // Optional checks, e.g. dist.recipients.length == dist.amounts.length
            // and possibly that remoteRecipients[dist.chainId] is set:
            require(
                remoteRecipients[dist.chainId] != bytes32(0),
                "No remote recipient configured for this chain ID"
            );

            bytes memory messageToSend = abi.encode(
                dist.recipients,
                dist.amounts,
                dist.totalAmount
            );

            // Use the chain-specific remoteRecipient from the mapping
            mailbox.dispatch(
                dist.chainId,
                remoteRecipients[dist.chainId],
                messageToSend
            );
        }
    }
}
