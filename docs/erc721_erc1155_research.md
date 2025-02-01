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

## Implementation Study

A single contract that integrate both ERC1155 and ERC721 token standards can be tricky and complex. A few ways this may be achieved include:
- Setting a token type with unique identification number that can be dynamically passed to each contract call. The function interactions and the value to be returned (if any) depend on the token type detected.

(not conclusive yet)...

