import {
  Collection,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionDataArgs,
  Creator,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  UpdateMetadataAccountV2InstructionAccounts,
  UpdateMetadataAccountV2InstructionData,
  Uses,
  createMetadataAccountV3,
  updateMetadataAccountV2,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import {
  PublicKey,
  createSignerFromKeypair,
  none,
  signerIdentity,
  some,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import fs from "fs";

import dotenv from "dotenv"


dotenv.config();


export async function initializeKeypair(
    connection: web3.Connection
  ): Promise<web3.Keypair> {
    let keypair: web3.Keypair
  
    if (!process.env.PRIVATE_KEY) {
      console.log("Creating .env file")
      keypair = web3.Keypair.generate()
      fs.writeFileSync(".env", `PRIVATE_KEY=[${keypair.secretKey.toString()}]`)
    } else {
      const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
      const secretKey = Uint8Array.from(secret)
      keypair = web3.Keypair.fromSecretKey(secretKey)
    }
  
    console.log("PublicKey:", keypair.publicKey.toBase58())
    // await airdropSolIfNeeded(keypair, connection)
    return keypair
  }
  

const INITIALIZE = false;

async function main() {
  console.log("let's name some tokens in 2024!");
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  const myKeypair = await initializeKeypair(connection);
  const mint = new web3.PublicKey(
    "Fiwj4Jz3TyoTUg42RPzeCNAadNNVpcjjtHV4bJ2c2KDL"
  );

  const umi = createUmi("https://api.devnet.solana.com");
  const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));

//   return;
  umi.use(signerIdentity(signer, true));

  const ourMetadata = {
    // TODO change those values!
    name: "Mitcome",
    symbol: "MIT",
    uri: "https://raw.githubusercontent.com/KannanPalani57/solana-spl-token/main/src/metadata.json",
  };
  const onChainData = {
    ...ourMetadata,
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: none<Creator[]>(),
    collection: none<Collection>(),
    uses: none<Uses>(),
  };
  if (INITIALIZE) {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint: fromWeb3JsPublicKey(mint),
      mintAuthority: signer,
    };
    const data: CreateMetadataAccountV3InstructionDataArgs = {
      isMutable: true,
      collectionDetails: null,
      data: onChainData,
    };
    const txid = await createMetadataAccountV3(umi, {
      ...accounts,
      ...data,
    }).sendAndConfirm(umi);
    console.log(txid);
  } else {
    const data: UpdateMetadataAccountV2InstructionData = {
      data: some(onChainData),
      discriminator: 0,
      isMutable: some(true),
      newUpdateAuthority: none<PublicKey>(),
      primarySaleHappened: none<boolean>(),
    };
    const accounts: UpdateMetadataAccountV2InstructionAccounts = {
      metadata: findMetadataPda(umi, { mint: fromWeb3JsPublicKey(mint) }),
      updateAuthority: signer,
    };
    const txid = await updateMetadataAccountV2(umi, {
      ...accounts,
      ...data,
    }).sendAndConfirm(umi);
    console.log(txid);
  }
}

main();
