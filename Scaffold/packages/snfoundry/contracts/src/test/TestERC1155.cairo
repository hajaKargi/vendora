#[cfg(test)]
mod tests {
    use core::traits::Into;
    use snforge_std::{declare, ContractClassTrait, start_prank, stop_prank};
    use starknet::ContractAddress;
    use super::super::YourERC1155;

    fn deploy_erc1155(owner: ContractAddress) -> ContractAddress {
        let contract = declare("YourERC1155");
        let mut calldata = array![];
        calldata.append(owner.into());
        let (address, _) = contract.deploy(@calldata).unwrap();
        address
    }

    #[test]
    fn test_mint() {
        let owner = starknet::contract_address_const::<0x123>();
        let contract_address = deploy_erc1155(owner);
        let recipient = starknet::contract_address_const::<0x456>();

        // Start acting as owner
        start_prank(contract_address, owner);

        let dispatcher = IYourERC1155Dispatcher { contract_address };
        let uri: ByteArray = "ipfs://QmTest";
        let amount = 1;

        let token_id = dispatcher.mint(recipient, amount, uri);

        assert(dispatcher.balance_of(recipient, token_id) == amount, 'Wrong balance');
        assert(dispatcher.uri(token_id) == uri, 'Wrong URI');
        assert(dispatcher.owner_of(token_id) == recipient, 'Wrong owner');

        stop_prank(contract_address);
    }
} 