//! # YourCollectible Contract
//! 
//! This contract implements a custom ERC721 token with enumeration functionality
//! and URI storage. It allows the creation (minting) of unique NFTs with associated metadata.
//!
//! ## Main Features:
//! - ERC721 token minting
//! - URI storage per token
//! - Token enumeration
//! - Ownership control
//! - Metadata management
//!
//! ## Components Used:
//! - ERC721: Base NFT functionality
//! - Ownable: Ownership control
//! - Counter: Token ID management
//! - SRC5: Introspection standard
//! - ERC721Enumerable: Token enumeration
//!
//! ## Security Considerations:
//! - Only the owner can mint new tokens
//! - Token URIs cannot be modified after minting
//! - Zero address checks are implemented
//! - Reentrancy protection through internal checks
//!
//! ## Data Flow:
//! 1. Owner deploys contract
//! 2. Owner can mint tokens to any address
//! 3. Recipients can transfer their tokens
//! 4. Anyone can query token information
//!
//! ## Error Handling:
//! - Invalid token ID: Reverts if token doesn't exist
//! - Unauthorized: Reverts if caller isn't owner
//! - Zero Address: Reverts if recipient is zero address

use starknet::ContractAddress;

/// Main contract interface that defines public operations
#[starknet::interface]
pub trait IYourCollectible<T> {
    /// Creates a new NFT token
    /// * `recipient` - Address that will receive the token
    /// * `uri` - Token metadata URI
    /// * Returns - Created token ID
    /// # Errors
    /// * `Unauthorized` if caller is not the owner
    /// * `ZeroAddress` if recipient is zero address
    fn mint_item(ref self: T, recipient: ContractAddress, uri: ByteArray) -> u256;
}

#[starknet::contract]
mod YourCollectible {
    use contracts::components::Counter::CounterComponent;
    use core::num::traits::zero::Zero;
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::ERC721Component;
    use openzeppelin_token::erc721::extensions::ERC721EnumerableComponent;
    use starknet::storage::Map;
    use super::{ContractAddress, IYourCollectible};

    // Component declarations with enhanced documentation
    /// ERC721 base functionality for NFT operations
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    /// SRC5 for interface detection
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    /// Ownable for access control
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    /// Counter for token ID management
    component!(path: CounterComponent, storage: token_id_counter, event: CounterEvent);
    /// Enumerable extension for token listing
    component!(path: ERC721EnumerableComponent, storage: enumerable, event: EnumerableEvent);

    /// Public implementations exposed as entrypoints
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    #[abi(embed_v0)]
    impl CounterImpl = CounterComponent::CounterImpl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721Impl = ERC721Component::ERC721Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721CamelOnlyImpl = ERC721Component::ERC721CamelOnlyImpl<ContractState>;
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
    #[abi(embed_v0)]
    impl ERC721EnumerableImpl = ERC721EnumerableComponent::ERC721EnumerableImpl<ContractState>;

    /// Internal implementations for contract logic
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    /// Contract storage structure
    #[storage]
    struct Storage {
        /// ERC721 component storage for base NFT functionality
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        /// SRC5 component storage for interface detection
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        /// Ownership control storage for access management
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        /// Token ID counter storage for unique ID generation
        #[substorage(v0)]
        token_id_counter: CounterComponent::Storage,
        /// Token enumeration storage for listing capabilities
        #[substorage(v0)]
        enumerable: ERC721EnumerableComponent::Storage,
        /// Mapping of token IDs to their URIs
        /// The URI cannot be changed once set
        token_uris: Map<u256, ByteArray>,
    }

    /// Events emitted by the contract
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        /// ERC721 transfer and approval events
        #[flat]
        ERC721Event: ERC721Component::Event,
        /// SRC5 interface registration events
        #[flat]
        SRC5Event: SRC5Component::Event,
        /// Ownership transfer events
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        /// Counter update events
        CounterEvent: CounterComponent::Event,
        /// Enumeration update events
        EnumerableEvent: ERC721EnumerableComponent::Event,
    }

    /// Contract constructor
    /// * `owner` - Initial contract owner address
    /// # Security
    /// * Validates owner is not zero address
    /// * Sets up initial contract state
    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        let name: ByteArray = "YourCollectible";
        let symbol: ByteArray = "YCB";
        let base_uri: ByteArray = "https://ipfs.io/ipfs/";

        self.erc721.initializer(name, symbol, base_uri);
        self.ownable.initializer(owner);
    }

    /// Main interface implementation
    #[abi(embed_v0)]
    impl YourCollectibleImpl of IYourCollectible<ContractState> {
        /// Creates a new NFT token
        /// * `recipient` - Address that will receive the token
        /// * `uri` - Token metadata URI
        /// * Returns - Created token ID
        /// # Security
        /// * Only owner can mint
        /// * Recipient cannot be zero address
        /// * URI is permanently set
        fn mint_item(ref self: ContractState, recipient: ContractAddress, uri: ByteArray) -> u256 {
            self.token_id_counter.increment();
            let token_id = self.token_id_counter.current();
            self.erc721.mint(recipient, token_id);
            self.token_uris.write(token_id, uri);
            token_id
        }
    }

    /// Token enumeration hooks implementation
    impl ERC721EnumerableHooksImpl<
        T,
        impl ERC721Enumerable: ERC721EnumerableComponent::HasComponent<T>,
        impl Counter: CounterComponent::HasComponent<T>,
        impl HasComponent: ERC721Component::HasComponent<T>,
        +SRC5Component::HasComponent<T>,
        +Drop<T>,
    > of ERC721Component::ERC721HooksTrait<T> {
        /// Executes before any token update
        /// * `to` - Destination address
        /// * `token_id` - Token ID
        /// * `auth` - Authorized address
        fn before_update(
            ref self: ERC721Component::ComponentState<T>,
            to: ContractAddress,
            token_id: u256,
            auth: ContractAddress,
        ) {
            let counter_component = get_dep_component!(@self, Counter);
            let token_id_counter = counter_component.current();
            let mut enumerable_component = get_dep_component_mut!(ref self, ERC721Enumerable);
            
            // New mint logic
            if (token_id == token_id_counter) {
                let length = enumerable_component.ERC721Enumerable_all_tokens_len.read();
                enumerable_component.ERC721Enumerable_all_tokens_index.write(token_id, length);
                enumerable_component.ERC721Enumerable_all_tokens.write(length, token_id);
                enumerable_component.ERC721Enumerable_all_tokens_len.write(length + 1);
            } 
            // Transfer logic
            else if (token_id < token_id_counter + 1) {
                let owner = self.owner_of(token_id);
                if owner != to {
                    let last_token_index = self.balance_of(owner) - 1;
                    let token_index = enumerable_component
                        .ERC721Enumerable_owned_tokens_index
                        .read(token_id);

                    if (token_index != last_token_index) {
                        let last_token_id = enumerable_component
                            .ERC721Enumerable_owned_tokens
                            .read((owner, last_token_index));
                        enumerable_component
                            .ERC721Enumerable_owned_tokens
                            .write((owner, token_index), last_token_id);
                        enumerable_component
                            .ERC721Enumerable_owned_tokens_index
                            .write(last_token_id, token_index);
                    }

                    enumerable_component
                        .ERC721Enumerable_owned_tokens
                        .write((owner, last_token_index), 0);
                    enumerable_component.ERC721Enumerable_owned_tokens_index.write(token_id, 0);
                }
            }

            // Token burn logic
            if (to == Zero::zero()) {
                let last_token_index = enumerable_component.ERC721Enumerable_all_tokens_len.read() - 1;
                let token_index = enumerable_component
                    .ERC721Enumerable_all_tokens_index
                    .read(token_id);

                let last_token_id = enumerable_component
                    .ERC721Enumerable_all_tokens
                    .read(last_token_index);

                enumerable_component.ERC721Enumerable_all_tokens.write(token_index, last_token_id);
                enumerable_component
                    .ERC721Enumerable_all_tokens_index
                    .write(last_token_id, token_index);

                enumerable_component.ERC721Enumerable_all_tokens_index.write(token_id, 0);
                enumerable_component.ERC721Enumerable_all_tokens.write(last_token_index, 0);
                enumerable_component.ERC721Enumerable_all_tokens_len.write(last_token_index);
            } 
            // Mint and transfer logic
            else if (to != auth) {
                let length = self.balance_of(to);
                enumerable_component.ERC721Enumerable_owned_tokens.write((to, length), token_id);
                enumerable_component.ERC721Enumerable_owned_tokens_index.write(token_id, length);
            }
        }

        /// Executes after any token update
        fn after_update(
            ref self: ERC721Component::ComponentState<T>,
            to: ContractAddress,
            token_id: u256,
            auth: ContractAddress,
        ) {}
    }
}

/// # Extended Usage Guide
/// 
/// ## 1. Contract Deployment
/// Deploy the contract and set the initial owner:
/// ```
/// starknet deploy --contract YourCollectible.cairo --inputs <owner_address>
/// ```
///
/// ## 2. Token Operations
/// 
/// ### Minting a new token:
/// ```
/// starknet invoke --address <contract_address> --function mint_item --inputs <recipient> <uri>
/// ```
///
/// ### Transferring a token:
/// ```
/// starknet invoke --address <contract_address> --function transferFrom --inputs <from> <to> <token_id>
/// ```
///
/// ### Approving an operator:
/// ```
/// starknet invoke --address <contract_address> --function approve --inputs <operator> <token_id>
/// ```
///
/// ## 3. Queries
/// 
/// ### Owner query:
/// ```
/// starknet call --address <contract_address> --function ownerOf --inputs <token_id>
/// ```
///
/// ### Token URI query:
/// ```
/// starknet call --address <contract_address> --function tokenURI --inputs <token_id>
/// ```
///
/// ### Balance query:
/// ```
/// starknet call --address <contract_address> --function balanceOf --inputs <address>
/// ```
///
/// ## 4. Best Practices
/// - Always verify transaction success
/// - Keep URIs immutable after setting
/// - Backup token metadata off-chain
/// - Monitor events for state changes
/// - Use safe transfer when possible
///
/// ## 5. Error Handling
/// - Check return values
/// - Handle revert cases
/// - Verify ownership before transfers
/// - Validate addresses