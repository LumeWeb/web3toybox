import * as Dialog from "@radix-ui/react-dialog"
import { Chain, useLume } from "@/components/lume/LumeProvider"
import Logo from "@/assets/lume-logo.png"

const SYNCSTATE_TO_TEXT: Record<Chain['syncState'], string> = {
  done: 'Synced',
  error: 'Issue',
  syncing: 'Syncing'
}

const SYNC_STATE_TO_TW_COLOR: Record<Chain['syncState'], string> = {
  'done': 'text-primary',
  'error': 'text-red-500',
  'syncing': 'text-orange-500',
}


const LumeDashboard = () => {
  const { chains } = useLume()

  const contentChains = chains.filter(c => c.type === 'content');
  const blockchainChains = chains.filter(c => c.type === 'blockchain');

  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed z-40 inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed p-5 z-50 right-0 bottom-0 top-0 w-[300px] bg-neutral-950 text-white border-black border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500">
          <div className="w-[calc(100%+38px)] border-b pb-3 -mx-5 px-5 border-neutral-900">
            <img src={Logo.src} className="w-24" />
          </div>
          <div className="mt-4 mb-8">
            <h2 className="text-xl mb-4"> Content </h2>
            <div className="grid grid-cols-2">
              {contentChains.map((chain, index) => <ChainIndicator key={`Content_ChainIndicator_${index}`} chain={chain} />)}
            </div>
          </div>

          <div className="mt-4 mb-8">
            <h2 className="text-xl mb-4"> Blockchain </h2>
            <div className="grid grid-cols-2">
              {blockchainChains.map((chain, index) => <ChainIndicator key={`Blockchain_ChainIndicator_${index}`} chain={chain} />)}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const ChainIndicator = ({ chain }: { chain: Chain }) => {
  return <div key={chain.chainId} className="flex flex-row gap-x-2 items-center ">
    <CircularProgress chain={chain} />
    <div className="flex flex-col">
      <span>{chain.name}</span>
      <span className={`text-[12px] -mt-1 ${SYNC_STATE_TO_TW_COLOR[chain.syncState]}`}> {SYNCSTATE_TO_TEXT[chain.syncState]} </span>
    </div>
  </div>
}

const CircularProgress = ({
  chain,
  className
}: {
  chain: Chain
  className?: string
}) => {
  const progressOffset = ((100 - chain.progress) / 100) * 282.74 // These math are not mathing
  const textOffset = (chain.progress / 100) * (30 - 44) + 44

  return (
    <svg
      className={`${className} ${SYNC_STATE_TO_TW_COLOR[chain.syncState]}`}
      width="36"
      height="36"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        r="45"
        cx="50"
        cy="50"
        fill="transparent"
        stroke="#e0e0e0"
        stroke-width="4px"
        stroke-dasharray="282.74px"
        stroke-dashoffset="0"
      ></circle>
      <circle
        r="45"
        cx="50"
        cy="50"
        stroke="currentColor"
        stroke-width="4px"
        stroke-linecap="round"
        stroke-dashoffset={`${progressOffset}px`}
        fill="transparent"
        stroke-dasharray="282.74px"
      ></circle>
      <text
        x={textOffset}
        y="57.5px"
        fill="currentColor"
        font-size="26px"
        font-weight="normal"
        style={{ transform: "rotate(90deg) translate(0px, -98px)" }}
      >
        {chain.progress}
      </text>
    </svg>
  )
}

export default LumeDashboard
