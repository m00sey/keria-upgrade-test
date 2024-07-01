import { SignifyClient, Tier, ready } from "signify-ts";

const KERIA_HOSTNAME = process.env.KERIA_HOSTNAME ?? "localhost";
const AGENT_URL = `http://${KERIA_HOSTNAME}:3901`;

const passcode1 = process.env.PASSCODE1;
if (!passcode1) {
  throw new Error("No passcode provided");
}

await ready();
const client1 = new SignifyClient(AGENT_URL, passcode1, Tier.low);
await client1.connect();
console.log(`Successfully connected with passcode ${passcode1}`);

const members0 = await client1.identifiers().get("group0");
const members1 = await client1.identifiers().get("group1");

console.log("Group0", JSON.stringify(members0, null, 2));
console.log("Group1", JSON.stringify(members1, null, 2));

console.log("Group0 Members", await client1.identifiers().members("group0"));
console.log("Group1 Members", await client1.identifiers().members("group1"));
