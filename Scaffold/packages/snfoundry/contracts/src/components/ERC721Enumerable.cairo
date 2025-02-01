//! # ERC721Enumerable Component
//! 
//! This component extends the ERC721 standard with enumeration capabilities,
//! allowing on-chain enumeration of NFTs and their owners.
//!
//! ## Main Features:
//! - Token enumeration by owner
//! - Total supply tracking
//! - Token index management
//! - Complete token list tracking
//!
//! ## Security Considerations:
//! - Index bounds validation
//! - State consistency maintenance
//! - Gas optimization for large collections
//!
//! ## Integration Requirements:
//! - ERC721 base component
//! - SRC5 interface support
//! - Storage management

use starknet::ContractAddress;

/// Interface for ERC721 enumeration functionality
/// Provides methods to enumerate tokens and query supply
#[starknet::interface]
pub trait IERC721Enumerable<TState> {
    /// Returns a token ID owned by `owner` at a given `index` of its token list
    /// * `owner` - Address of the token owner
    /// * `index` - Index in owner's token list
    /// # Returns
    /// * `u256` - Token ID at the specified index
    /// # Reverts
    /// * When index is out of bounds
    fn token_of_owner_by_index(self: @TState, owner: ContractAddress, index: u256) -> u256;

    /// Returns the total amount of tokens stored by the contract
    /// # Returns
    /// * `u256` - Total number of tokens
    fn total_supply(self: @TState) -> u256;
}

/// ERC721Enumerable component implementation
#[starknet::component]
pub mod ERC721EnumerableComponent {
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::ERC721Component;
    use openzeppelin_token::erc721::interface::IERC721;
    use starknet::storage::Map;
    use super::{ContractAddress, IERC721Enumerable};

    /// Storage structure for enumeration data
    #[storage]
    struct Storage {
        /// Mapping from owner to list of owned token IDs
        /// (owner_address, index) => token_id
        owned_tokens: Map<(ContractAddress, u256), u256>,
        
        /// Mapping from token ID to index of the owner tokens list
        /// token_id => index
        owned_tokens_index: Map<u256, u256>,
        
        /// Array with all token ids
        /// index => token_id
        all_tokens: Map<u256, u256>,
        
        /// Total number of tokens
        all_tokens_length: u256,
        
        /// Mapping from token id to position in the allTokens array
        /// token_id => index
        all_tokens_index: Map<u256, u256>,
    }

    /// Implementation of enumeration functionality
    #[embeddable_as(ERC721EnumerableImpl)]
    impl ERC721Enumerable<
        TContractState,
        +HasComponent<TContractState>,
        impl ERC721: ERC721Component::HasComponent<TContractState>,
        +SRC5Component::HasComponent<TContractState>,
        +ERC721Component::ERC721HooksTrait<TContractState>,
        +Drop<TContractState>,
    > of IERC721Enumerable<ComponentState<TContractState>> {
        /// Returns token ID at given index for owner
        /// * `owner` - Address of token owner
        /// * `index` - Index in owner's token list
        /// # Returns
        /// * `u256` - Token ID at specified index
        /// # Security
        /// * Validates index bounds
        /// * Requires valid owner address
        fn token_of_owner_by_index(
            self: @ComponentState<TContractState>, 
            owner: ContractAddress, 
            index: u256,
        ) -> u256 {
            let erc721_component = get_dep_component!(self, ERC721);
            let balance = erc721_component.balance_of(owner);
            assert(index < balance, 'Owner index out of bounds');
            self.owned_tokens.read((owner, index))
        }

        /// Returns total number of existing tokens
        /// # Returns
        /// * `u256` - Current total supply
        fn total_supply(self: @ComponentState<TContractState>) -> u256 {
            self.all_tokens_length.read()
        }
    }
}

/// # Usage Guide
/// 
/// ## 1. Component Integration
/// ```cairo
/// use erc721_enumerable::ERC721EnumerableComponent;
/// 
/// component!(
///     path: ERC721EnumerableComponent, 
///     storage: enumerable, 
///     event: EnumerableEvent
/// );
/// ```
///
/// ## 2. Implementation
/// ```cairo
/// #[abi(embed_v0)]
/// impl ERC721EnumerableImpl = ERC721EnumerableComponent::ERC721EnumerableImpl<ContractState>;
/// ```
///
/// ## 3. Usage Examples
/// ```cairo
/// // Get total supply
/// let total = self.enumerable.total_supply();
/// 
/// // Get token by owner and index
/// let token_id = self.enumerable.token_of_owner_by_index(owner, 0);
/// ```
///
/// ## Best Practices
/// - Keep track of array lengths
/// - Validate indices before access
/// - Update all mappings atomically
/// - Consider gas costs for large collections
/// - Maintain index consistency
