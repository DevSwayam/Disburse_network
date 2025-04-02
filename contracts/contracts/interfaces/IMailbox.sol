// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @dev Simple interface for the Hyperlane Mailbox contract.
 *      See: https://docs.hyperlane.xyz/docs/overview/mailbox
 */
interface IMailbox {
    /**
     * @notice Dispatches a message to another chain via the Hyperlane protocol.
     * @param _destinationDomain Domain of destination chain
     * @param _recipientAddress The recipient address (as bytes32) on the destination chain
     * @param _message Arbitrary message to be executed/consumed on the destination chain
     */
    function dispatch(
        uint32 _destinationDomain,
        bytes32 _recipientAddress,
        bytes calldata _message
    ) external returns (bytes32);
}
