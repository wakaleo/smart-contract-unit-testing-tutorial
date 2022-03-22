pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
  * @notice Voting tokens are used to manage voting access.
 */
contract Voken is ERC20 {

    uint constant _initial_supply = 10000000 * (10**18);

    constructor() ERC20("Voken", "VKN") {
        _mint(msg.sender, _initial_supply);
    }
}
