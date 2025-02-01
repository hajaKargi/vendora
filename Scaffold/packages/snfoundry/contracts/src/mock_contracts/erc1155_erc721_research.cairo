// SPDX-License-Identifier: MIT
/// Combined ERC721 and ERC1155 Contract in Cairo 2.0
/// @notice Research purpose, not meant for use

#[starknet::contract]
pub mod ERC1155_ERC721_Combined_token {
    use core::num::traits::Zero;
    use starknet::{ ContractAddress, get_caller_address };
    use starknet::storage::{ Map, StorageMapReadAccess, StorageMapWriteAccess };
    use openzeppelin::
}