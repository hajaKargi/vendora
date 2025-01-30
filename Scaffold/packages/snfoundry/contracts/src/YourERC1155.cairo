#[starknet::contract]
mod YourERC1155 {
    use starknet::{ContractAddress, get_caller_address};
    use openzeppelin::token::erc1155::ERC1155Component;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::access::ownable::OwnableComponent;

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Token tracking
        token_uris: LegacyMap::<u256, ByteArray>,
        token_owners: LegacyMap::<u256, ContractAddress>,
        next_token_id: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.erc1155.initializer("ipfs://");
        self.ownable.initializer(owner);
        self.next_token_id.write(1);
    }

    #[external(v0)]
    fn mint(
        ref self: ContractState,
        to: ContractAddress,
        amount: u256,
        uri: ByteArray,
    ) -> u256 {
        // Only owner can mint
        self.ownable.assert_only_owner();

        let token_id = self.next_token_id.read();
        self.next_token_id.write(token_id + 1);

        // Store token URI
        self.token_uris.write(token_id, uri);
        self.token_owners.write(token_id, to);

        // Mint tokens
        self.erc1155._mint(to, token_id, amount, ArrayTrait::new());

        token_id
    }

    #[external(v0)]
    fn uri(self: @ContractState, token_id: u256) -> ByteArray {
        self.token_uris.read(token_id)
    }

    #[external(v0)]
    fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
        self.token_owners.read(token_id)
    }
} 