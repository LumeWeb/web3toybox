import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import "@lumeweb/sdk/lib/style.css"
import "@/styles/global.css"
import React, {
  createContext,
  createRef,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from "react"
import {
  type AuthContextType,
  AuthProvider,
  LumeDashboard,
  LumeIdentity,
  LumeIdentityTrigger,
  type LumeStatusContextType,
  LumeStatusProvider,
  NetworksProvider,
  useAuth,
  useLumeStatus,
  useNetworks,
  LumeDashboardTrigger
} from "@lumeweb/sdk"
import * as kernel from "@lumeweb/libkernel/kernel"
import { kernelLoaded } from "@lumeweb/libkernel/kernel"
import {
  dnsClient,
  ethClient,
  ipfsClient,
  networkRegistryClient,
  peerDiscoveryClient,
  swarmClient
} from "@/lib/clients"
import { ethers } from "ethers"
import * as ethersBytes from "@ethersproject/bytes"
import { createProvider } from "@lumeweb/kernel-eth-client"
// @ts-ignore
import jdu from "json-data-uri"
import { ERC721_ABI } from "@/lib/erc721-abi"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import LogoImg from "@/assets/lume-logo.png"
let BOOT_FUNCTIONS: (() => Promise<any>)[] = []

export const AppContext = createContext<any>(undefined)

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }

  return context
}

interface AppProviderProps {
  children: ReactNode
}

const provider = createProvider()

const ERC721_TRANSFER_EVENT_SIGNATURE = ethers.id(
  "Transfer(address,address,uint256)"
)

async function findPotentialERC721Contracts(
  address: string
): Promise<string[]> {
  const logs = await provider.getLogs({
    fromBlock: 1,
    toBlock: "latest",
    topics: [
      ERC721_TRANSFER_EVENT_SIGNATURE,
      null,
      ethersBytes.hexZeroPad(address, 32)
    ]
  })

  const potentialContracts = new Set<string>()
  logs.forEach((log: any) => potentialContracts.add(log.address))

  const confirmedERC721Contracts: string[] = []
  for (let contractAddress of potentialContracts) {
    if (await isERC721(contractAddress)) {
      confirmedERC721Contracts.push(contractAddress)
    }
  }

  return confirmedERC721Contracts
}

const TRANSFER_EVENT_SIGNATURE = ethers.id("Transfer(address,address,uint256)")

async function fetchTokensViaTransferEvent(
  address: string,
  contractAddress: string
): Promise<number[]> {
  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: contractAddress,
    topics: [
      TRANSFER_EVENT_SIGNATURE,
      null,
      ethersBytes.hexZeroPad(address, 32)
    ]
  })

  const tokenIds: number[] = []
  logs.forEach((log) => {
    if (log.topics && log.topics.length === 4) {
      const tokenIdBigNumber = ethers.toNumber(log.topics[3])
      tokenIds.push(tokenIdBigNumber)
    }
  })

  return tokenIds
}

async function fetchOwnedNFTs(
  address: string,
  confirmedERC721Contracts: string[]
): Promise<{ contract: string; tokenId: number; metadata: any }[]> {
  const ownedNFTs = []

  for (let contractAddress of confirmedERC721Contracts) {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider)
    let tokenIds: number[] = []

    try {
      const balance = await contract.balanceOf(address)
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i)
        tokenIds.push(tokenId.toNumber())
      }
    } catch (error) {
      // If tokenOfOwnerByIndex is not available, fall back to fetchTokensViaTransferEvent
      tokenIds = await fetchTokensViaTransferEvent(address, contractAddress)
    }

    for (let tokenId of tokenIds) {
      try {
        const uri = await contract.tokenURI(tokenId)
        //  const metadata = await fetchMetadataFromURI(uri);
        ownedNFTs.push({
          contract: contractAddress,
          tokenId: tokenId,
          metadata: uri
        })
      } catch (error: any) {
        console.error(
          `Failed to fetch metadata for token ${tokenId} from contract ${contractAddress}: ${error.message}`
        )
      }
    }
  }

  return ownedNFTs
}

async function isERC721(address: string): Promise<boolean> {
  const contract = new ethers.Contract(address, ERC721_ABI, provider)
  try {
    // Try calling some ERC-721 methods to confirm if this is an ERC-721 contract.
    await contract.name()
    await contract.symbol()
    return true
  } catch (error) {
    return false
  }
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>
}

async function boot(status: LumeStatusContextType, auth: AuthContextType) {
  kernel.init().then(() => {
    status.setInited(true)
  })

  await kernelLoaded()

  auth.setIsLoggedIn(true)

  BOOT_FUNCTIONS.push(
    async () =>
      await swarmClient.addRelay(
        "2d7ae1517caf4aae4de73c6d6f400765d2dd00b69d65277a29151437ef1c7d1d"
      )
  )

  // IRC
  BOOT_FUNCTIONS.push(
    async () =>
      await peerDiscoveryClient.register(
        "zrjHTx8tSQFWnmZ9JzK7XmJirqJQi2WRBLYp3fASaL2AfBQ"
      )
  )
  BOOT_FUNCTIONS.push(
    async () => await networkRegistryClient.registerType("content")
  )
  BOOT_FUNCTIONS.push(
    async () => await networkRegistryClient.registerType("blockchain")
  )
  BOOT_FUNCTIONS.push(async () => await ethClient.register())
  BOOT_FUNCTIONS.push(async () => await ipfsClient.register())

  const resolvers = [
    "zrjEYq154PS7boERAbRAKMyRGzAR6CTHVRG6mfi5FV4q9FA" // ENS
  ]

  for (const resolver of resolvers) {
    BOOT_FUNCTIONS.push(async () => dnsClient.registerResolver(resolver))
  }
  BOOT_FUNCTIONS.push(async () => status.setReady(true))

  await bootup()

  await Promise.all([ethClient.ready(), ipfsClient.ready()])
}

async function bootup() {
  for (const entry of Object.entries(BOOT_FUNCTIONS)) {
    console.log(entry[1].toString())
    await entry[1]()
  }
}

function LoginDash() {
  const { isLoggedIn } = useAuth()
  const { ready, inited } = useLumeStatus()

  return (
    <>
      {!isLoggedIn && (
        <LumeIdentity>
          <LumeIdentityTrigger asChild>
            <Button variant={"default"} disabled={!inited}>
              Login
            </Button>
          </LumeIdentityTrigger>
        </LumeIdentity>
      )}
      {isLoggedIn && (
        <LumeDashboard disabled={!ready}>
          <LumeDashboardTrigger asChild>
            <Button variant={"default"} disabled={!inited}>
              Open Dashboard
            </Button>
          </LumeDashboardTrigger>
        </LumeDashboard>
      )}
    </>
  )
}

async function asyncIterableToUint8Array(asyncIterable: any) {
  const chunks = []
  let totalLength = 0

  for await (const chunk of asyncIterable) {
    chunks.push(chunk)
    totalLength += chunk.length
  }

  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

function uint8ArrayToBase64(byteArray: Uint8Array) {
  let base64 = ""
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

  let padding = 0
  for (let i = 0; i < byteArray.length; i += 3) {
    const a = byteArray[i]
    const b = byteArray[i + 1]
    const c = byteArray[i + 2]

    const triplet = (a << 16) + ((b || 0) << 8) + (c || 0)

    base64 += characters.charAt((triplet & 0xfc0000) >> 18)
    base64 += characters.charAt((triplet & 0x03f000) >> 12)
    base64 += characters.charAt((triplet & 0x000fc0) >> 6)
    base64 += characters.charAt(triplet & 0x00003f)

    if (byteArray.length - i < 3) {
      padding = 3 - (byteArray.length - i)
    }
  }

  // Add padding if necessary
  if (padding > 0) {
    base64 = base64.slice(0, -padding) + (padding === 1 ? "=" : "==")
  }

  return base64
}

function App() {
  const status = useLumeStatus()
  const auth = useAuth()
  const [nftList, setNftList] = useState<any[]>([])

  useEffect(() => {
    boot(status, auth)
  }, [])

  const { networks } = useNetworks()

  const ipfsStatus = networks
  .filter((item) => item.name.toLowerCase() === "ipfs")
  ?.pop()
  
  const ethStatus = networks
    .filter((item) => item.name.toLowerCase() === "ethereum")
    ?.pop()

  const ready = ethStatus?.ready && status.ready

  const inputRef = createRef<HTMLInputElement>()

  async function search(e: any | Event) {
    e.preventDefault()

    let address = inputRef?.current?.value as string

    address = await ethers.resolveAddress(address, provider)

    const contracts = await findPotentialERC721Contracts(address)

    const nfts = await fetchOwnedNFTs(address, contracts)

    const list = []

    for (const nft of nfts) {
      let meta
      if (typeof nft.metadata === "string") {
        try {
          meta = await (await fetch(nft.metadata)).json()
        } catch (e) {
          meta = {
            image: "", // TODO: Improve this by bringing an actual image
            name: "Failed to Load",
            fail: true
          }
        }
      } else {
        meta = jdu.parse(nft.metadata)
      }

      let image

      if (!meta.fail) {
        const imageCID = meta.image.replace("ipfs://", "")

        image = await asyncIterableToUint8Array(
          ipfsClient.cat(imageCID).iterable()
        )
      } else {
        image = meta.image
      }

      list.push({
        image,
        name: meta.name,
        base64: meta.fail
      })

      setNftList(list)
    }
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen h-full w-screen bg-zinc-900 flex items-center flex-col p-8 space-y-3">
      <Card className="w-full bg-zinc-950 border-zinc-800 shadow-xl max-w-4xl">
        <CardHeader className="flex flex-row justify-between">
          <div className="flex gap-x-2 items-center justify-center text-zinc-500">
            <img src={LogoImg.src} className="w-20 h-7" />
            <h2 className="border-l border-current pl-2">NFT Explorer</h2>
          </div>
          <div className="w-32 flex justify-end">
            <LoginDash />
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex items-center mb-4" onSubmit={search}>
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-600"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <Input
                className="pl-10 w-full bg-zinc-900 border-zinc-700 text-white ring-offset-primary"
                placeholder="Introduce ETH Address or ENS. eg: 0x00...ABC or vitalik.ens"
                type="search"
                disabled={!ready}
                ref={inputRef}
              />
            </div>
            <Button className="ml-4" variant="default" disabled={!ready}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
      {auth.isLoggedIn && !ethStatus?.ready ? (
        <span className="max-w-4xl w-full block my-1 p-4 rounded-lg opacity-80 bg-yellow-900/70 border border-yellow-500 text-yellow-500">
          You'll need to wait for a couple minutes before we can start
          searching. You are currently locally syncing to the ETH network. <b className="font-bold">Current Progress: {ethStatus?.sync ? `${ethStatus?.sync.toLocaleString()}%` : 'Initializing...'}</b>
        </span>
      ) : null}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {nftList.map((nft, index) => (
          <img
            key={index}
            alt={nft.name}
            className="aspect-square object-cover border border-zinc-200 w-full rounded-lg overflow-hidden dark:border-zinc-800"
            height="300"
            src={
              nft.base64
                ? nft.image
                : `data:image/png;base64,${uint8ArrayToBase64(nft.image)}`
            }
            width="300"
          />
        ))}
      </div>
    </div>
  )
}

export default function () {
  return (
    <AppProvider>
      <LumeStatusProvider>
        <AuthProvider>
          <NetworksProvider>
            <App />
          </NetworksProvider>
        </AuthProvider>
      </LumeStatusProvider>
    </AppProvider>
  )
}
