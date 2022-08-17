import styles from '../styles/Home.module.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  useAccount,
  useConnect,
  useContract,
  useContractRead,
  useContractWrite,
  useNetwork,
  useSigner,
  useWaitForTransaction,
  usePrepareContractWrite,
} from "wagmi";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import tokenContract from "../contracts/contract.json";
import dotenv from 'dotenv';

dotenv.config();

export default function Home() {
  const [supplyData, setSupplyData] = useState(0);
  const CONTRACT_ADDRESS = '';
  const USER_ADDRESS = ''
  const { data: signerData } = useSigner();
  const { address } = useAccount();
  const { chains } = useNetwork();

  // Mint function
  const { config: mintConfig } = usePrepareContractWrite({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "mint",
    args: [USER_ADDRESS, ethers.utils.parseEther("2")],
  }) 

  const {
    data: mintData,
    write: mintToken,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite(mintConfig);

  //Faucet function
  const { config: faucetConfig } = usePrepareContractWrite({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "faucet",
  }) 

  const {
    data: faucetData,
    write: faucetToken,
    isLoading: isFaucetLoading,
    isSuccess: isFaucetStarted,
    error: faucetError,
  } = useContractWrite(faucetConfig);

  const { isSuccess: txSuccess, error: txError } = useWaitForTransaction({
    confirmations: 1,
    hash: mintData?.hash,
  });

  const { data: totalSupplyData } = useContractRead({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    functionName: "totalSupply",
    watch: true,
  });

  const buyTokens = useContract({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: tokenContract.abi,
    signerOrProvider: signerData,
  });

  const buySomeTokens = async () => {
     await buyTokens.buy("1", {value: ethers.utils.parseEther(".01")});
  }

  useEffect(() => {
    if (totalSupplyData) {
      let temp = totalSupplyData / (10**18);
      setSupplyData(temp);
    }
  }, [totalSupplyData]);

  return (
    <div className="container flex flex-col  items-center mt-10" >
      <div className="flex mb-6">
        <ConnectButton showBalance={false} />
      </div>
      <h3 className="text-5xl font-bold mb-20">
        {"DappToken's token drop"}
      </h3>

      <div className="flex flex-col mb-8">
        <button
          onClick={
            ()=> 
            mintToken()
          }
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
          disabled={isMintLoading}
        >
          Mint Tokens
        </button>
        {txSuccess && <p>Success</p>}
      </div>
      
      <div className="flex flex-col mb-4">
        <button
          onClick={buySomeTokens}
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
        >
          Buy Tokens
        </button>
        {/* No success tag */}
      </div>

      <div className="flex flex-col mb-8">
        <button
          onClick={
            ()=> 
            faucetToken()
          }
          className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-12 py-2 sm:w-auto"
          disabled={isFaucetLoading}
        >
          Drip Tokens
        </button>
      </div>

      <div className='text-center'>
          <h3 className="text-lg ">Total minted</h3>
          <h3 className="text-lg">{supplyData}</h3>
      </div>
        
    </div>
  )
}
