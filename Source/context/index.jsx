import { ethers } from "ethers";
import { createSignal, createContext, useContext } from "solid-js";
import { PinataSDK } from "pinata-web3";
import abi from "../contract/Abi.json";
import contractDetails from "../contract/address.json";

const AppContext = createContext();

export function Myapp(props) {
  const [address, setAddress] = createSignal(null);
  const [Signer, setSigner] = createSignal(null);
  const [Instance, setInstance] = createSignal(null);
  const [Reciept, setReciept] = createSignal(null);

  const Connect = async () => {
    if (!window.ethereum) {
      console.log("No wallet installed");
      return;
    }
    try {
      await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [{ chainId: "0xAA36A7" }],
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const AddressOfSigner = await signer.getAddress();
      setSigner(signer);
      const user =
        AddressOfSigner.slice(0, 5) + "..." + AddressOfSigner.slice(5, 9);
      setAddress(user);

      const contract = new ethers.Contract(
        contractDetails.address,
        abi,
        signer
      );
      setInstance(contract);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const pinata = new PinataSDK({
    pinataJwt: import.meta.env.VITE_PINATA_JWT,
  });

  const Upload = async (file) => {
    try {
      if (!file) {
        throw new Error("No file selected");
      }
      const uploadFile = await pinata.upload.file(file);
      return uploadFile;
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const MintNft = async (URI) => {
    if (!Instance() || !Signer()) {
      console.error("Contract or signer not initialized");
      return;
    }

    try {
      const mintTx = await Instance().mintNFT(address(), URI);

      const receipt = await mintTx.wait();
      setReciept(receipt);
      return receipt;
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <AppContext.Provider value={{ address, Connect, Upload, MintNft, Reciept }}>
      {props.children}
    </AppContext.Provider>
  );
}

export function UseMyContext() {
  return useContext(AppContext);
}
