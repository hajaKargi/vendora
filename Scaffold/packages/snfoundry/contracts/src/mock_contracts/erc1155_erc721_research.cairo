// SPDX-License-Identifier: MIT
/// Combined ERC721 and ERC1155 Contract in Cairo 2.0
/// @notice Research purpose, not meant for use

#[starknet::contract]
pub mod ERC1155_ERC721_Combined_token {
    use core::num::traits::Zero;
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use openzeppelin_token::erc721::interface;
    use openzeppelin_token::erc721::interface::{
        IERC721ReceiverDispatcher, IERC721ReceiverDispatcherTrait,
    };
    use openzeppelin_token::erc1155::interface::{
        IERC1155ReceiverDispatcher, IERC1155ReceiverDispatcherTrait,
    };
    use contracts::interface::erc1155;
    use openzeppelin_account::interface::ISRC6_ID;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_introspection::interface::{ISRC5Dispatcher, ISRC5DispatcherTrait};
    use openzeppelin_token::erc1155::interface::{IERC1155Dispatcher, IERC1155DispatcherTrait};
    use openzeppelin_token::erc721::interface::{IERC721Dispatcher, IERC721DispatcherTrait};

    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    impl SRC5InternalImpl = SRC5Component::InternalImpl<ContractState>;

    #[storage]
    pub struct Storage {
        /// ERC721 Storage
        pub ERC721_name: ByteArray,
        pub ERC721_symbol: ByteArray,
        pub ERC721_owners: Map<u256, ContractAddress>,
        pub ERC721_balances: Map<ContractAddress, u256>,
        pub ERC721_token_approvals: Map<u256, ContractAddress>,
        pub ERC721_operator_approvals: Map<(ContractAddress, ContractAddress), bool>,
        pub ERC721_base_uri: ByteArray,
        /// ERC1155 Storage
        pub ERC1155_balances: Map<(u256, ContractAddress), u256>,
        pub ERC1155_operator_approvals: Map<(ContractAddress, ContractAddress), bool>,
        pub ERC1155_uri: ByteArray,
        // 1 == ERC1155, 2 == ERC721
        pub token_types: Map<u256, u16>,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        // ERC721 Events
        Transfer: Transfer,
        Approval: Approval,
        ApprovalForAll: ApprovalForAll,
        // ERC1155 Events
        TransferSingle: TransferSingle,
        TransferBatch: TransferBatch,
        URI: URI,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    // ERC721 Events
    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct Transfer {
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
        #[key]
        pub token_id: u256,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct Approval {
        #[key]
        pub owner: ContractAddress,
        #[key]
        pub approved: ContractAddress,
        #[key]
        pub token_id: u256,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct ApprovalForAll {
        #[key]
        pub owner: ContractAddress,
        #[key]
        pub operator: ContractAddress,
        pub approved: bool,
    }

    // ERC1155 Events
    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct TransferSingle {
        #[key]
        pub operator: ContractAddress,
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub id: u256,
        pub value: u256,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct TransferBatch {
        #[key]
        pub operator: ContractAddress,
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub ids: Span<u256>,
        pub values: Span<u256>,
    }

    #[derive(Drop, PartialEq, starknet::Event)]
    pub struct URI {
        pub value: ByteArray,
        #[key]
        pub id: u256,
    }

    pub mod Errors {
        pub const UNAUTHORIZED: felt252 = 'ERC1155: unauthorized operator';
        pub const SELF_APPROVAL: felt252 = 'ERC1155: self approval';
        pub const INVALID_RECEIVER: felt252 = 'ERC1155: invalid receiver';
        pub const INVALID_SENDER: felt252 = 'ERC1155: invalid sender';
        pub const INVALID_ARRAY_LENGTH: felt252 = 'ERC1155: no equal array length';
        pub const INSUFFICIENT_BALANCE: felt252 = 'ERC1155: insufficient balance';
        pub const SAFE_TRANSFER_FAILED: felt252 = 'ERC1155: safe transfer failed';

        pub const INVALID_ACCOUNT: felt252 = 'ERC721: invalid account';
        pub const INVALID_OPERATOR: felt252 = 'ERC721: invalid operator';
        pub const INVALID_TOKEN_ID: felt252 = 'ERC721: invalid token ID';
        pub const ALREADY_MINTED: felt252 = 'ERC721: token already minted';
        pub const SAFE_MINT_FAILED: felt252 = 'ERC721: safe mint failed';
        pub const INVALID_TOKEN_TYPE: felt252 = 'Invalid token type';
    }

    #[abi(per_item)]
    #[generate_trait]
    impl CombinedTokenImpl of CombinedTokenTrait {
        /// @notice Returns token type
        #[external(v0)]
        fn get_token_type(self: @ContractState, token_id: u256) -> u16 {
            self.token_types.read(token_id)
        }

        /// @notice returns balance of a token for both ERC1155 and ERC721
        #[external(v0)]
        fn balance_of(self: @ContractState, account: ContractAddress, token_id: u256) -> u256 {
            let token_type = self.token_types.read(token_id);
            if token_type == 1155 {
                self.ERC1155_balances.read((token_id, account))
            } else {
                self.ERC721_balances.read(account)
            }
        }

        /// @notice returns balance of batch for erc1155 tokens
        #[external(v0)]
        fn balance_of_batch(
            self: @ContractState, accounts: Span<ContractAddress>, token_ids: Span<u256>,
        ) -> Span<u256> {
            assert(accounts.len() == token_ids.len(), Errors::INVALID_ARRAY_LENGTH);

            let mut batch_balances = array![];
            let mut index = 0;
            loop {
                if index == token_ids.len() {
                    break;
                }
                batch_balances
                    .append(Self::balance_of(self, *accounts.at(index), *token_ids.at(index)));
                index += 1;
            };

            batch_balances.span()
        }

        /// Change or reaffirm the approved address for an ERC721NFT.
        ///
        /// Requirements:
        ///
        /// - The caller is either an approved operator or the `token_id` owner.
        /// - `token_id` exists.
        ///
        /// Emits an `Approval` event.
        #[external(v0)]
        fn approve(ref self: ContractState, to: ContractAddress, token_id: u256) {
            self._approve(to, token_id, get_caller_address());
        }


        /// @notice Returns owner of ERC721 token
        #[external(v0)]
        fn owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            let owner = self.ERC721_owners.read(token_id);
            assert(owner.is_non_zero(), Errors::INVALID_TOKEN_ID);
            owner
        }

        /// Transfers ownership of `value` amount of `token_id` from `from` if `to` is either an
        /// account or `IERC1155Receiver`.
        ///
        /// `data` is additional data, it has no specified format and it is passed to `to`.
        ///
        /// WARNING: This function can potentially allow a reentrancy attack when transferring
        /// tokens to an untrusted contract, when invoking `on_ERC1155_received` on the receiver.
        /// Ensure to follow the checks-effects-interactions pattern and consider employing
        /// reentrancy guards when interacting with untrusted contracts.
        ///
        /// Requirements:
        ///
        /// - Caller is either approved or the `token_id` owner.
        /// - `from` is not the zero address.
        /// - `to` is not the zero address.
        /// - If `to` refers to a non-account contract, it must implement
        /// `IERC1155Receiver::on_ERC1155_received`
        ///   and return the required magic value.
        ///
        /// Emits a `TransferSingle` event for ERC1155 and `Transfer` event for ERC721
        #[external(v0)]
        fn safe_transfer_from(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_id: u256,
            value: u256,
            data: Span<felt252>,
        ) {
            let token_type = self.token_types.read(token_id);

            if token_type == 1155 {
                // ERC1155 transfer (supports batch transfers)
                let token_ids = array![token_id].span();
                let values = array![value].span();
                Self::safe_batch_transfer_from(ref self, from, to, token_ids, values, data);
            } else if token_type == 721 {
                // ERC721 transfer (single transfer, ignores `value`)
                Self::transfer_from(ref self, from, to, token_id);
                assert(
                    _check_on_erc721_received(from, to, token_id, data),
                    Errors::SAFE_TRANSFER_FAILED,
                );
            } else {
                panic!("Unknown token type");
            }
        }

        /// Requirements:
        ///
        /// - Caller is either approved or the `token_id` owner.
        /// - `from` is not the zero address.
        /// - `to` is not the zero address.
        /// - `token_ids` and `values` must have the same length.
        /// - If `to` refers to a non-account contract, it must implement
        /// `IERC1155Receiver::on_ERC1155_batch_received`
        ///   and return the acceptance magic value.
        ///
        /// Emits either a `TransferSingle` or a `TransferBatch` event, depending on the length of
        /// the array arguments.
        #[external(v0)]
        fn safe_batch_transfer_from(
            ref self: ContractState,
            from: starknet::ContractAddress,
            to: starknet::ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
            data: Span<felt252>,
        ) {
            assert(from.is_non_zero(), Errors::INVALID_SENDER);
            assert(to.is_non_zero(), Errors::INVALID_RECEIVER);

            let operator = get_caller_address();
            if from != operator {
                assert(Self::is_approved_for_all(@self, from, operator), Errors::UNAUTHORIZED);
            }

            self.update_with_acceptance_check(from, to, token_ids, values, data);
        }

        /// - Caller is either approved or the `token_id` owner.
        /// - `to` is not the zero address.
        /// - `from` is not the zero address.
        /// - `token_id` exists.
        ///
        /// Emits a `Transfer` event.
        #[external(v0)]
        fn transfer_from(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256,
        ) {
            assert(!to.is_zero(), Errors::INVALID_RECEIVER);

            // Setting an "auth" arguments enables the `_is_authorized` check which verifies that
            // the token exists (from != 0). Therefore, it is not needed to verify that the return
            // value is not 0 here.
            let previous_owner = self.update_erc721(to, token_id, get_caller_address());

            assert(from == previous_owner, Errors::INVALID_SENDER);
        }

        /// Returns the address approved for `token_id`.
        ///
        /// Requirements:
        ///
        /// - `token_id` exists.
        #[external(v0)]
        fn get_approved(self: @ContractState, token_id: u256) -> ContractAddress {
            self._require_owned(token_id);
            self.ERC721_token_approvals.read(token_id)
        }

        /// Queries if `operator` is an authorized operator for `owner`.
        #[external(v0)]
        fn is_approved_for_all(
            self: @ContractState, owner: ContractAddress, operator: ContractAddress,
        ) -> bool {
            self.ERC1155_operator_approvals.read((owner, operator))
        }

        /// Enables or disables approval for `operator` to manage all of the
        /// callers assets.
        ///
        /// Requirements:
        /// 
        /// - `token_type` must be 1 for erc1155 token or 2 for erc721
        ///
        /// - `operator` cannot be the caller.
        ///
        /// Emits an `ApprovalForAll` event.
        #[external(v0)]
        fn set_approval_for_all(
            ref self: ContractState,
            owner: ContractAddress,
            operator: ContractAddress,
            approved: bool,
            token_type: u16,
        ) {
            assert(token_type == 1155 || token_type == 721, Errors::INVALID_TOKEN_TYPE);
            if token_type == 1155 {
                let owner = get_caller_address();
                assert(owner != operator, Errors::SELF_APPROVAL);

                self.ERC1155_operator_approvals.write((owner, operator), approved);
                self.emit(ApprovalForAll { owner, operator, approved });
            }
            if token_type == 721 {
                assert(!operator.is_zero(), Errors::INVALID_OPERATOR);
                self.ERC721_operator_approvals.write((owner, operator), approved);
                self.emit(ApprovalForAll { owner, operator, approved });
            }
        }
    }

    #[abi(per_item)]
    #[generate_trait]
    pub impl TokenMetadataImpl of TokenMetadataTrait {
        /// Returns the NFT name.
        #[external(v0)]
        fn name(self: @ContractState) -> ByteArray {
            self.ERC721_name.read()
        }

        /// Returns the NFT symbol.
        #[external(v0)]
        fn symbol(self: @ContractState) -> ByteArray {
            self.ERC721_symbol.read()
        }

        /// Returns the Uniform Resource Identifier (URI) for the `token_id` token.
        /// If the URI is not set, the return value will be an empty ByteArray.
        ///
        /// Requirements:
        ///
        /// - `token_id` exists.
        #[external(v0)]
        fn token_uri(self: @ContractState, token_id: u256) -> ByteArray {
            self._require_owned(token_id);
            let base_uri = self._base_uri();
            if base_uri.len() == 0 {
                return "";
            } else {
                return format!("{}{}", base_uri, token_id);
            }
        }

        /// This implementation returns the same URI for *all* token types. It relies
        /// on the token type ID substitution mechanism defined in the EIP:
        /// https://eips.ethereum.org/EIPS/eip-1155#metadata.
        ///
        /// Clients calling this function must replace the `\{id\}` substring with the
        /// actual token type ID.
        #[external(v0)]
        fn uri(self: @ContractState, token_id: u256) -> ByteArray {
            self.ERC1155_uri.read()
        }
    }

    #[generate_trait]
    pub impl InternalImpl of InternalTrait {
        /// Initializes the contract by setting the token name, symbol, and base URI.
        /// This should only be used inside the contract's constructor.
        /// @notice One can pass args based on the needed token, empty string `""` can be passed for
        /// params @notice token_type can only be 1155 or 721, pass 0 to initialize both
        /// ERC1155 and ERC721 tokens @param token_type Determines the token to initialize, 1
        /// initializes ERC1155 token, 2 initializes ERC721 token, 0 initializes both.
        fn initializer(
            ref self: ContractState,
            name: ByteArray,
            symbol: ByteArray,
            erc721_base_uri: ByteArray,
            erc1155_base_uri: ByteArray,
            token_type: u16,
        ) {
            // Validate token_type
            assert(
                token_type == 0 || token_type == 1155 || token_type == 721, Errors::INVALID_TOKEN_TYPE,
            ); // token_type can only be 0, 1155, or 721

            // Initialize ERC1155 if token_type is 0 or 1155
            if token_type == 0 || token_type == 1155 {
                self._set_erc1155_base_uri(erc1155_base_uri);
                self.src5.register_interface(erc1155::IERC1155_ID);
                self.src5.register_interface(erc1155::IERC1155_METADATA_URI_ID);
            }

            // Initialize ERC721 if token_type is 0 or 721
            if token_type == 0 || token_type == 721 {
                self.ERC721_name.write(name);
                self.ERC721_symbol.write(symbol);
                self._set_erc721_base_uri(erc721_base_uri);
                self.src5.register_interface(interface::IERC721_ID);
                self.src5.register_interface(interface::IERC721_METADATA_ID);
            }
        }

        /// Transfers `token_id` from `from` to `to`.
        ///
        /// Internal function without access restriction.
        ///
        /// WARNING: This method may lead to the loss of tokens if `to` is not aware of the ERC721
        /// protocol.
        ///
        /// Requirements:
        ///
        /// - `to` is not the zero address.
        /// - `from` is the token owner.
        /// - `token_id` exists.
        ///
        /// Emits a `Transfer` event.
        fn transfer(
            ref self: ContractState, from: ContractAddress, to: ContractAddress, token_id: u256,
        ) {
            assert(!to.is_zero(), Errors::INVALID_RECEIVER);

            let previous_owner = self.update_erc721(to, token_id, Zero::zero());

            assert(!previous_owner.is_zero(), Errors::INVALID_TOKEN_ID);
            assert(from == previous_owner, Errors::INVALID_SENDER);
        }

        /// Transfers ownership of `token_id` from `from` if `to` is either an account or
        /// `IERC721Receiver`.
        ///
        /// `data` is additional data, it has no specified format and it is sent in call to `to`.
        ///
        /// WARNING: This method makes an external call to the recipient contract, which can lead to
        /// reentrancy vulnerabilities.
        ///
        /// Requirements:
        ///
        /// - `to` cannot be the zero address.
        /// - `from` must be the token owner.
        /// - `token_id` exists.
        /// - `to` is either an account contract or supports the `IERC721Receiver` interface.
        ///
        /// Emits a `Transfer` event.
        fn safe_transfer(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_id: u256,
            data: Span<felt252>,
        ) {
            self.transfer(from, to, token_id);
            assert(
                _check_on_erc721_received(from, to, token_id, data), Errors::SAFE_TRANSFER_FAILED,
            );
        }

        /// Returns whether `token_id` exists.
        fn exists(self: @ContractState, token_id: u256) -> bool {
            !self._owner_of(token_id).is_zero()
        }

        fn _approve(
            ref self: ContractState, to: ContractAddress, token_id: u256, auth: ContractAddress,
        ) {
            self._approve_with_optional_event(to, token_id, auth, true);
        }

        /// ERC721 only
        /// Mints `token_id` and transfers it to `to`.
        /// Internal function without access restriction.
        ///
        /// WARNING: This method may lead to the loss of tokens if `to` is not aware of the ERC721
        /// protocol.
        ///
        /// Requirements:
        ///
        /// - `to` is not the zero address.
        /// - `token_id` does not exist.
        ///
        /// Emits a `Transfer` event.
        fn mint(ref self: ContractState, to: ContractAddress, token_id: u256) {
            assert(!to.is_zero(), Errors::INVALID_RECEIVER);

            let previous_owner = self.update_erc721(to, token_id, Zero::zero());
            self.token_types.write(token_id, 721);
            assert(previous_owner.is_zero(), Errors::ALREADY_MINTED);
        }

        /// ERC721 only
        /// Mints `token_id` if `to` is either an account or `IERC721Receiver`.
        ///
        /// `data` is additional data, it has no specified format and it is sent in call to `to`.
        ///
        /// WARNING: This method makes an external call to the recipient contract, which can lead to
        /// reentrancy vulnerabilities.
        ///
        /// Requirements:
        ///
        /// - `token_id` does not exist.
        /// - `to` is either an account contract or supports the `IERC721Receiver` interface.
        ///
        /// Emits a `Transfer` event.
        fn safe_mint(
            ref self: ContractState, to: ContractAddress, token_id: u256, data: Span<felt252>,
        ) {
            self.mint(to, token_id);
            self.token_types.write(token_id, 721);

            assert(
                _check_on_erc721_received(Zero::zero(), to, token_id, data),
                Errors::SAFE_MINT_FAILED,
            );
        }

        /// ERC1155 only
        /// Creates a `value` amount of tokens of type `token_id`, and assigns them to `to`.
        ///
        /// Requirements:
        ///
        /// - `to` cannot be the zero address.
        /// - If `to` refers to a smart contract, it must implement
        /// `IERC1155Receiver::on_ERC1155_received`
        /// and return the acceptance magic value.
        ///
        /// Emits a `TransferSingle` event.
        fn mint_with_acceptance_check(
            ref self: ContractState,
            to: ContractAddress,
            token_id: u256,
            value: u256,
            data: Span<felt252>,
        ) {
            assert(to.is_non_zero(), Errors::INVALID_RECEIVER);

            let token_ids = array![token_id].span();
            let values = array![value].span();
            self.update_with_acceptance_check(Zero::zero(), to, token_ids, values, data);
            self.token_types.write(token_id, 1155);
        }

        /// Batched version of `mint_with_acceptance_check`.
        ///
        /// Requirements:
        ///
        /// - `to` cannot be the zero address.
        /// - `token_ids` and `values` must have the same length.
        /// - If `to` refers to a smart contract, it must implement
        /// `IERC1155Receiver::on_ERC1155_batch_received`
        /// and return the acceptance magic value.
        ///
        /// Emits a `TransferBatch` event.
        fn batch_mint_with_acceptance_check(
            ref self: ContractState,
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
            data: Span<felt252>,
        ) {
            assert(to.is_non_zero(), Errors::INVALID_RECEIVER);
            self.update_with_acceptance_check(Zero::zero(), to, token_ids, values, data);

            let mut index = 0;
            loop {
                if index == token_ids.len() { break; }
                let token_id = *token_ids.at(index);
                self.token_types.write(token_id, 1155);
                index += 1;
            }
        }

        /// Destroys a `value` amount of tokens of type `token_id` from `from`.
        ///
        /// Requirements:
        ///
        /// - `from` cannot be the zero address.
        /// - `from` must have at least `value` amount of tokens of type `token_id`.
        ///
        /// Emits a `TransferSingle` event.
        fn burn(
            ref self: ContractState,
            from: ContractAddress,
            token_id: u256,
            value: u256,
        ) {
            let token_type = self.token_types.read(token_id);
            // burn ERC1155
            if token_type == 1155 {
                assert(from.is_non_zero(), Errors::INVALID_SENDER);
                let token_ids = array![token_id].span();
                let values = array![value].span();
                self.update_erc1155(from, Zero::zero(), token_ids, values);
            }
            // burn ERC721
            if token_type == 721 {
                let previous_owner = self.update_erc721(Zero::zero(), token_id, Zero::zero());
                assert(!previous_owner.is_zero(), Errors::INVALID_TOKEN_ID);
            }
        }

        /// Batched version of `burn`.
        ///
        /// Requirements:
        ///
        /// - `from` cannot be the zero address.
        /// - `from` must have at least `value` amount of tokens of type `token_id`.
        /// - `token_ids` and `values` must have the same length.
        ///
        /// Emits a `TransferBatch` event.
        fn batch_burn(
            ref self: ContractState,
            from: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            assert(from.is_non_zero(), Errors::INVALID_SENDER);
            self.update_erc1155(from, Zero::zero(), token_ids, values);
        }


        /// Version of `update` that performs the token acceptance check by calling
        /// `IERC1155Receiver::onERC1155Received` or `IERC1155Receiver::onERC1155BatchReceived` if
        /// the receiver is not recognized as an account.
        ///
        /// Requirements:
        ///
        /// - `to` is either an account contract or supports the `IERC1155Receiver` interface.
        /// - `token_ids` and `values` must have the same length.
        ///
        /// Emits a `TransferSingle` event if the arrays contain one element, and `TransferBatch`
        /// otherwise.
        fn update_with_acceptance_check(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
            data: Span<felt252>,
        ) {
            self.update_erc1155(from, to, token_ids, values);
            let accepted = if token_ids.len() == 1 {
                _check_on_ERC1155_received(from, to, *token_ids.at(0), *values.at(0), data)
            } else {
                _check_on_ERC1155_batch_received(from, to, token_ids, values, data)
            };
            assert(accepted, Errors::SAFE_TRANSFER_FAILED);
        }


        /// Transfers a `value` amount of tokens of type `id` from `from` to `to`.
        /// Will mint (or burn) if `from` (or `to`) is the zero address.
        ///
        /// Requirements:
        ///
        /// - `token_ids` and `values` must have the same length.
        ///
        /// Emits a `TransferSingle` event if the arrays contain one element, and `TransferBatch`
        /// otherwise.
        ///
        /// NOTE: This function can be extended using the `ERC1155HooksTrait`, to add
        /// functionality before and/or after the transfer, mint, or burn.
        ///
        /// NOTE: The ERC1155 acceptance check is not performed in this function.
        /// See `update_with_acceptance_check` instead.
        fn update_erc1155(
            ref self: ContractState,
            from: ContractAddress,
            to: ContractAddress,
            token_ids: Span<u256>,
            values: Span<u256>,
        ) {
            assert(token_ids.len() == values.len(), Errors::INVALID_ARRAY_LENGTH);

            let mut index = 0;
            loop {
                if index == token_ids.len() {
                    break;
                }
                let token_id = *token_ids.at(index);
                let value = *values.at(index);
                if from.is_non_zero() {
                    let from_balance = self.ERC1155_balances.read((token_id, from));
                    assert(from_balance >= value, Errors::INSUFFICIENT_BALANCE);
                    self.ERC1155_balances.write((token_id, from), from_balance - value);
                }
                if to.is_non_zero() {
                    let to_balance = self.ERC1155_balances.read((token_id, to));
                    self.ERC1155_balances.write((token_id, to), to_balance + value);
                }
                index += 1;
            };
            let operator = get_caller_address();
            if token_ids.len() == 1 {
                self
                    .emit(
                        TransferSingle {
                            operator, from, to, id: *token_ids.at(0), value: *values.at(0),
                        },
                    );
            } else {
                self.emit(TransferBatch { operator, from, to, ids: token_ids, values });
            }
        }

        fn update_erc721(
            ref self: ContractState, to: ContractAddress, token_id: u256, auth: ContractAddress,
        ) -> ContractAddress {
            let from = self._owner_of(token_id);

            // Perform (optional) operator check
            if !auth.is_zero() {
                self._check_authorized(from, auth, token_id);
            }
            if !from.is_zero() {
                let zero_address = Zero::zero();
                self._approve_with_optional_event(zero_address, token_id, zero_address, false);

                self.ERC721_balances.write(from, self.ERC721_balances.read(from) - 1);
            }
            if !to.is_zero() {
                self.ERC721_balances.write(to, self.ERC721_balances.read(to) + 1);
            }

            self.ERC721_owners.write(token_id, to);
            self.emit(Transfer { from, to, token_id });

            from
        }

        /// Returns the owner address of `token_id`.
        fn _owner_of(self: @ContractState, token_id: u256) -> ContractAddress {
            self.ERC721_owners.read(token_id)
        }

        /// Variant of `_approve` with an optional flag to enable or disable the `Approval` event.
        /// The event is not emitted in the context of transfers.
        ///
        /// WARNING: If `auth` is zero and `emit_event` is false, this function will not check that
        /// the token exists.
        ///
        /// Requirements:
        ///
        /// - If `auth` is non-zero, it must be either the owner of the token or approved to
        /// operate on all of its tokens.
        ///
        /// May emit an `Approval` event.
        fn _approve_with_optional_event(
            ref self: ContractState,
            to: ContractAddress,
            token_id: u256,
            auth: ContractAddress,
            emit_event: bool,
        ) {
            if emit_event || !auth.is_zero() {
                let owner = self._require_owned(token_id);

                if !auth.is_zero() && owner != auth {
                    let is_approved_for_all = CombinedTokenImpl::is_approved_for_all(
                        @self, owner, auth,
                    );
                    assert(is_approved_for_all, Errors::UNAUTHORIZED);
                }

                if emit_event {
                    self.emit(Approval { owner, approved: to, token_id });
                }
            }

            self.ERC721_token_approvals.write(token_id, to);
        }

        /// Returns the owner address of `token_id`.
        ///
        /// Requirements:
        ///
        /// - `token_id` exists.
        fn _require_owned(self: @ContractState, token_id: u256) -> ContractAddress {
            let owner = self._owner_of(token_id);
            assert(!owner.is_zero(), Errors::INVALID_TOKEN_ID);
            owner
        }

        /// Sets the erc721 base URI.
        fn _set_erc721_base_uri(ref self: ContractState, base_uri: ByteArray) {
            self.ERC721_base_uri.write(base_uri);
        }

        /// Sets a new URI for all token types, by relying on the token type ID
        /// substitution mechanism defined in the ERC1155 standard.
        /// See https://eips.ethereum.org/EIPS/eip-1155#metadata.
        ///
        /// By this mechanism, any occurrence of the `\{id\}` substring in either the
        /// URI or any of the values in the JSON file at said URI will be replaced by
        /// clients with the token type ID.
        ///
        /// For example, the `https://token-cdn-domain/\{id\}.json` URI would be
        /// interpreted by clients as
        /// `https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json`
        /// for token type ID 0x4cce0.
        ///
        /// Because these URIs cannot be meaningfully represented by the `URI` event,
        /// this function emits no events.
        fn _set_erc1155_base_uri(ref self: ContractState, base_uri: ByteArray) {
            self.ERC1155_uri.write(base_uri);
        }

        /// Base URI for computing `token_uri`.
        ///
        /// If set, the resulting URI for each token will be the concatenation of the base URI and
        /// the token ID.
        /// Returns an empty `ByteArray` if not set.
        fn _base_uri(self: @ContractState) -> ByteArray {
            self.ERC721_base_uri.read()
        }


        /// Returns whether `spender` is allowed to manage `owner`'s tokens, or `token_id` in
        /// particular (ignoring whether it is owned by `owner`).
        ///
        /// WARNING: This function assumes that `owner` is the actual owner of `token_id` and does
        /// not verify this assumption.
        fn _is_authorized(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress, token_id: u256,
        ) -> bool {
            let is_approved_for_all = CombinedTokenImpl::is_approved_for_all(self, owner, spender);

            !spender.is_zero()
                && (owner == spender
                    || is_approved_for_all
                    || spender == CombinedTokenImpl::get_approved(self, token_id))
        }

        /// Checks if `spender` can operate on `token_id`, assuming the provided `owner` is the
        /// actual owner.
        ///
        /// Requirements:
        ///
        /// - `owner` cannot be the zero address.
        /// - `spender` cannot be the zero address.
        /// - `spender` must be the owner of `token_id` or be approved to operate on it.
        ///
        /// WARNING: This function assumes that `owner` is the actual owner of `token_id` and does
        /// not verify this assumption.
        fn _check_authorized(
            ref self: ContractState,
            owner: ContractAddress,
            spender: ContractAddress,
            token_id: u256,
        ) {
            // Non-existent token
            assert(!owner.is_zero(), Errors::INVALID_TOKEN_ID);
            assert(self._is_authorized(owner, spender, token_id), Errors::UNAUTHORIZED);
        }
    }

    ///////////////////  END OF INTERNAL IMPL   ///////////////////////

    /// Checks if `to` either is an account contract or has registered support
    /// for the `IERC721Receiver` interface through SRC5.
    fn _check_on_erc721_received(
        from: ContractAddress, to: ContractAddress, token_id: u256, data: Span<felt252>,
    ) -> bool {
        let src5_dispatcher = ISRC5Dispatcher { contract_address: to };

        if src5_dispatcher.supports_interface(interface::IERC721_RECEIVER_ID) {
            IERC721ReceiverDispatcher { contract_address: to }
                .on_erc721_received(
                    get_caller_address(), from, token_id, data,
                ) == interface::IERC721_RECEIVER_ID
        } else {
            src5_dispatcher.supports_interface(openzeppelin_account::interface::ISRC6_ID)
        }
    }

    /// Checks if `to` accepts the token by implementing `IERC1155Receiver`
    /// or if it's an account contract (supporting ISRC6).
    fn _check_on_ERC1155_received(
        from: ContractAddress,
        to: ContractAddress,
        token_id: u256,
        value: u256,
        data: Span<felt252>,
    ) -> bool {
        let src5_dispatcher = ISRC5Dispatcher { contract_address: to };

        if src5_dispatcher.supports_interface(erc1155::IERC1155_RECEIVER_ID) {
            IERC1155ReceiverDispatcher { contract_address: to }
                .on_erc1155_received(
                    get_caller_address(), from, token_id, value, data,
                ) == erc1155::IERC1155_RECEIVER_ID
        } else {
            src5_dispatcher.supports_interface(ISRC6_ID)
        }
    }

    /// Checks if `to` accepts the token by implementing `IERC1155Receiver`
    /// or if it's an account contract (supporting ISRC6).
    fn _check_on_ERC1155_batch_received(
        from: ContractAddress,
        to: ContractAddress,
        token_ids: Span<u256>,
        values: Span<u256>,
        data: Span<felt252>,
    ) -> bool {
        let src5_dispatcher = ISRC5Dispatcher { contract_address: to };

        if src5_dispatcher.supports_interface(erc1155::IERC1155_RECEIVER_ID) {
            IERC1155ReceiverDispatcher { contract_address: to }
                .on_erc1155_batch_received(
                    get_caller_address(), from, token_ids, values, data,
                ) == erc1155::IERC1155_RECEIVER_ID
        } else {
            src5_dispatcher.supports_interface(ISRC6_ID)
        }
    }
}

