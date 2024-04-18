import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import * as token from "@solana/spl-token";

async function createNewMint(
  connection: web3.Connection,
  payer: web3.Keypair,
  mintAuthority: web3.PublicKey,
  freezeAuthority: web3.PublicKey,
  decimals: number
): Promise<web3.PublicKey> {
  const tokenMint = await token.createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
  );

  return tokenMint;
}

async function createTokenAccount(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  owner: web3.PublicKey
) {
  const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    owner
  );

  console.log(
    `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
  );

  return tokenAccount;
}

async function mintTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  mint: web3.PublicKey,
  destination: web3.PublicKey,
  authority: web3.Keypair,
  amount: number
) {
  const transactionSignature = await token.mintTo(
    connection,
    payer,
    mint,
    destination,
    authority,
    amount
  );

  console.log(
    `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

async function approveDelegate(
  connection: web3.Connection,
  payer: web3.Keypair,
  account: web3.PublicKey,
  delegate: web3.PublicKey,
  owner: web3.Signer | web3.PublicKey,
  amount: number
) {
  const transactionSignature = await token.approve(
    connection,
    payer,
    account,
    delegate,
    owner,
    amount
  );

  console.log(
    `Approve Delegate Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

async function transferTokens(
  connection: web3.Connection,
  payer: web3.Keypair,
  source: web3.PublicKey,
  destination: web3.PublicKey,
  owner: web3.Keypair,
  amount: number
) {
  const transactionSignature = await token.transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount
  );

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
  );
}

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("user.publicKey", user.publicKey.toBase58());

  // const mint = await createNewMint(
  //   connection,
  //   user,
  //   user.publicKey,
  //   user.publicKey,
  //   6
  // );

  // const mintInfo = await token.getMint(
  //   connection,
  //   new web3.PublicKey("6bZxL4N1gY2jnJy6U1ztD8oy2XQQq4TRmy4s9ZpesMod")
  // );
  // const mintInfo = await token.getMint(connection, mint );

  // console.log({mintInfo})

  // const tokenAccount = await createTokenAccount(
  //   connection,
  //   user,
  //   new web3.PublicKey("Fiwj4Jz3TyoTUg42RPzeCNAadNNVpcjjtHV4bJ2c2KDL"),
  //   //  mint,
  //   new web3.PublicKey("47y5HDDxUX644txfGgeUgSvLNQMbggK4K5MNae7gL7id")
  // );


  // console.log("tokenadd", tokenAccount.address)
  // console.log(mintInfo, "mint infos")

    await mintTokens(
      connection,
      user,
      new web3.PublicKey("Fiwj4Jz3TyoTUg42RPzeCNAadNNVpcjjtHV4bJ2c2KDL"),
      new web3.PublicKey("7k9ZB19NSmP5iRv3QW2af92ptEfpyCW9ewWBkJ4nxu7b"),
      user,
      1000000000000 * 10 ** 6
    );

  // const delegate = web3.Keypair.generate();

  // await approveDelegate(
  //   connection,
  //   user,
  //   tokenAccount.address,
  //   delegate.publicKey,
  //   user.publicKey,
  //   50 * 10 ** mintInfo.decimals
  // );

  // const receiver = web3.Keypair.generate().publicKey;

  // const receiverTokenAccount = await createTokenAccount(
  //   connection,
  //   user,
  //   new web3.PublicKey("Ajz9EPUCsk6rAnBTaEmMsCo6KjN5RhQB1nhsR4m8xJAs"),
  //   receiver
  //    );

  // console.log("receiver ", receiver);

  // await transferTokens(
  //   connection,
  //   user,
  //   tokenAccount.address,
  //   receiverTokenAccount.address,
  //   delegate,
  //   50 * 10 ** mintInfo.decimals
  // );
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });

