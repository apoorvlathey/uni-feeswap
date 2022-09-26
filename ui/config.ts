import { chain } from "wagmi";

export const supportedChains = [chain.optimism, chain.polygon, chain.goerli];

export const chainIdToRPC = {
  [chain.optimism.id]: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL,
  [chain.polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
  [chain.goerli.id]: process.env.NEXT_PUBLIC_GOERLI_RPC_URL,
  [chain.mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL, // for ENS resolution
};

// Mainnet, Polygon, Optimism, Arbitrum, Testnets Address
const UniV3NonfungiblePositionManager =
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

/**
 * How to check which fee tiers supported?
 * "0.05%", "0.3%", "1%" supported by default. "0.01%" was added later
 *
 * Go to NonfungiblePositionManager -> factory()
 * check if factory.feeAmountTickSpacing() returns non-zero value
 *
 * For 0.01% fee, feeAmount = 100, 0.5% = 500, and so on..
 */

export const chainIdToInfo: {
  [chainId: number]: {
    UniFeeSwap: string;
    UniV3NonfungiblePositionManager: string;
    feeTiers: string[];
  };
} = {
  [chain.optimism.id]: {
    UniFeeSwap: "0x8C0751530452Ee6a7B98Fe571427D83ADF3335DE",
    UniV3NonfungiblePositionManager,
    feeTiers: ["0.01%", "0.05%", "0.3%", "1%"],
  },
  [chain.polygon.id]: {
    UniFeeSwap: "0x2C06047C61393F8B1E89BEda86AC8c32E0817f8d",
    UniV3NonfungiblePositionManager,
    feeTiers: ["0.01%", "0.05%", "0.3%", "1%"],
  },
  [chain.goerli.id]: {
    UniFeeSwap: "0xd204c0CFDCea02CdEcff7e23EA248c5c9c0652d6",
    UniV3NonfungiblePositionManager,
    feeTiers: ["0.01%", "0.05%", "0.3%", "1%"],
  },
};
