#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::token::{StellarAssetClient, TokenClient};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(env, &sac.address()),
        StellarAssetClient::new(env, &sac.address()),
    )
}

struct TestCtx {
    env: Env,
    contract_id: Address,
    organizer: Address,
    payment_token: Address,
    token_admin: StellarAssetClient<'static>,
}

fn setup() -> TestCtx {
    let env = Env::default();
    env.mock_all_auths();

    let organizer = Address::generate(&env);
    let token_issuer = Address::generate(&env);
    let (_token_client, token_admin) = create_token_contract(&env, &token_issuer);
    let payment_token = token_admin.address.clone();

    let contract_id = env.register(TicketingContract, ());

    TestCtx {
        env,
        contract_id,
        organizer,
        payment_token,
        token_admin,
    }
}

#[test]
fn test_mint_buy_check_in_happy_path() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "TrueTix Launch Party"),
        &100_i128,
        &2u32,
        &ctx.payment_token,
    );

    let buyer = Address::generate(&ctx.env);
    ctx.token_admin.mint(&buyer, &1_000_i128);

    let ticket_id = client.buy_ticket(&buyer);
    assert_eq!(ticket_id, 0);

    let event = client.get_event();
    assert_eq!(event.tickets_sold, 1);
    assert_eq!(event.total_supply, 2);

    let token_client = TokenClient::new(&ctx.env, &ctx.payment_token);
    assert_eq!(token_client.balance(&ctx.organizer), 100);
    assert_eq!(token_client.balance(&buyer), 900);

    assert!(client.is_valid_ticket(&ticket_id));

    client.check_in(&ctx.organizer, &ticket_id);

    let ticket = client.get_ticket(&ticket_id);
    assert!(ticket.used);
    assert!(!client.is_valid_ticket(&ticket_id));

    let event = client.get_event();
    assert_eq!(event.tickets_checked_in, 1);

    let my_tickets = client.get_my_tickets(&buyer);
    assert_eq!(my_tickets.len(), 1);
    assert_eq!(my_tickets.get(0).unwrap(), 0);
}

#[test]
fn test_sold_out_rejected() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Tiny Show"),
        &50_i128,
        &1u32,
        &ctx.payment_token,
    );

    let buyer_one = Address::generate(&ctx.env);
    ctx.token_admin.mint(&buyer_one, &1_000_i128);
    client.buy_ticket(&buyer_one);

    let buyer_two = Address::generate(&ctx.env);
    ctx.token_admin.mint(&buyer_two, &1_000_i128);

    let result = client.try_buy_ticket(&buyer_two);
    assert_eq!(result, Err(Ok(Error::SoldOut)));
}

#[test]
fn test_double_check_in_rejected() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Meetup"),
        &10_i128,
        &5u32,
        &ctx.payment_token,
    );

    let buyer = Address::generate(&ctx.env);
    ctx.token_admin.mint(&buyer, &1_000_i128);
    let ticket_id = client.buy_ticket(&buyer);

    client.check_in(&ctx.organizer, &ticket_id);
    let result = client.try_check_in(&ctx.organizer, &ticket_id);
    assert_eq!(result, Err(Ok(Error::AlreadyUsed)));
}

#[test]
fn test_check_in_unauthorized_rejected() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Conference"),
        &10_i128,
        &5u32,
        &ctx.payment_token,
    );

    let buyer = Address::generate(&ctx.env);
    ctx.token_admin.mint(&buyer, &1_000_i128);
    let ticket_id = client.buy_ticket(&buyer);

    let stranger = Address::generate(&ctx.env);
    let result = client.try_check_in(&stranger, &ticket_id);
    assert_eq!(result, Err(Ok(Error::Unauthorized)));
}

#[test]
fn test_double_init_rejected() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Festival"),
        &10_i128,
        &5u32,
        &ctx.payment_token,
    );

    let result = client.try_mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Festival Again"),
        &20_i128,
        &10u32,
        &ctx.payment_token,
    );
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_check_in_nonexistent_ticket_rejected() {
    let ctx = setup();
    let client = TicketingContractClient::new(&ctx.env, &ctx.contract_id);

    client.mint_tickets(
        &ctx.organizer,
        &String::from_str(&ctx.env, "Show"),
        &10_i128,
        &5u32,
        &ctx.payment_token,
    );

    let result = client.try_check_in(&ctx.organizer, &999u32);
    assert_eq!(result, Err(Ok(Error::TicketNotFound)));
}
