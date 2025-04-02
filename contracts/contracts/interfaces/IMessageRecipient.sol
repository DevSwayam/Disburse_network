// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMessageRecipient {
    /**
     * @notice Handle an incoming message
     * @param _origin The source domain
     * @param _sender The sender of the message (as bytes32, typically an address on origin)
     * @param _message The raw message delivered from `_origin`
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external;
}
