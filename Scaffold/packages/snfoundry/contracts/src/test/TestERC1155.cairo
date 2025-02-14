#[cfg(test)]
mod tests {
    use contracts::YourERC1155::{IYourERC1155Dispatcher, IYourERC1155DispatcherTrait};
    use openzeppelin_token::erc1155::interface::{
        IERC1155Dispatcher, IERC1155DispatcherTrait
    };
    use snforge_std::{CheatSpan, ContractClassTrait, DeclareResultTrait, cheat_caller_address, declare};
    use starknet::{ContractAddress, contract_address_const};

    fn deploy_erc1155() -> ContractAddress {
        let contract = declare("YourERC1155").unwrap().contract_class();
        let mut calldata = array![];
        let (contract_address, _) = contract.deploy(@calldata).unwrap();
        println!("Contract deployed on: {:?}", contract_address);
        contract_address
    }

    #[test]
    fn test_mint() {
        let owner = contract_address_const::<'OWNER'>();
        let contract_address = deploy_erc1155();
        let recipient = contract_address_const::<'RECIPIENT'>();

        cheat_caller_address(contract_address, owner, CheatSpan::Indefinite);

        let erc1155_dispatcher = IYourERC1155Dispatcher { contract_address };
        let base_dispatcher = IERC1155Dispatcher { contract_address };

        let uri: ByteArray = "ipfs://QmTest";
        let amount = 100;
        
        let token_id = erc1155_dispatcher.mint(recipient, amount, uri.clone());
        assert(token_id == 1, 'First token ID should be 1');

        let balance = base_dispatcher.balance_of(recipient, token_id);
        assert(balance == amount, 'Wrong balance after mint');

        let stored_uri = erc1155_dispatcher.uri(token_id);
        assert(stored_uri == uri, 'Wrong URI');

        let owner_of = erc1155_dispatcher.owner_of(token_id);
        assert(owner_of == recipient, 'Wrong owner');
    }

    #[test]
    fn test_transfer() {
        let owner = contract_address_const::<'OWNER'>();
        let contract_address = deploy_erc1155();
        let sender = contract_address_const::<'SENDER'>();
        let recipient = contract_address_const::<'RECIPIENT'>();

        cheat_caller_address(contract_address, owner, CheatSpan::Indefinite);

        let erc1155_dispatcher = IYourERC1155Dispatcher { contract_address };
        let base_dispatcher = IERC1155Dispatcher { contract_address };

        let uri: ByteArray = "ipfs://QmTest";
        let initial_amount = 100;
        let token_id = erc1155_dispatcher.mint(sender, initial_amount, uri);

        cheat_caller_address(contract_address, sender, CheatSpan::Indefinite);

        let transfer_amount = 40;
        let mut data: Array<felt252> = ArrayTrait::new();
        base_dispatcher.safe_transfer_from(
            sender, recipient, token_id, transfer_amount, data.span()
        );

        let sender_balance = base_dispatcher.balance_of(sender, token_id);
        let recipient_balance = base_dispatcher.balance_of(recipient, token_id);

        assert(sender_balance == initial_amount - transfer_amount, 'Wrong sender balance');
        assert(recipient_balance == transfer_amount, 'Wrong recipient balance');
    }

    #[test]
    fn test_multiple_mints() {
        let owner = contract_address_const::<'OWNER'>();
        let contract_address = deploy_erc1155();
        let recipient = contract_address_const::<'RECIPIENT'>();

        cheat_caller_address(contract_address, owner, CheatSpan::Indefinite);

        let erc1155_dispatcher = IYourERC1155Dispatcher { contract_address };
        
        let uri1: ByteArray = "ipfs://QmTest1";
        let amount1 = 100;
        let token_id1 = erc1155_dispatcher.mint(recipient, amount1, uri1.clone());
        
        let uri2: ByteArray = "ipfs://QmTest2";
        let amount2 = 200;
        let token_id2 = erc1155_dispatcher.mint(recipient, amount2, uri2.clone());

        assert(token_id1 == 1, 'First token ID should be 1');
        assert(token_id2 == 2, 'Second token ID should be 2');

        assert(erc1155_dispatcher.uri(token_id1) == uri1, 'Wrong URI for token 1');
        assert(erc1155_dispatcher.uri(token_id2) == uri2, 'Wrong URI for token 2');
        assert(erc1155_dispatcher.owner_of(token_id1) == recipient, 'Wrong owner for token 1');
        assert(erc1155_dispatcher.owner_of(token_id2) == recipient, 'Wrong owner for token 2');
    }
} 