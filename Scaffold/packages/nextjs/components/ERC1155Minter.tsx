import { useAccount, useContractWrite } from "@starknet-react/core";
import { useState } from "react";

export function ERC1155Minter({ contractAddress }: { contractAddress: string }) {
    const { address } = useAccount();
    const [uri, setUri] = useState("");
    const [amount, setAmount] = useState("1");

    const { write: mint } = useContractWrite({
        calls: [
            {
                contractAddress,
                entrypoint: "mint",
                calldata: [address!, amount, uri],
            },
        ],
    });

    return (
        <div className="p-4">
            <h2 className="text-2xl mb-4">Mint ERC1155 NFT</h2>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="NFT URI"
                    className="input input-bordered w-full"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    className="input input-bordered w-full"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button
                    className="btn btn-primary"
                    onClick={() => mint()}
                >
                    Mint NFT
                </button>
            </div>
        </div>
    );
}