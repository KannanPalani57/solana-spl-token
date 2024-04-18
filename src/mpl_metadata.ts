
import {Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import fs from "fs"

export function loadWalletKey(): web3.Keypair {
    let keypair: web3.Keypair

    if (!process.env.PRIVATE_KEY) {
      console.log("Creating .env file")
      keypair = web3.Keypair.generate()
      fs.writeFileSync(".env", `PRIVATE_KEY=[${keypair.secretKey.toString()}]`)
    } else {
        let pkey = [235,134,42,95,180,111,208,25,7,28,100,61,220,72,128,254,50,204,109,231,13,205,249,62,136,8,195,145,82,158,52,203,99,243,82,149,193,79,85,183,140,246,164,122,141,138,223,62,211,33,207,217,1,95,102,193,50,141,18,12,19,223,254,162];
      const secret = JSON.parse(JSON.stringify(pkey) ?? "") as number[]
      const secretKey = Uint8Array.from(secret)
      keypair = web3.Keypair.fromSecretKey(secretKey)
    }
  
    console.log("PublicKey:", keypair.publicKey.toBase58())
    return keypair
  }

const INITIALIZE = true;

async function main(){
    console.log("let's name some tokens in 2024!");
    const myKeypair = loadWalletKey();
    const mint = new web3.PublicKey("6bZxL4N1gY2jnJy6U1ztD8oy2XQQq4TRmy4s9ZpesMod");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "My Test Sol Token", 
        symbol: "MYST",
        uri: "https://raw.githubusercontent.com/KannanPalani57/solana-spl-token/main/src/metadata.json",
    }
    const onChainData = {
        ...ourMetadata,
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
    }
    if(INITIALIZE){
        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            mintAuthority: signer,
        }
        const data: CreateMetadataAccountV3InstructionDataArgs = {
            isMutable: true,
            collectionDetails: null,
            data: onChainData
        }
        const txid = await createMetadataAccountV3(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(txid)
    } else {
        const data: UpdateMetadataAccountV2InstructionData = {
            data: some(onChainData),
            discriminator: 0,
            isMutable: some(true),
            newUpdateAuthority: none<PublicKey>(),
            primarySaleHappened: none<boolean>()
        }
        const accounts: UpdateMetadataAccountV2InstructionAccounts = {
            metadata: findMetadataPda(umi,{mint: fromWeb3JsPublicKey(mint)}),
            updateAuthority: signer
        }
        const txid = await updateMetadataAccountV2(umi, {...accounts, ...data} ).sendAndConfirm(umi);
        console.log(txid)
    }

}

main();
