# ERC721 and ERC1155 Compatibility Research

## Interfaces

### ERC721
ERC721 defines unique interface identifiers that must be present to ensure compatibility with the standard. These identifiers help contracts verify the implementation of ERC721 functionalities.

- **`IERC721_ID`**: Identifies the ERC721 interface.
- **`IERC721_METADATA_ID`**: Identifies the ERC721 metadata extension, which includes `name`, `symbol`, and `tokenURI`.
- **`IERC721_RECEIVER_ID`**: Ensures a contract can safely receive ERC721 tokens, preventing accidental token loss.

### ERC1155
Similar to ERC721, ERC1155 has unique interface identifiers that define its structure and ensure compliance with the standard.

- **`IERC1155_ID`**: Identifies the ERC1155 interface.
- **`IERC1155_METADATA_URI_ID`**: Identifies the metadata extension, using a URI-based metadata structure.
- **`IERC1155_RECEIVER_ID`**: Ensures a contract can safely receive ERC1155 tokens.

## Compatibility Issues

### Interface Differences
Both ERC721 and ERC1155 require unique interface identifiers to ensure compatibility. Any contract aiming to support both must include all necessary identifiers.

### Token Uniqueness
- **ERC721**: Each token has a unique `token_id` and exists as a separate entity.
- **ERC1155**: Multiple tokens can share the same `token_id` but have different balances.
- **Issue**: Applications designed for ERC721 may not function properly with ERC1155 due to their different handling of token uniqueness.

### Token Transfer Methods
- **ERC721**: Uses `safe_transfer_from()`, transferring one token at a time.
- **ERC1155**: Uses both `safe_transfer_from()` and `safe_batch_transfer_from()`, enabling batch transfers.
- **Issue**: Applications built for ERC721 may not support batch transfers, causing compatibility issues with ERC1155.

### Receiving Tokens
- **ERC721**: Uses `on_erc721_received()` for receiving tokens.
- **ERC1155**: Uses `on_erc1155_received()` and `on_erc1155_batch_received()`.
- **Issue**: A contract designed to accept ERC721 tokens will reject ERC1155 tokens and vice versa.

### Metadata URI Differences
- **ERC721**: Uses `token_uri(token_id: u256)`, returning a unique metadata URI for each token.
- **ERC1155**: Uses `uri(u256 token_id)`, returning a templated URI where the `token_id` is dynamically inserted.
  - Example:
    - ERC1155: `"https://uri.com/metadata/{id}.json"`
    - ERC721: `"https://uri.com/metadata/1.json"`
- **Issue**: Systems built for ERC721 may not dynamically insert `token_id` values, causing incompatibility with ERC1155.

### Ownership and Balance Tracking
- **ERC721**: Maps `token_id` to an `owner` address.
- **ERC1155**: Uses a 2D mapping of `owner` and `token_id` to determine balances.
- **Issue**: The different methods for tracking ownership and balances complicate compatibility between the two standards.

### Approval Mechanism
- **ERC721**:
  - `approve()`: Grants approval for a specific token.
  - `set_approval_for_all()`: Grants approval for an operator to manage all user tokens.
- **ERC1155**:
  - Only supports `set_approval_for_all()`, which applies to all tokens owned by the caller.
- **Issue**: ERC1155 lacks per-token approvals, which may cause issues for applications expecting ERC721’s granular approval system.

## Key Differences Between ERC721 and ERC1155

| Feature                  | ERC721                                      |ERC1155    
|--------------------------|---------------------------------------------|---------------------------------------------|
| **Type of Token**        | Non-fungible (unique assets only)           | Both fungible and non-fungible tokens       |
| **Storage**              | Requires separate storage for each token    | Uses a single mapping for all token types   |
| **Transfers**            | One-by-one transfer of individual tokens    | Batch transfer of multiple tokens at once   |
| **Gas Efficiency**       | Less efficient, especially for large amounts| More efficient due to batch transfer support|
| **Metadata**             | Metadata per token (stored off-chain usually)| Can have metadata per token but            |
|                          |                                              | more flexible with batch handling          |

| **Receiver Function**    | `onERC721Received`                          | `onERC1155Received` and                     |
|                          |                                             | `onERC1155BatchReceived`                    |

| **Use Case**             | Ideal for collectibles, art, and other use  | Suitable for games, in-game                 |
|                          | cases                                       | assets, digital art, and fungible           |
|                          |                                             | tokens                                      |

## Technical Architecture and Implementation Recommendations

A single contract that integrate both ERC1155 and ERC721 token standards can be tricky and complex. A few ways this may be achieved include:
- Setting a token type with unique identification number that can be dynamically passed to each contract call. The function interactions and the value to be returned (if any) depend on the token type detected.

Implementation using this pattern can be done, as this has already been coded out in the `erc1155_erc721_research.cairo` file which can be found here: `Scaffold`::`packages`::`snfoundry`::`contracts`::`src`::`mock_contracts`::`erc1155_erc721_research.cairo`.

## **1. Contract Structure Possibilities**
The contract is designed to support both **ERC721** (non-fungible tokens) and **ERC1155** (semi-fungible tokens) token standards in a unified manner. Key structural features include:

### **Unified Storage**
- The contract uses a single storage structure (`Storage`) to manage both ERC721 and ERC1155 token data:
  - **ERC721 Storage**:
    - `ERC721_name`: Token name.
    - `ERC721_symbol`: Token symbol.
    - `ERC721_owners`: Mapping of token IDs to owner addresses.
    - `ERC721_balances`: Mapping of owner addresses to token balances.
    - `ERC721_token_approvals`: Mapping of token IDs to approved addresses.
    - `ERC721_operator_approvals`: Mapping of owner-operator pairs to approval status.
    - `ERC721_base_uri`: Base URI for token metadata.
  - **ERC1155 Storage**:
    - `ERC1155_balances`: Mapping of token ID-owner pairs to balances.
    - `ERC1155_operator_approvals`: Mapping of owner-operator pairs to approval status.
    - `ERC1155_uri`: URI for ERC1155 token metadata.
  - **Token Type Mapping**:
    - `token_types`: Mapping of token IDs to their type (`721` for ERC721, `1155` for ERC1155).

### **Modular Design**
- The contract is divided into modules for better organization:
  - **CombinedTokenImpl**: Core functionality for both ERC721 and ERC1155 tokens.
  - **TokenMetadataImpl**: Metadata-related functions.
  - **InternalImpl**: Internal helper functions for transfers, approvals, and checks.

### **Extensibility**
- The contract is designed to be extensible, allowing additional functionality to be added through custom logic.

---

## **2. Interface Requirements**

The contract adheres to the following interfaces:

### **ERC721 Interface**
- `IERC721Dispatcher`: Implements functions like `transfer_from`, `approve`, and `owner_of`.
- `IERC721Metadata`: Provides metadata functions like `name`, `symbol`, and `token_uri`.
- `IERC721Receiver`: Ensures compatibility with contracts that can receive ERC721 tokens.

### **ERC1155 Interface**
- `IERC1155Dispatcher`: Implements functions like `safe_transfer_from`, `safe_batch_transfer_from`, and `balance_of_batch`.
- `IERC1155MetadataURI`: Provides the `uri` function for ERC1155 tokens.
- `IERC1155Receiver`: Ensures compatibility with contracts that can receive ERC1155 tokens.

### **SRC5 Interface**
- The contract uses the `SRC5Component` to manage interface support checks, ensuring that contracts implementing `IERC721Receiver` or `IERC1155Receiver` are properly recognized.

---

## **3. Receiver Function Compatibility**

The contract ensures compatibility with receiver contracts through the following checks:

### **ERC721 Receiver**
- The `_check_on_erc721_received` function verifies if the recipient (`to`) supports the `IERC721Receiver` interface or is an account contract (supporting `ISRC6`).
- If the recipient supports `IERC721Receiver`, the `on_erc721_received` function is called to confirm the transfer.

### **ERC1155 Receiver**
- The `_check_on_ERC1155_received` and `_check_on_ERC1155_batch_received` functions verify if the recipient supports the `IERC1155Receiver` interface or is an account contract.
- If the recipient supports `IERC1155Receiver`, the `on_erc1155_received` or `on_erc1155_batch_received` function is called to confirm the transfer.

### **Fallback to Account Contracts**
- If the recipient does not support the receiver interfaces but is an account contract (supports `ISRC6`), the transfer is still allowed.

---

## **4. Token Transfer Mechanisms**

The contract implements distinct transfer mechanisms for ERC721 and ERC1155 tokens:

### **ERC721 Transfers**
- Single-token transfers are handled by `transfer_from` and `safe_transfer_from`.
- The `update_erc721` function updates the token ownership and emits a `Transfer` event.
- The `safe_transfer_from` function ensures the recipient is either an account contract or supports the `IERC721Receiver` interface.

### **ERC1155 Transfers**
- Single and batch transfers are handled by `safe_transfer_from` and `safe_batch_transfer_from`.
- The `update_erc1155` function updates token balances and emits either a `TransferSingle` or `TransferBatch` event.
- The `update_with_acceptance_check` function ensures the recipient is either an account contract or supports the `IERC1155Receiver` interface.
Both tokens can use `safe_transfer_from` as the function can detect token type automatically.

### **Minting and Burning**
- ERC721 tokens are minted using `mint` and `safe_mint`, which update the token ownership and emit a `Transfer` event.
- ERC1155 tokens are minted using `mint_with_acceptance_check` and `batch_mint_with_acceptance_check`, which update token balances and emit `TransferSingle` or `TransferBatch` events.
- Both token types can be burned using `burn` while `ERC1155` tokens use `batch_burn`.

---

## **5. Error Handling Approaches**

The contract uses a robust error-handling mechanism to ensure safe and predictable behavior:

### **Custom Errors**
- The contract defines a set of custom errors (e.g., `UNAUTHORIZED`, `INVALID_RECEIVER`, `INSUFFICIENT_BALANCE`) to provide clear feedback when operations fail.

### **Assertions**
- Key operations are guarded by assertions to enforce requirements. For example:
  - `assert(!to.is_zero(), Errors::INVALID_RECEIVER);` ensures the recipient is not the zero address.
  - `assert(token_ids.len() == values.len(), Errors::INVALID_ARRAY_LENGTH);` ensures array lengths match for batch operations.

### **Reentrancy Protection**
- The contract follows the checks-effects-interactions pattern to minimize reentrancy risks. For example, state updates (e.g., balance adjustments) are performed before external calls to receiver contracts. However, more reentrancy checks is needed for beta or production use.

### **Receiver Checks**
- The contract verifies that recipient contracts implement the required receiver interfaces (`IERC721Receiver` or `IERC1155Receiver`) before proceeding with transfers. If the checks fail, the transfer is reverted with an appropriate error (e.g., `SAFE_TRANSFER_FAILED`).

---

### Feasibility Report
The combined `ERC721` and `ERC1155` token standard is feasible and offers significant advantages in terms of flexibility, gas efficiency, and interoperability. It is suited for projects that seek to support both non-fungible and semi-fungible tokens.

However, for the limited time I had to brainstorm and implement this, the best idea I could think of was to use existing implementations for the two token standards; where possible same function can work for the two token standards, but in other cases the functions are unique for each standard.

Using the existing implementations made sense for a few reasons, the most important of which was interoperability with existing tools, wallets, marketplaces and other NFT infrastructure. E.g, 
   - The contract adheres to both ERC721 and ERC1155 interfaces, ensuring compatibility with existing tools, wallets, and marketplaces as I already mentioned.
   - It also implements the `SRC5` interface for interface support checks, ensuring robust interoperability.

   - The contract ensures compatibility with receiver contracts by implementing checks for `IERC721Receiver` and `IERC1155Receiver`.
   - Fallback to account contracts (supporting `ISRC6`) is provided for enhanced flexibility.
   - Even though the storage is structured to manage the two token standards at once, the variables are named in accordance to the official naming styles used for the both token standards to ensure compatibility.
   - The function signatures are compatible with the conventional function signatures for the both standards.

## **Conclusion**

The combined ERC1155 and ERC721 token standard represents a significant step forward in token standardization, offering a flexible and unified solution for managing both non-fungible and semi-fungible tokens within a single contract. By merging the strengths of ERC721 and ERC1155, this research demonstrates the feasibility of a hybrid approach that reduces deployment complexity, optimizes gas costs, and enhances interoperability.

If more time and resources are dedicated to advancing this research, it has the potential to give rise to a **new, unique token standard**. This standard would introduce its own `SRC5 Interface ID`, complete with robust implementations that define how it interacts with the broader token ecosystem. Such a standard could revolutionize token management by offering developers a versatile and efficient framework for creating and managing diverse token types, paving the way for innovative use cases and greater adoption across the blockchain community.