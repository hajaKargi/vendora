"use client";

import type { NextPage } from "next";
import { useAccount } from "@starknet-react/core";
import { CustomConnectButton } from "~~/components/scaffold-stark/CustomConnectButton";
import { MyHoldings } from "~~/components/SimpleNFT/MyHoldings";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { notification } from "~~/utils/scaffold-stark";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";
import { useState } from "react";

const MyNFTs: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();
  const [status, setStatus] = useState("Mint NFT");
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintedTokenId, setLastMintedTokenId] = useState<number>();

  const { data: tokenIdCounter } = useScaffoldReadContract({
    contractName: "YourERC1155",
    functionName: "next_token_id",
  });

  const { writeAsync: mintItem } = useScaffoldWriteContract({
    contractName: "YourERC1155",
    functionName: "mint",
  });

  const handleMintItem = async () => {
    setStatus("Minting NFT");
    setIsMinting(true);

    try {
      const currentTokenMetaData = nftsMetadata[0];
      const notificationId = notification.loading("Uploading to IPFS");

      const uploadedItem = await addToIPFS(currentTokenMetaData);
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      await mintItem({
        args: [connectedAddress, 1, uploadedItem.path], 

      setStatus("NFT Minted!");
      setIsMinting(false);
    } catch (error) {
      console.error(error);
      setStatus("Mint Failed");
      setIsMinting(false);
      notification.error("Failed to mint NFT");
    }
  };

  return (
    <>
      <div className="flex items-center flex-col pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold">My NFTs</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-center">
        {!isConnected || isConnecting ? (
          <CustomConnectButton />
        ) : (
          <button
            className="btn btn-secondary text-white"
            disabled={status !== "Mint NFT" || isMinting}
            onClick={handleMintItem}
          >
            {status !== "Mint NFT" && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            {status}
          </button>
        )}
      </div>
      <MyHoldings setStatus={setStatus} />
    </>
  );
};

export default MyNFTs;