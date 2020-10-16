// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.7.0;

import './Relay.sol';

contract BlogTemplatesRelayer is Relay {
    constructor(address _contract, address _owner) Relay(_contract, _owner) { }
}