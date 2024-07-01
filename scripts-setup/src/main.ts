import { createKeriaWallet } from "./signify";
const KERIA_HOSTNAME = process.env.KERIA_HOSTNAME ?? "localhost";
const AGENT_URL = `http://${KERIA_HOSTNAME}:3901`;

const qar1 = await createKeriaWallet({ alias: "qar1", url: AGENT_URL, passcode: process.env.PASSCODE1 });
const qar2 = await createKeriaWallet({ alias: "qar2", url: AGENT_URL, passcode: process.env.PASSCODE2 });
const qar3 = await createKeriaWallet({ alias: "qar3", url: AGENT_URL, passcode: process.env.PASSCODE3 });
await qar1.resolveOobi(qar2);
await qar1.resolveOobi(qar3);
await qar2.resolveOobi(qar1);
await qar2.resolveOobi(qar3);
await qar3.resolveOobi(qar1);
await qar3.resolveOobi(qar2);
const dt = new Date().toISOString().replace("Z", "000+00:00");

await Promise.all([qar1.createGroup("group0", [qar1, qar2], dt), qar2.createGroup("group0", [qar1, qar2], dt)]);
await Promise.all([qar1.createGroup("group1", [qar1, qar3], dt), qar3.createGroup("group1", [qar1, qar3], dt)]);

console.log("QAR1", qar1.prefix, qar1.passcode);
console.log("QAR2", qar2.prefix, qar2.passcode);
console.log("QAR3", qar3.prefix, qar3.passcode);

const group0 = await qar1.client.identifiers().get("group0");
const group1 = await qar1.client.identifiers().get("group1");

console.log("Group0", JSON.stringify(group0, null, 2));
console.log("Group1", JSON.stringify(group1, null, 2));

console.log("Group0 Members", await qar1.client.identifiers().members("group0"));
