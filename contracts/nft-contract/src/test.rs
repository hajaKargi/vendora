#![cfg(test)]
extern crate std;
use crate::{contract::NFT, NFTClient};
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Events},
    vec, Address, Env, FromVal, IntoVal, String, Symbol,
};

const NAME: &str = "Non Fungible Token";
const SYMBOL: &str = "NFT";
const BASE_URI: &str = "https://api.example.com/v1/";
const OTHER_BASE_URI: &str = "https://api.example.com/v2/";
const SAMPLE_URI: &str = "mock://mytoken";
const FIRST_TOKEN_ID: u128 = 5042;
const SECOND_TOKEN_ID: u128 = 79217;
const NON_EXISTENT_TOKEN_ID: u128 = 13;
const FOURTH_TOKEN_ID: u128 = 4;

fn create_nft_contract<'a>(env: &Env, admin: &Address) -> (Address, NFTClient<'a>) {
    let nft_contract_address = env.register(
        NFT,
        (
            admin.clone(),
            String::from_val(env, &NAME),
            String::from_val(env, &SYMBOL),
        ),
    );
    (
        nft_contract_address.clone(),
        NFTClient::new(env, &nft_contract_address),
    )
}

struct NFTTest<'a> {
    env: Env,
    admin: Address,
    owner: Address,
    other: Address,
    approved: Address,
    token_address: Address,
    token: NFTClient<'a>,
}

impl<'a> NFTTest<'a> {
    fn setup() -> Self {
        let env = Env::default();
        env.mock_all_auths();

        let admin = Address::generate(&env);
        let owner = Address::generate(&env);
        let other = Address::generate(&env);
        let approved = Address::generate(&env);

        let (token_address, token) = create_nft_contract(&env, &admin);

        NFTTest {
            env,
            admin,
            owner,
            other,
            approved,
            token_address,
            token,
        }
    }

    fn with_minted_tokens(&self) -> &Self {
        self.token.mint(&self.owner, &FIRST_TOKEN_ID);
        self.token.mint(&self.owner, &SECOND_TOKEN_ID);
        self
    }

    fn with_approval(&self) -> &Self {
        self.token
            .approve(&self.owner, &self.approved, &FIRST_TOKEN_ID);
        self
    }

    fn setup_with_minted_tokens() -> Self {
        let test = Self::setup();
        test.with_minted_tokens();
        test
    }

    fn setup_with_minted_tokens_and_approval() -> Self {
        let test = Self::setup();
        test.with_minted_tokens();
        test.with_approval();
        test
    }
}

#[test]
fn test_balance_of_when_the_given_address_owns_some_tokens_it_returns_the_amount_of_tokens_owned_by_the_given_address(
) {
    let NFTTest { owner, token, .. } = NFTTest::setup_with_minted_tokens();

    assert_eq!(token.balance_of(&owner), 2);
}

#[test]
fn test_balance_of_when_the_given_address_does_not_own_any_tokens_it_returns_0() {
    let NFTTest { other, token, .. } = NFTTest::setup_with_minted_tokens();

    assert_eq!(token.balance_of(&other), 0);
}

#[test]
fn test_owner_of_when_the_given_token_id_was_tracked_by_this_token_it_returns_the_owner_of_the_given_token_id(
) {
    let NFTTest { owner, token, .. } = NFTTest::setup_with_minted_tokens();

    assert_eq!(token.owner_of(&FIRST_TOKEN_ID), owner);
}

#[test]
#[should_panic(expected = "NFTNonexistentToken(13)")]
fn test_owner_of_when_the_given_token_id_was_not_tracked_by_this_token_it_reverts() {
    let NFTTest { token, .. } = NFTTest::setup_with_minted_tokens();

    token.owner_of(&NON_EXISTENT_TOKEN_ID);
}

#[test]
fn test_transfers_it_transfers_the_ownership_of_the_given_token_id_to_the_given_address() {
    let NFTTest {
        owner,
        other,
        token,
        ..
    } = NFTTest::setup_with_minted_tokens_and_approval();

    token.transfer(&owner, &other, &FIRST_TOKEN_ID);
    assert_eq!(token.owner_of(&FIRST_TOKEN_ID), other);
}

//

#[test]
fn test_metadata_has_a_name() {
    let NFTTest { env, token, .. } = NFTTest::setup();

    assert_eq!(token.name(), String::from_str(&env, NAME));
}

#[test]
fn test_metadata_has_a_symbol() {
    let NFTTest { env, token, .. } = NFTTest::setup();

    assert_eq!(token.symbol(), String::from_str(&env, SYMBOL));
}

#[test]
fn test_token_uri_returns_empty_string_by_default() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    assert_eq!(
        token.token_uri(&FIRST_TOKEN_ID),
        vec![&env, String::from_str(&env, "")]
    );
}

#[test]
#[should_panic(expected = "NFTNonexistentToken(13)")]
fn test_token_uri_reverts_when_queried_for_non_existent_token_id() {
    let NFTTest { token, .. } = NFTTest::setup_with_minted_tokens();

    token.token_uri(&NON_EXISTENT_TOKEN_ID);
}

#[test]
fn test_token_uri_can_be_set_for_a_token_id() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));
    assert_eq!(
        token.token_uri(&FIRST_TOKEN_ID),
        vec![&env, String::from_str(&env, SAMPLE_URI)]
    );
}

#[test]
fn test_token_uri_setting_the_uri_emits_an_event() {
    let NFTTest {
        env,
        token_address,
        token,
        ..
    } = NFTTest::setup_with_minted_tokens();

    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                token_address.clone(),
                (Symbol::new(&env, "metadata_update"), FIRST_TOKEN_ID).into_val(&env),
                ().into_val(&env)
            )
        ]
    );
}

#[test]
fn test_token_uri_setting_the_uri_for_non_existent_token_id_is_allowed() {
    let NFTTest {
        env,
        owner,
        token_address,
        token,
        ..
    } = NFTTest::setup_with_minted_tokens();

    token.set_token_uri(&NON_EXISTENT_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));
    assert_eq!(
        env.events().all(),
        vec![
            &env,
            (
                token_address.clone(),
                (Symbol::new(&env, "metadata_update"), NON_EXISTENT_TOKEN_ID).into_val(&env),
                ().into_val(&env)
            )
        ]
    );

    token.mint(&owner, &NON_EXISTENT_TOKEN_ID);
    assert_eq!(
        token.token_uri(&NON_EXISTENT_TOKEN_ID),
        vec![&env, String::from_str(&env, SAMPLE_URI)]
    );
}

#[test]
fn test_token_uri_base_uri_can_be_set() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    token.set_base_uri(&String::from_str(&env, BASE_URI));
    assert_eq!(token.base_uri(), String::from_str(&env, BASE_URI));
}

#[test]
fn test_token_uri_base_uri_is_added_as_a_prefix_to_the_token_uri() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    token.set_base_uri(&String::from_str(&env, BASE_URI));
    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));
    assert_eq!(
        token.token_uri(&FIRST_TOKEN_ID),
        vec![
            &env,
            String::from_str(&env, BASE_URI),
            String::from_str(&env, SAMPLE_URI)
        ]
    );
}

#[test]
fn test_token_uri_can_be_changed_by_changing_the_base_uri() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    token.set_base_uri(&String::from_str(&env, BASE_URI));
    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));

    token.set_base_uri(&String::from_str(&env, OTHER_BASE_URI));
    assert_eq!(
        token.token_uri(&FIRST_TOKEN_ID),
        vec![
            &env,
            String::from_str(&env, OTHER_BASE_URI),
            String::from_str(&env, SAMPLE_URI)
        ]
    );
}

// #[test]
// fn test_token_uri_token_id_is_appended_to_base_uri_for_tokens_with_no_uri() {
//     let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

//     token.set_base_uri(&String::from_str(&env, BASE_URI));
// }

#[test]
#[should_panic(expected = "NFTNonexistentToken(5042)")]
fn test_token_uri_tokens_without_uri_can_be_burnt() {
    let NFTTest { token, .. } = NFTTest::setup_with_minted_tokens();

    token.burn(&FIRST_TOKEN_ID);

    token.token_uri(&FIRST_TOKEN_ID);
}

#[test]
#[should_panic(expected = "NFTNonexistentToken(5042)")]
fn test_token_uri_tokens_with_uri_can_be_burnt() {
    let NFTTest { env, token, .. } = NFTTest::setup_with_minted_tokens();

    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));

    token.burn(&FIRST_TOKEN_ID);

    token.token_uri(&FIRST_TOKEN_ID);
}

#[test]
fn test_token_uri_tokens_uri_is_kept_if_token_is_burnt_and_reminted() {
    let NFTTest {
        env, owner, token, ..
    } = NFTTest::setup_with_minted_tokens();

    token.set_token_uri(&FIRST_TOKEN_ID, &String::from_str(&env, SAMPLE_URI));

    token.burn(&FIRST_TOKEN_ID);

    token.mint(&owner, &FIRST_TOKEN_ID);
    assert_eq!(
        token.token_uri(&FIRST_TOKEN_ID),
        vec![&env, String::from_str(&env, SAMPLE_URI)]
    );
}
