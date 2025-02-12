use starknet::ContractAddress;

#[starknet::interface]
pub trait IYourERC1155<T> {
    /// Creates new tokens of a specific type
    /// * `to` - Address that will receive the tokens
    /// * `amount` - Number of tokens to mint
    /// * `uri` - Token metadata URI
    /// * Returns - Created token ID
    /// # Errors
    /// * `Unauthorized` if caller is not the owner
    /// * `ZeroAddress` if recipient is zero address
    fn mint(ref self: T, to: ContractAddress, amount: u256, uri: ByteArray) -> u256;

    /// Gets the URI for a token type
    /// * `token_id` - ID of the token type
    /// * Returns - URI string for the token metadata
    fn uri(self: @T, token_id: u256) -> ByteArray;

    /// Gets the creator/owner of a token type
    /// * `token_id` - ID of the token type
    /// * Returns - Address of the token type creator
    fn owner_of(self: @T, token_id: u256) -> ContractAddress;
}

#[starknet::contract]
mod YourERC1155 {
    use starknet::{get_caller_address};
    use openzeppelin_token::erc1155::ERC1155Component;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::storage::Map;
    use core::array::ArrayTrait;
    use core::traits::Into;
    use super::{ContractAddress, IYourERC1155};

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC1155Impl = ERC1155Component::ERC1155Impl<ContractState>;

    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Token tracking
        token_uris: Map::<u256, ByteArray>,
        token_owners: Map::<u256, ContractAddress>,
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

    /// ERC1155 hooks implementation
    impl ERC1155HooksImpl of ERC1155Component::ERC1155HooksTrait<ContractState> {}

    #[constructor]
    fn constructor(ref self: ContractState) {
        let uri: ByteArray = "https://ipfs.io/ipfs/";

        self.erc1155.initializer(uri);
        let owner = get_caller_address();
        self.ownable.initializer(owner);
        self.next_token_id.write(1);
    }

    impl YourERC1155Impl of IYourERC1155<ContractState> {
        fn mint(
            ref self: ContractState, to: ContractAddress, amount: u256, uri: ByteArray,
        ) -> u256 {
            self.ownable.assert_only_owner();

            let token_id = self.next_token_id.read();
            self.next_token_id.write(token_id + 1);

            self.token_uris.write(token_id, uri);
            self.token_owners.write(token_id, to);

            self.erc1155.mint_with_acceptance_check(to, token_id, amount, ArrayTrait::new().span());
            token_id
        }

        fn uri(self: @ContractState, token_id: u256) -> ByteArray {
            self.token_uris.read(token_id)
        }

        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            self.token_owners.read(token_id)
        }
    }
}
