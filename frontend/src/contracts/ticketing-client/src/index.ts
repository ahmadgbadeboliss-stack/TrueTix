import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
} from "@stellar/stellar-sdk/contract";
import type { u32, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}




export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"SoldOut"},
  4: {message:"TicketNotFound"},
  5: {message:"AlreadyUsed"},
  6: {message:"Unauthorized"},
  7: {message:"InvalidSupply"},
  8: {message:"InvalidPrice"}
}


export interface Event {
  name: string;
  organizer: string;
  payment_token: string;
  ticket_price: i128;
  tickets_checked_in: u32;
  tickets_sold: u32;
  total_supply: u32;
}


export interface Ticket {
  owner: string;
  used: boolean;
}

export type DataKey = {tag: "Event", values: void} | {tag: "Ticket", values: readonly [u32]} | {tag: "OwnerTickets", values: readonly [string]};

export interface Client {
  /**
   * Construct and simulate a check_in transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Marks a ticket as used. Only the event organizer (the door
   * scanner identity for MVP) may check tickets in. Reading and
   * writing the ticket state happens within a single atomic contract
   * invocation, so a ticket cannot be checked in twice even under
   * concurrent scan attempts.
   */
  check_in: ({caller, ticket_id}: {caller: string, ticket_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_event transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_event: (options?: MethodOptions) => Promise<AssembledTransaction<Result<Event>>>

  /**
   * Construct and simulate a buy_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Buyer purchases the next available ticket, paying `ticket_price` of
   * `payment_token` directly to the organizer. Fails once supply is
   * exhausted, enforcing scarcity on-chain.
   */
  buy_ticket: ({buyer}: {buyer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a get_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_ticket: ({ticket_id}: {ticket_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Ticket>>>

  /**
   * Construct and simulate a mint_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Organizer creates the event and mints a fixed batch of tickets (the
   * available supply). Callable exactly once per contract instance.
   */
  mint_tickets: ({organizer, name, ticket_price, total_supply, payment_token}: {organizer: string, name: string, ticket_price: i128, total_supply: u32, payment_token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_my_tickets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_my_tickets: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a is_valid_ticket transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_valid_ticket: ({ticket_id}: {ticket_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  public readonly options: ContractClientOptions;
  constructor(options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAHU29sZE91dAAAAAADAAAAAAAAAA5UaWNrZXROb3RGb3VuZAAAAAAABAAAAAAAAAALQWxyZWFkeVVzZWQAAAAABQAAAAAAAAAMVW5hdXRob3JpemVkAAAABgAAAAAAAAANSW52YWxpZFN1cHBseQAAAAAAAAcAAAAAAAAADEludmFsaWRQcmljZQAAAAg=",
        "AAAAAQAAAAAAAAAAAAAABUV2ZW50AAAAAAAABwAAAAAAAAAEbmFtZQAAABAAAAAAAAAACW9yZ2FuaXplcgAAAAAAABMAAAAAAAAADXBheW1lbnRfdG9rZW4AAAAAAAATAAAAAAAAAAx0aWNrZXRfcHJpY2UAAAALAAAAAAAAABJ0aWNrZXRzX2NoZWNrZWRfaW4AAAAAAAQAAAAAAAAADHRpY2tldHNfc29sZAAAAAQAAAAAAAAADHRvdGFsX3N1cHBseQAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAABlRpY2tldAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAR1c2VkAAAAAQ==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAABUV2ZW50AAAAAAAAAQAAAAAAAAAGVGlja2V0AAAAAAABAAAABAAAAAEAAAAAAAAADE93bmVyVGlja2V0cwAAAAEAAAAT",
        "AAAAAAAAAQ9NYXJrcyBhIHRpY2tldCBhcyB1c2VkLiBPbmx5IHRoZSBldmVudCBvcmdhbml6ZXIgKHRoZSBkb29yCnNjYW5uZXIgaWRlbnRpdHkgZm9yIE1WUCkgbWF5IGNoZWNrIHRpY2tldHMgaW4uIFJlYWRpbmcgYW5kCndyaXRpbmcgdGhlIHRpY2tldCBzdGF0ZSBoYXBwZW5zIHdpdGhpbiBhIHNpbmdsZSBhdG9taWMgY29udHJhY3QKaW52b2NhdGlvbiwgc28gYSB0aWNrZXQgY2Fubm90IGJlIGNoZWNrZWQgaW4gdHdpY2UgZXZlbiB1bmRlcgpjb25jdXJyZW50IHNjYW4gYXR0ZW1wdHMuAAAAAAhjaGVja19pbgAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJdGlja2V0X2lkAAAAAAAABAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAJZ2V0X2V2ZW50AAAAAAAAAAAAAAEAAAPpAAAH0AAAAAVFdmVudAAAAAAAAAM=",
        "AAAAAAAAAKtCdXllciBwdXJjaGFzZXMgdGhlIG5leHQgYXZhaWxhYmxlIHRpY2tldCwgcGF5aW5nIGB0aWNrZXRfcHJpY2VgIG9mCmBwYXltZW50X3Rva2VuYCBkaXJlY3RseSB0byB0aGUgb3JnYW5pemVyLiBGYWlscyBvbmNlIHN1cHBseSBpcwpleGhhdXN0ZWQsIGVuZm9yY2luZyBzY2FyY2l0eSBvbi1jaGFpbi4AAAAACmJ1eV90aWNrZXQAAAAAAAEAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAEAAAPpAAAABAAAAAM=",
        "AAAAAAAAAAAAAAAKZ2V0X3RpY2tldAAAAAAAAQAAAAAAAAAJdGlja2V0X2lkAAAAAAAABAAAAAEAAAPpAAAH0AAAAAZUaWNrZXQAAAAAAAM=",
        "AAAAAAAAAINPcmdhbml6ZXIgY3JlYXRlcyB0aGUgZXZlbnQgYW5kIG1pbnRzIGEgZml4ZWQgYmF0Y2ggb2YgdGlja2V0cyAodGhlCmF2YWlsYWJsZSBzdXBwbHkpLiBDYWxsYWJsZSBleGFjdGx5IG9uY2UgcGVyIGNvbnRyYWN0IGluc3RhbmNlLgAAAAAMbWludF90aWNrZXRzAAAABQAAAAAAAAAJb3JnYW5pemVyAAAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAADHRpY2tldF9wcmljZQAAAAsAAAAAAAAADHRvdGFsX3N1cHBseQAAAAQAAAAAAAAADXBheW1lbnRfdG9rZW4AAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAOZ2V0X215X3RpY2tldHMAAAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAPqAAAABA==",
        "AAAAAAAAAAAAAAAPaXNfdmFsaWRfdGlja2V0AAAAAAEAAAAAAAAACXRpY2tldF9pZAAAAAAAAAQAAAABAAAAAQ==" ]),
      options
    )
    this.options = options;
  }
  public readonly fromJSON = {
    check_in: this.txFromJSON<Result<void>>,
        get_event: this.txFromJSON<Result<Event>>,
        buy_ticket: this.txFromJSON<Result<u32>>,
        get_ticket: this.txFromJSON<Result<Ticket>>,
        mint_tickets: this.txFromJSON<Result<void>>,
        get_my_tickets: this.txFromJSON<Array<u32>>,
        is_valid_ticket: this.txFromJSON<boolean>
  }
}