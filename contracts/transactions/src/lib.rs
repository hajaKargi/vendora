#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map};

#[derive(Clone)]
#[contracttype]
pub struct TransactionDetail {
    pub amount: i128,
    pub id: i128,
}

#[contract]
pub struct Transactions;

const TRANSACTIONS_RECEIVED: &str = "transactions_received";
const OUTGOING_TRANSACTIONS: &str = "outgoing_transactions";
const USERS_POINTS: &str = "users_points";
const ADMINS: &str = "admins";
const TOTAL_TRANSACTIONS: &str = "total_transactions";
const TOTAL_CASH_OUTFLOWS: &str = "total_cash_outflows";
const TOTAL_CASH_INFLOWS: &str = "total_cash_inflows";
const PARTICIPANT_COUNT: &str = "participant_count";

#[contractimpl]
impl Transactions {
    pub fn initialize(env: Env, admin: Address) {
        let mut admins: Map<Address, bool> = Map::new(&env);
        admins.set(admin, true);
        env.storage().instance().set(&ADMINS, &admins);

        let received: Map<Address, TransactionDetail> = Map::new(&env);
        let outgoing: Map<Address, TransactionDetail> = Map::new(&env);

        env.storage().instance().set(&TRANSACTIONS_RECEIVED, &received);
        env.storage().instance().set(&OUTGOING_TRANSACTIONS, &outgoing);
    }

    pub fn record_transaction(env: Env, from: Address, to: Address, amount: i128, id: i128) {
        let mut received = env.storage()
            .instance()
            .get(&TRANSACTIONS_RECEIVED)
            .unwrap_or(Map::new(&env));

        let mut outgoing = env.storage()
            .instance()
            .get(&OUTGOING_TRANSACTIONS)
            .unwrap_or(Map::new(&env));

        received.set(from.clone(), TransactionDetail { amount, id });
        outgoing.set(to.clone(), TransactionDetail { amount, id });

        env.storage().instance().set(&TRANSACTIONS_RECEIVED, &received);
        env.storage().instance().set(&OUTGOING_TRANSACTIONS, &outgoing);
    }

    pub fn read_received_transactions(env: Env, _address: Address) -> Map<Address, TransactionDetail> {
        env.storage()
            .instance()
            .get(&TRANSACTIONS_RECEIVED)
            .unwrap_or(Map::new(&env))
    }

    pub fn read_outgoing_transactions(env: Env, _address: Address) -> Map<Address, TransactionDetail> {
        env.storage()
            .instance()
            .get(&OUTGOING_TRANSACTIONS)
            .unwrap_or(Map::new(&env))
    }

    // Read functions
    pub fn read_total_transaction(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_TRANSACTIONS).unwrap_or(0i128)
    }

    pub fn read_cash_outflows(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_CASH_OUTFLOWS).unwrap_or(0i128)
    }

    pub fn read_cash_inflows(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_CASH_INFLOWS).unwrap_or(0i128)
    }

    pub fn read_user_points(env: Env, address: Address) -> i128 {
        let points: Map<Address, i128> = env.storage().instance()
            .get(&USERS_POINTS)
            .unwrap_or(Map::new(&env));
        points.get(address).unwrap_or(0i128)
    }

    pub fn read_tx_count(env: Env, address: Address) -> i128 {
        let counter: Map<Address, i128> = env.storage().instance()
            .get(&PARTICIPANT_COUNT)
            .unwrap_or(Map::new(&env));
        counter.get(address).unwrap_or(0i128)
    }

    // Transaction management functions
    pub fn record_incoming_transaction(env: Env, from: Address, amount: i128, id: i128) {
        let mut received: Map<Address, TransactionDetail> = env.storage().instance()
            .get(&TRANSACTIONS_RECEIVED)
            .unwrap_or(Map::new(&env));
        
        received.set(from.clone(), TransactionDetail { amount, id });
        
        // Update total inflows
        let current_inflows = Self::read_cash_inflows(env.clone());
        env.storage().instance().set(&TOTAL_CASH_INFLOWS, &(current_inflows + amount));
        
        // Update participant count
        Self::increment_participant_count(&env, &from);
        
        // Update total transactions
        let total = Self::read_total_transaction(env.clone());
        env.storage().instance().set(&TOTAL_TRANSACTIONS, &(total + 1));
        
        env.storage().instance().set(&TRANSACTIONS_RECEIVED, &received);
    }

    pub fn record_outgoing_transaction(env: Env, to: Address, amount: i128, id: i128) {
        let mut outgoing: Map<Address, TransactionDetail> = env.storage().instance()
            .get(&OUTGOING_TRANSACTIONS)
            .unwrap_or(Map::new(&env));
        
        outgoing.set(to.clone(), TransactionDetail { amount, id });
        
        // Update total outflows
        let current_outflows = Self::read_cash_outflows(env.clone());
        env.storage().instance().set(&TOTAL_CASH_OUTFLOWS, &(current_outflows + amount));
        
        // Update participant count
        Self::increment_participant_count(&env, &to);
        
        // Update total transactions
        let total = Self::read_total_transaction(env.clone());
        env.storage().instance().set(&TOTAL_TRANSACTIONS, &(total + 1));
        
        env.storage().instance().set(&OUTGOING_TRANSACTIONS, &outgoing);
    }

    // Helper functions
    fn increment_participant_count(env: &Env, address: &Address) {
        let mut counter: Map<Address, i128> = env.storage().instance()
            .get(&PARTICIPANT_COUNT)
            .unwrap_or(Map::new(&env));
        let current_count = counter.get(address.clone()).unwrap_or(0);
        counter.set(address.clone(), current_count + 1);
        env.storage().instance().set(&PARTICIPANT_COUNT, &counter);
    }

    fn is_admin(env: &Env, address: &Address) -> bool {
        let admins: Map<Address, bool> = env.storage().instance()
            .get(&ADMINS)
            .unwrap_or(Map::new(&env));
        admins.get(address.clone()).unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    #[allow(deprecated)]
    fn test_transactions() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Transactions {});
        let client = TransactionsClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let from = Address::generate(&env);
        let to = Address::generate(&env);

        // Initialize contract
        client.initialize(&admin);

        // Record a transaction
        client.record_transaction(&from, &to, &100, &1);

        // Check transaction details
        let received = client.read_received_transactions(&to);
        let outgoing = client.read_outgoing_transactions(&from);

        assert_eq!(received.len(), 1);
        assert_eq!(outgoing.len(), 1);

        let received_tx = received.get(from.clone()).unwrap();
        let outgoing_tx = outgoing.get(to.clone()).unwrap();

        assert_eq!(received_tx.amount, 100);
        assert_eq!(received_tx.id, 1);
        assert_eq!(outgoing_tx.amount, 100);
        assert_eq!(outgoing_tx.id, 1);

        // Test admin functionality
        let is_admin_admin = env.as_contract(&contract_id, || {
            Transactions::is_admin(&env, &admin)
        });
        let is_admin_from = env.as_contract(&contract_id, || {
            Transactions::is_admin(&env, &from)
        });
        assert!(is_admin_admin);
        assert!(!is_admin_from);
    }
} 