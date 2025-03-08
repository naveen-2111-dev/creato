import { createEffect, createSignal } from "solid-js";
import { UseMyContext } from "../context";

function App() {
  const [Cid, setCid] = createSignal(null);
  const { Connect, address, Upload, MintNft, Reciept } = UseMyContext();

  createEffect(() => {
    Connect();
  });

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      console.log("Uploading file...");
      try {
        const res = await Upload(uploadedFile);

        if (res?.IpfsHash) {
          setCid(res.IpfsHash);
        } else {
          console.error("Upload failed: No IPFS hash returned.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleMint = async () => {
    if (!Cid()) {
      console.error("CID is missing! Upload an image first.");
      return;
    }

    try {
      const txReceipt = await MintNft(`https://ipfs.io/ipfs/${Cid()}`);
      console.log("Minting Receipt:", txReceipt);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      <div class="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-2xl">
        <div class="border-4 border-dashed border-gray-500 p-40 rounded-lg flex flex-col items-center justify-center cursor-pointer mb-6">
          <input
            type="file"
            accept="image/*"
            class="hidden"
            id="fileInput"
            onChange={handleFileUpload}
          />
          <label
            for="fileInput"
            class="cursor-pointer flex flex-col items-center"
          >
            <span class="text-5xl">+</span>
          </label>
        </div>

        <button
          onClick={handleMint}
          class="mt-6 cursor-pointer w-full px-8 py-4 text-lg bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold"
        >
          Mint NFT
        </button>

        <button
          onClick={Connect}
          class="mt-6 cursor-pointer w-full px-8 py-4 text-lg bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold"
        >
          {address() ? address() : "Connect Wallet"}
        </button>

        {Cid() && (
          <div class="mt-6 flex flex-col items-center">
            <img
              src={`https://ipfs.io/ipfs/${Cid()}`}
              alt="Uploaded File"
              class="w-full max-h-80 object-cover rounded-lg shadow-lg"
            />
            <div class="mt-4 text-center text-gray-400 text-sm">
              CID: {Cid()}
            </div>
          </div>
        )}

        {Reciept() && (
          <div class="mt-6 bg-gray-700 p-4 rounded-lg shadow-lg text-sm text-gray-300">
            <h3 class="text-lg font-semibold text-white">Minting Receipt</h3>
            <p>
              <strong>Transaction Hash:</strong> {Reciept().hash}
            </p>
            <p>
              <strong>Block Number:</strong> {Reciept().blockNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
