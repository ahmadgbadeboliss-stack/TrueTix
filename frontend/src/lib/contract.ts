import { Client as TicketingClient } from "../contracts/ticketing-client/src/index";
import { rpc } from "../contracts/ticketing-client/src/index";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./env";

export type SignTransaction = ConstructorParameters<typeof TicketingClient>[0]["signTransaction"];

export const rpcServer = new rpc.Server(RPC_URL);

/**
 * Builds a typed contract client. Pass a wallet's signTransaction + the
 * connected public key to get a client that can submit writes (buy_ticket,
 * check_in, mint_tickets); omit both for read-only calls (get_event, etc).
 */
export function getContractClient(opts?: {
  publicKey?: string;
  signTransaction?: SignTransaction;
}) {
  return new TicketingClient({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey: opts?.publicKey,
    signTransaction: opts?.signTransaction,
  });
}

export { TicketingClient };
export type { Event as ContractEvent, Ticket as ContractTicket } from "../contracts/ticketing-client/src/index";
