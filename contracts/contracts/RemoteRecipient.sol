// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IMessageRecipient.sol";

/**
 * @dev Example Remote Recipient on the destination chain.
 *      It expects to receive an encoded payload of:
 *         (address[] recipients, uint256[] amounts, uint256 totalAmount)
 *      and then distribute ETH to each recipient.
 *
 * NOTE:
 * 1. This contract must be pre-funded with enough ETH to cover all distributions.
 * 2. In a production system, you might want to restrict which domain (_origin)
 *    or which address (_sender) can call `handle`, so malicious messages can’t drain your ETH.
 */
contract RemoteRecipient is IMessageRecipient, Ownable {
    // Accept ETH via direct transfers (e.g., contract funding)
    receive() external payable {}

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Handle an incoming message from Hyperlane
     * @param _origin The source domain (chain ID in Hyperlane's domain format)
     * @param _sender The sender of the message on the origin chain (as bytes32)
     * @param _message The raw message containing distribution info
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external override {
        // -----------------------------
        // 1. (Optional) Security Checks
        // -----------------------------
        // In a real system, you might want to:
        //    - Check that msg.sender is the Hyperlane Mailbox on this chain.
        //    - Restrict which _origin domains are allowed.
        //    - Restrict which _sender addresses are allowed.
        // This is critical so that you don't accept arbitrary distributions from unknown senders!

        // -----------------------------
        // 2. Decode the Distribution Data
        // -----------------------------
        (address[] memory recipients, uint256[] memory amounts, uint256 totalAmount) =
            abi.decode(_message, (address[], uint256[], uint256));

        require(recipients.length == amounts.length, "Mismatched array lengths");

        // -----------------------------
        // 3. Distribute ETH
        // -----------------------------
        // Check we have enough ETH in this contract to cover the distribution
        require(address(this).balance >= totalAmount, "Not enough ETH in contract");

        // Transfer ETH to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            // Attempt to send the specified amount
            // Using .call{value: x}("") to send ETH
            (bool success, ) = recipients[i].call{value: amounts[i]}("");
            require(success, "ETH transfer failed");
        }

        // Optionally, you might want to emit an event for logging
        emit DistributionHandled(_origin, _sender, totalAmount);
    }

    /**
     * @dev (Optional) Owner can withdraw any leftover ETH to a safe address.
     */
    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Amount exceeds balance");
        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Withdraw failed");
    }

    event DistributionHandled(uint32 origin, bytes32 sender, uint256 totalAmount);
}
