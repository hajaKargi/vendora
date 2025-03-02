use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Address, String};

#[contracttype]
pub struct NFT {
    pub id: u64,
    pub owner: Address,
    pub metadata: String, // Can store IPFS URI or JSON metadata
}

#[contracttype]
pub enum DataKey {
    NFT(u64),        // Maps NFT ID to NFT struct
    Ownership(Address), // Tracks owned NFT IDs for an address
    Admin,           // Stores admin address
    NextNFTId,       // Tracks next available NFT ID
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::NextNFTId, &0u64);
    }

    pub fn mint(env: Env, caller: Address, metadata: String) -> u64 {
        let admin: Address = env.storage().persistent().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("Only admin can mint NFTs");
        }
        
        let mut next_id: u64 = env.storage().persistent().get(&DataKey::NextNFTId).unwrap();
        next_id += 1;
        
        let nft = NFT {
            id: next_id,
            owner: caller.clone(),
            metadata: metadata.clone(),
        };
        
        env.storage().persistent().set(&DataKey::NFT(next_id), &nft);
        env.storage().persistent().set(&DataKey::NextNFTId, &next_id);
        
        env.events().publish((symbol_short!("mint"), next_id), nft);
        next_id
    }

    pub fn transfer(env: Env, caller: Address, to: Address, nft_id: u64) {
        let mut nft: NFT = env.storage().persistent().get(&DataKey::NFT(nft_id)).unwrap();
        
        if nft.owner != caller {
            panic!("Only the owner can transfer");
        }
        
        nft.owner = to.clone();
        env.storage().persistent().set(&DataKey::NFT(nft_id), &nft);
        
        env.events().publish((symbol_short!("transfer"), nft_id), (caller, to));
    }

    pub fn get_nft(env: Env, nft_id: u64) -> NFT {
        env.storage().persistent().get(&DataKey::NFT(nft_id)).unwrap()
    }
    
    pub fn get_owner(env: Env, nft_id: u64) -> Address {
        let nft: NFT = env.storage().persistent().get(&DataKey::NFT(nft_id)).unwrap();
        nft.owner
    }
}
