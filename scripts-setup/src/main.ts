import { createKeriaWallet } from "./signify";
const KERIA_HOSTNAME = process.env.KERIA_HOSTNAME ?? "localhost";
const AGENT_URL = `http://${KERIA_HOSTNAME}:3901`;

const qar1 = await createKeriaWallet({ alias: "qar1", url: AGENT_URL, passcode: process.env.PASSCODE1 });
const qar2 = await createKeriaWallet({ alias: "qar2", url: AGENT_URL, passcode: process.env.PASSCODE2 });
await qar1.resolveOobi(qar2);
await qar2.resolveOobi(qar1);
const dt = new Date().toISOString().replace("Z", "000+00:00");

await Promise.all([qar1.createGroup("qvi", [qar1, qar2], dt), qar2.createGroup("qvi", [qar1, qar2], dt)]);

console.log("QAR1", qar1.prefix, qar1.passcode);
console.log("QAR2", qar2.prefix, qar2.passcode);
