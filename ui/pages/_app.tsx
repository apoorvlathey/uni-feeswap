import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "@/styles/theme";
import { WagmiConfig, createClient, configureChains, chain } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { supportedChains, chainIdToRPC } from "@/config";
import { UniV3PositionsProvider } from "@/contexts/UniV3PositionsContext";

const { chains, provider } = configureChains(
  [
    ...supportedChains,
    chain.mainnet, // for ENS resolution
  ],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chainIdToRPC[chain.id]!,
      }),
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        shimChainChangedDisconnect: true,
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={customTheme}>
      <WagmiConfig client={client}>
        <UniV3PositionsProvider>
          <Component {...pageProps} />
        </UniV3PositionsProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
