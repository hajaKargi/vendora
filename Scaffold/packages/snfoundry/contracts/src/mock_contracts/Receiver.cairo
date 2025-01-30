//! # ERC721 Receiver Contract
//! 
//! This contract implements the receiver interface for ERC721 tokens,
//! allowing it to safely receive NFTs through safe transfer methods.
//!
//! ## Main Features:
//! - ERC721 token receiving capability
//! - SRC5 interface support
//! - Customizable token acceptance logic
//!
//! ## Components Used:
//! - ERC721Receiver: Token receiving functionality
//! - SRC5: Interface detection standard
//!
//! ## Security Considerations:
//! - Validates incoming token transfers
//! - Implements standard receiver interface
//! - Provides custom acceptance logic

#[starknet::contract]
pub mod Receiver {
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::ERC721ReceiverComponent;
    use starknet::ContractAddress;

    /// ERC721 Receiver component for handling incoming tokens
    component!(path: ERC721ReceiverComponent, storage: erc721_receiver, event: ERC721ReceiverEvent);
    /// SRC5 component for interface detection
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    // Component Implementation
    /// Implementation of ERC721 Receiver functionality
    impl ERC721ReceiverImpl = ERC721ReceiverComponent::ERC721ReceiverImpl<ContractState>;
    /// Internal implementation of receiver logic
    impl ERC721ReceiverInternalImpl = ERC721ReceiverComponent::InternalImpl<ContractState>;

    /// SRC5 interface implementation
    #[abi(embed_v0)]
    impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;

    /// Contract storage structure
    #[storage]
    struct Storage {
        /// ERC721 receiver component storage
        #[substorage(v0)]
        erc721_receiver: ERC721ReceiverComponent::Storage,
        /// SRC5 component storage for interface detection
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    /// Events emitted by the contract
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        /// Events from ERC721 receiver operations
        #[flat]
        ERC721ReceiverEvent: ERC721ReceiverComponent::Event,
        /// Events from SRC5 operations
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    /// Contract constructor
    /// Initializes the receiver functionality
    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc721_receiver.initializer();
    }

    /// External interface implementation
    #[abi(per_item)]
    #[generate_trait]
    impl ExternalImpl of ExternalTrait {
        /// Handles the reception of an ERC721 token
        /// * `operator` - Address performing the transfer
        /// * `from` - Address of the previous token owner
        /// * `token_id` - ID of the token being transferred
        /// * `data` - Additional data with the transfer
        /// # Returns
        /// * `felt252` - Magic value indicating successful reception
        /// # Security
        /// * Validates transfer data
        /// * Only accepts tokens with valid data
        #[external(v0)]
        fn on_erc721_received(
            self: @ContractState,
            operator: ContractAddress,
            from: ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) -> felt252 {
            if *data.at(0) == 'SUCCESS' {
                self.erc721_receiver.on_erc721_received(operator, from, token_id, data)
            } else {
                0
            }
        }
    }
}

/// # Usage Guide
/// 
/// ## 1. Contract Deployment
/// ```
/// starknet deploy --contract Receiver.cairo
/// ```
///
/// ## 2. Receiving Tokens
/// The contract will automatically handle incoming safe transfers.
/// Tokens will only be accepted if they come with the 'SUCCESS' data parameter.
///
/// ## 3. Interface Support
/// You can check if the contract supports specific interfaces using the SRC5 methods:
/// ```
/// starknet call --address <contract_address> --function supports_interface --inputs <interface_id>
/// ```
///
/// ## Best Practices
/// - Always use safe transfer methods when sending tokens to this contract
/// - Verify the return value when transferring tokens
/// - Include proper data parameter ('SUCCESS') for acceptance
