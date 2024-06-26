import { Algos, d, messagize, Operation, randomPasscode, ready, Siger, SignifyClient, Tier } from "signify-ts";
import { setTimeout } from "node:timers/promises";

export interface CreateWalletOptions {
  url: string;
  passcode?: string;
  alias: string;
}

export interface Member {
  alias: string;
  passcode: string;
  prefix: string;
  oobi: string;
  agentId: string;
  createGroup(name: string, members: Member[], dt: string, delegator?: string): Promise<Group>;
  resolveOobi(other: Pick<Member, "oobi" | "alias">): Promise<void>;
}

export interface Group {
  name: string;
  prefix: string;
  oobi: string;
}

export async function createKeriaWallet(options: CreateWalletOptions): Promise<Member> {
  const url = new URL(options.url);
  const bootUrl = `${url.protocol}//${url.hostname}:3903`;
  await ready();
  const passcode = options.passcode ?? randomPasscode();

  const client = new SignifyClient(options.url, passcode, Tier.low, bootUrl);
  await client.boot();
  await client.connect();

  await client.identifiers().create(options.alias, { transferable: true });
  const hab = await client.identifiers().get(options.alias);

  const eop = await client.identifiers().addEndRole(options.alias, "agent", client.agent!.pre);
  await client.operations().wait(await eop.op());

  const oobi = await client.oobis().get(options.alias, "agent");
  if (oobi.oobis.length === 0) {
    throw new Error("No oobis generated");
  }

  return {
    prefix: hab.prefix,
    passcode,
    alias: options.alias,
    oobi: oobi.oobis[0],
    agentId: client.agent!.pre,
    async resolveOobi(other) {
      const op = await client.oobis().resolve(other.oobi, other.alias);
      await client.operations().wait(op);
      console.log(`Resolved oobi ${other.oobi}`);
    },
    async createGroup(name: string, members: Member[], dt: string, delegator?: string) {
      const mhab = await client.identifiers().get(options.alias);

      const states = await Promise.all(
        members.map(async (member) => {
          const result = await client.keyStates().get(member.prefix);
          return result[0];
        })
      );

      const res = await client.identifiers().create(name, {
        algo: Algos.group,
        mhab: mhab,
        states,
        rstates: states,
        isith: states.length,
        nsith: states.length,
        delpre: delegator,
      });

      const sigers = res.sigs.map((sig: string) => new Siger({ qb64: sig }));

      const ims = d(messagize(res.serder, sigers));
      const attachment = ims.substring(res.serder.size);
      const embeds = {
        icp: [res.serder, attachment],
      };

      const memberIds = members.map((m) => m.prefix);
      const recipients = memberIds.filter((m) => m !== mhab.prefix);

      const data = { gid: res.serder.pre, smids: memberIds, rmids: memberIds };
      await client.exchanges().send(mhab.name, "multisig", mhab, "/multisig/icp", data, embeds, recipients);

      console.log("Waiting for multisig inception to complete");
      let operation = (await res.op()) as Operation;

      while (!operation.done) {
        if (delegator) {
          // Hack to refresh the key state of the delegator
          const contact = await client.contacts().get(delegator);
          await client.oobis().resolve(contact.oobi, contact.alias);
          const op = await client.keyStates().query(delegator);
          await client.operations().wait(op);
        }

        operation = await client.operations().get(operation.name);
        console.log(operation.name, operation.done);
        await setTimeout(1000);
      }

      const group = await client.identifiers().get(name);
      console.log("Inception completed", group.prefix);

      for (const member of members) {
        await client.identifiers().addEndRole(group.name, "agent", member.agentId);
        const endRoleResult = await client.identifiers().addEndRole(group.name, "agent", member.agentId, dt);

        const seal = [
          "SealEvent",
          {
            i: group.prefix,
            s: group.state.ee.s,
            d: group.state.ee.d,
          },
        ];

        const sigers = endRoleResult.sigs.map((sig: string) => new Siger({ qb64: sig }));
        const roleims = d(messagize(endRoleResult.serder, sigers, seal, undefined, undefined, false));
        const atc = roleims.substring(endRoleResult.serder.size);

        await client.exchanges().send(
          mhab.name,
          "multisig",
          mhab,
          "/multisig/rpy",
          { gid: group.prefix },
          {
            rpy: [endRoleResult.serder, atc],
          },
          recipients
        );

        await client.operations().wait(await endRoleResult.op());
      }

      const oobiResult = await client.oobis().get(group.name, "agent");
      const oobi = oobiResult.oobis[0].substring(0, oobiResult.oobis[0].lastIndexOf("/agent/"));

      return {
        prefix: group.prefix,
        name: name,
        oobi,
      } as Group;
    },
  };
}
