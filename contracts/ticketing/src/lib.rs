#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct Event {
    pub organizer: Address,
    pub name: String,
    pub ticket_price: i128,
    pub total_supply: u32,
    pub tickets_sold: u32,
    pub tickets_checked_in: u32,
    pub payment_token: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct Ticket {
    pub owner: Address,
    pub used: bool,
}

#[contracttype]
pub enum DataKey {
    Event,
    Ticket(u32),
    OwnerTickets(Address),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    SoldOut = 3,
    TicketNotFound = 4,
    AlreadyUsed = 5,
    Unauthorized = 6,
    InvalidSupply = 7,
    InvalidPrice = 8,
}

#[contract]
pub struct TicketingContract;

#[contractimpl]
impl TicketingContract {
    /// Organizer creates the event and mints a fixed batch of tickets (the
    /// available supply). Callable exactly once per contract instance.
    pub fn mint_tickets(
        env: Env,
        organizer: Address,
        name: String,
        ticket_price: i128,
        total_supply: u32,
        payment_token: Address,
    ) -> Result<(), Error> {
        organizer.require_auth();

        if env.storage().instance().has(&DataKey::Event) {
            return Err(Error::AlreadyInitialized);
        }
        if total_supply == 0 {
            return Err(Error::InvalidSupply);
        }
        if ticket_price <= 0 {
            return Err(Error::InvalidPrice);
        }

        let event = Event {
            organizer,
            name,
            ticket_price,
            total_supply,
            tickets_sold: 0,
            tickets_checked_in: 0,
            payment_token,
        };
        env.storage().instance().set(&DataKey::Event, &event);
        env.storage().instance().extend_ttl(500_000, 500_000);

        Ok(())
    }

    /// Buyer purchases the next available ticket, paying `ticket_price` of
    /// `payment_token` directly to the organizer. Fails once supply is
    /// exhausted, enforcing scarcity on-chain.
    pub fn buy_ticket(env: Env, buyer: Address) -> Result<u32, Error> {
        buyer.require_auth();

        let mut event: Event = env
            .storage()
            .instance()
            .get(&DataKey::Event)
            .ok_or(Error::NotInitialized)?;

        if event.tickets_sold >= event.total_supply {
            return Err(Error::SoldOut);
        }

        let token_client = token::Client::new(&env, &event.payment_token);
        token_client.transfer(&buyer, &event.organizer, &event.ticket_price);

        let ticket_id = event.tickets_sold;
        let ticket = Ticket {
            owner: buyer.clone(),
            used: false,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Ticket(ticket_id), &ticket);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Ticket(ticket_id), 500_000, 500_000);

        let owner_key = DataKey::OwnerTickets(buyer);
        let mut owned: Vec<u32> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or(Vec::new(&env));
        owned.push_back(ticket_id);
        env.storage().persistent().set(&owner_key, &owned);
        env.storage()
            .persistent()
            .extend_ttl(&owner_key, 500_000, 500_000);

        event.tickets_sold += 1;
        env.storage().instance().set(&DataKey::Event, &event);

        Ok(ticket_id)
    }

    /// Marks a ticket as used. Only the event organizer (the door
    /// scanner identity for MVP) may check tickets in. Reading and
    /// writing the ticket state happens within a single atomic contract
    /// invocation, so a ticket cannot be checked in twice even under
    /// concurrent scan attempts.
    pub fn check_in(env: Env, caller: Address, ticket_id: u32) -> Result<(), Error> {
        caller.require_auth();

        let event: Event = env
            .storage()
            .instance()
            .get(&DataKey::Event)
            .ok_or(Error::NotInitialized)?;

        if caller != event.organizer {
            return Err(Error::Unauthorized);
        }

        let key = DataKey::Ticket(ticket_id);
        let mut ticket: Ticket = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::TicketNotFound)?;

        if ticket.used {
            return Err(Error::AlreadyUsed);
        }

        ticket.used = true;
        env.storage().persistent().set(&key, &ticket);

        let mut event = event;
        event.tickets_checked_in += 1;
        env.storage().instance().set(&DataKey::Event, &event);

        Ok(())
    }

    pub fn get_event(env: Env) -> Result<Event, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Event)
            .ok_or(Error::NotInitialized)
    }

    pub fn get_ticket(env: Env, ticket_id: u32) -> Result<Ticket, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Ticket(ticket_id))
            .ok_or(Error::TicketNotFound)
    }

    pub fn get_my_tickets(env: Env, owner: Address) -> Vec<u32> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerTickets(owner))
            .unwrap_or(Vec::new(&env))
    }

    pub fn is_valid_ticket(env: Env, ticket_id: u32) -> bool {
        match env
            .storage()
            .persistent()
            .get::<DataKey, Ticket>(&DataKey::Ticket(ticket_id))
        {
            Some(ticket) => !ticket.used,
            None => false,
        }
    }
}

mod test;
