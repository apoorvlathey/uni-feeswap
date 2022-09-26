import { useEffect, useState } from "react";
import {
  Center,
  Box,
  Text,
  Image,
  Stack,
  Divider,
  HStack,
  Spacer,
  Button,
} from "@chakra-ui/react";
import {
  useNetwork,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useContract,
  useProvider,
} from "wagmi";
import { constants, Contract } from "ethers";
import { UniV3Position } from "@/types";
import useChainInfo from "@/hooks/useChainInfo";
import NonfungiblePositionManagerABI from "@/abis/NonfungiblePositionManager.json";
import UniFeeSwapABI from "@/abis/UniFeeSwap.json";
import GradientButton from "./GradientButton";

const UniswapPosition = ({ pos }: { pos: UniV3Position }) => {
  const { chain } = useNetwork();
  const provider = useProvider();
  const { UniV3NonfungiblePositionManager, UniFeeSwap, feeTiers } =
    useChainInfo();
  const nonfungiblePositionManagerContract = useContract<Contract>({
    addressOrName: UniV3NonfungiblePositionManager,
    contractInterface: NonfungiblePositionManagerABI,
    signerOrProvider: provider,
  });

  const [feeTierPercent, setFeeTierPercent] = useState<string>();
  const [newFee, setNewFee] = useState<number>();
  const [operator, setOperator] = useState<string>();

  const currentFeeTier = pos.metadata.name
    .split(" ")
    .filter((e) => e.slice(-1) === "%")[0];

  useContractRead({
    addressOrName: UniV3NonfungiblePositionManager,
    contractInterface: NonfungiblePositionManagerABI,
    functionName: "getApproved",
    args: pos.token_id,
    onSuccess(data) {
      setOperator(data as unknown as string);
    },
    enabled: UniV3NonfungiblePositionManager !== constants.AddressZero,
  });

  const { config: approveConfig } = usePrepareContractWrite({
    addressOrName: UniV3NonfungiblePositionManager,
    contractInterface: NonfungiblePositionManagerABI,
    functionName: "approve",
    args: [UniFeeSwap, pos.token_id],
    enabled:
      UniFeeSwap !== constants.AddressZero &&
      UniV3NonfungiblePositionManager !== constants.AddressZero &&
      operator?.toLowerCase() !== UniFeeSwap.toLowerCase(),
  });
  const { config: feeSwapConfig } = usePrepareContractWrite({
    addressOrName: UniFeeSwap,
    contractInterface: UniFeeSwapABI,
    functionName: "feeSwap",
    args: [pos.token_id, newFee, 0],
    enabled:
      UniFeeSwap !== constants.AddressZero &&
      UniV3NonfungiblePositionManager !== constants.AddressZero &&
      operator?.toLowerCase() === UniFeeSwap.toLowerCase(),
  });

  const { write: approveWrite, isLoading: isApproveLoading } = useContractWrite(
    {
      ...approveConfig,
      async onSuccess(data) {
        await data.wait();
        feeSwapWrite?.();
      },
    }
  );
  const { write: feeSwapWrite, isLoading: isFeeSwapLoading } =
    useContractWrite(feeSwapConfig);

  const confirm = async () => {
    if (operator?.toLowerCase() !== UniFeeSwap.toLowerCase()) {
      approveWrite?.();
    } else {
      feeSwapWrite?.();
    }
  };

  useEffect(() => {
    if (feeTierPercent && chain && feeTiers) {
      setNewFee(parseFloat(feeTierPercent.slice(0, -1)) * 10000);
    }
  }, [feeTierPercent, chain, feeTiers]);

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      alignItems={{ base: "center", md: "stretch" }}
      mx={4}
      py="2rem"
      px="3rem"
      spacing={5}
      justifyContent="space-between"
    >
      <Image h="25rem" src={pos.metadata.image} alt={pos.metadata.name} />
      <Box>
        <Box mt="2rem" ml="1rem">
          <Text fontWeight="bold">{pos.metadata.name}</Text>
          <Divider mt="0.5rem" />
          <HStack mt="1rem">
            <Text fontWeight="bold">TokenId</Text>
            <Spacer />
            <Text>{pos.token_id}</Text>
          </HStack>
          <Divider mt="0.5rem" />
          <Box mt="2rem">
            <Text fontWeight="bolder" fontSize="xl">
              Select New Fee Tier
            </Text>
            <Center>
              <Stack
                mt="1rem"
                w="20rem"
                direction="row"
                justifyContent="space-between"
              >
                {chain &&
                  feeTiers &&
                  feeTiers
                    .filter((tier) => tier !== currentFeeTier)
                    .map((tier, i) => (
                      <Button
                        key={i}
                        w="5rem"
                        h="5rem"
                        colorScheme={tier === feeTierPercent ? "green" : ""}
                        bgColor={tier === feeTierPercent ? "green.600" : ""}
                        variant={tier !== feeTierPercent ? "outline" : ""}
                        onClick={() => setFeeTierPercent(tier)}
                      >
                        {tier}
                      </Button>
                    ))}
              </Stack>
            </Center>
            <Center mt="2rem">
              <GradientButton
                text="Confirm"
                onClick={() => confirm()}
                isDisabled={feeTierPercent === undefined}
                isLoading={isApproveLoading || isFeeSwapLoading}
              />
            </Center>
          </Box>
        </Box>
      </Box>
    </Stack>
  );
};

export default UniswapPosition;
