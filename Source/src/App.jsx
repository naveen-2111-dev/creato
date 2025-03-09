import { createEffect, createSignal } from "solid-js";
import { UseMyContext } from "../context";

function App() {
  const [Cid, setCid] = createSignal(null);
  const [JSON_CID, setJSON_CID] = createSignal(null);
  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [attributes, setAttributes] = createSignal("");
  const { Connect, user, Upload, MintNft, Reciept } = UseMyContext();

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
          console.log("Image CID:", res.IpfsHash);
        } else {
          console.error("Upload failed: No IPFS hash returned.");
        }

        const metaData = {
          name: name(),
          description: description(),
          image: `ipfs://${Cid()}`,
          attributes: JSON.parse(attributes() || "[]"),
        };
        const jsonToBlob = new Blob([JSON.stringify(metaData)], {
          type: "application/json",
        });
        const JsonMetaDataFile = new File([jsonToBlob], "metadata.json", {
          type: "application/json",
        });

        jsonToBlob.text().then((text) => {
          console.log("Metadata JSON:", text);
        });
        const NftMint = await Upload(JsonMetaDataFile);

        if (NftMint?.IpfsHash) {
          setJSON_CID(NftMint.IpfsHash);
        } else {
          console.error("Upload failed[json]: No IPFS hash returned.");
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
      const txReceipt = await MintNft(`ipfs://${JSON_CID()}`);
      console.log("Minting Receipt:", txReceipt);
      alert("mint successfull");
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      <div class="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-2xl">
        <input
          type="text"
          placeholder="Name"
          class="w-full px-4 py-3 mb-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          class="w-full px-4 py-3 mb-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={(e) => setDescription(e.target.value)}
        />
        <textarea
          placeholder="Attributes (JSON format)"
          class="w-full px-4 py-3 mb-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onInput={(e) => setAttributes(e.target.value)}
        ></textarea>

        <div class="border-4 border-dashed border-gray-500 w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 flex flex-col items-center justify-center cursor-pointer rounded-lg">
          <input
            type="file"
            accept="image/*"
            class="hidden"
            id="fileInput"
            onChange={handleFileUpload}
            disabled={!name() || !description() || !attributes()}
          />
          <label
            for="fileInput"
            class={`cursor-pointer flex flex-col items-center ${
              !name() || !description() || !attributes()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={(e) => {
              if (!name() || !description() || !attributes()) {
                e.preventDefault();
                alert(
                  "Please fill in Name, Description, and Attributes before uploading a file."
                );
              }
            }}
          >
            <span class="text-5xl">+</span>
          </label>
        </div>

        <button
          onClick={handleMint}
          disabled={!Cid()}
          class={`mt-6 w-full px-8 py-4 text-lg rounded-lg font-semibold ${
            Cid()
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {Cid() ? "Mint NFT" : "Upload Image"}
        </button>

        <button
          onClick={Connect}
          class="mt-6 cursor-pointer w-full px-8 py-4 text-lg bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold"
        >
          {user() ? user() : "Connect Wallet"}
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
