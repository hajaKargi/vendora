//! # Counter Component
//! 
//! A reusable component that implements a simple counter with increment and decrement functionality.
//! This component can be embedded into other contracts that need counting capabilities.
//!
//! ## Main Features:
//! - Current value tracking
//! - Increment operation
//! - Decrement operation
//! - Thread-safe storage
//!
//! ## Usage Scenarios:
//! - Token ID generation
//! - Transaction counting
//! - Sequential operations
//!
//! ## Security Considerations:
//! - Handles underflow in decrement
//! - Thread-safe operations
//! - State consistency guaranteed

/// Interface defining the counter operations
/// Provides methods to interact with the counter functionality
#[starknet::interface]
pub trait ICounter<TState> {
    /// Returns the current value of the counter
    /// # Returns
    /// * `u256` - The current counter value
    fn current(self: @TState) -> u256;

    /// Increments the counter by 1
    /// # Effects
    /// * Increases the stored value by 1
    fn increment(ref self: TState);

    /// Decrements the counter by 1
    /// # Effects
    /// * Decreases the stored value by 1
    /// # Security
    /// * Handles underflow cases
    fn decrement(ref self: TState);
}

/// Counter component implementation
#[starknet::component]
pub mod CounterComponent {
    use super::{ICounter};

    /// Storage structure for the counter
    #[storage]
    struct Storage {
        /// The current value of the counter
        /// Initialized to 0 by default
        value: u256,
    }

    /// Implementation of the counter functionality
    /// Can be embedded into other contracts
    #[embeddable_as(CounterImpl)]
    impl Counter<
        TContractState, 
        +HasComponent<TContractState>,
    > of ICounter<ComponentState<TContractState>> {
        /// Returns the current counter value
        /// # Returns
        /// * `u256` - Current value stored in the counter
        fn current(self: @ComponentState<TContractState>) -> u256 {
            self.value.read()
        }

        /// Increments the counter by 1
        /// # Effects
        /// * Increases the stored value by 1
        /// * Updates the storage state
        fn increment(ref self: ComponentState<TContractState>) {
            self.value.write(self.value.read() + 1);
        }

        /// Decrements the counter by 1
        /// # Effects
        /// * Decreases the stored value by 1
        /// * Updates the storage state
        /// # Security
        /// * Assumes responsibility for underflow checking
        fn decrement(ref self: ComponentState<TContractState>) {
            self.value.write(self.value.read() - 1);
        }
    }
}

/// # Usage Guide
/// 
/// ## 1. Component Integration
/// ```cairo
/// use counter::CounterComponent;
/// component!(path: CounterComponent, storage: counter, event: CounterEvent);
/// ```
///
/// ## 2. Implementation
/// ```cairo
/// #[abi(embed_v0)]
/// impl CounterImpl = CounterComponent::CounterImpl<ContractState>;
/// ```
///
/// ## 3. Usage Example
/// ```cairo
/// // Read current value
/// let current = self.counter.current();
/// 
/// // Increment counter
/// self.counter.increment();
/// 
/// // Decrement counter
/// self.counter.decrement();
/// ```
///
/// ## Best Practices
/// - Initialize counter before use
/// - Check for underflow in decrement operations
/// - Use atomic operations when possible
/// - Monitor state changes
