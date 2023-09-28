import * as Dialog from "@radix-ui/react-dialog"
import { Chain, useLume } from "@/components/lume/LumeProvider"

const LumeDashboard = () => {
  const { chains } = useLume()

  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed z-40 inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed p-5 z-50 right-0 bottom-0 top-0 w-[300px] bg-neutral-800 text-white border-black border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500">
          <Dialog.Title>Syncing State: Connected</Dialog.Title>
          <Dialog.Description>Network Log:</Dialog.Description>
          {chains.map((chain) => (
            <div key={chain.chainId}>
              <CircularProgress chain={chain} />
            </div>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const CircularProgress = ({
  chain,
  className
}: {
  chain: Chain
  className?: string
}) => {
  const progressOffset = ((100 - chain.progress) / 100) * 565.48
  const textOffset = (chain.progress / 100) * (30 - 44) + 44

  return (
    <svg
      className={`${className} ${
        chain.syncState === "done"
          ? "text-primary"
          : chain.syncState === "error"
          ? "text-red-600"
          : "text-orange-500"
      }`}
      width="100"
      height="100"
      viewBox="-25 -25 250 250"
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
        stroke-width="8px"
        stroke-dasharray="282.74px"
        stroke-dashoffset="0"
      ></circle>
      <circle
        r="45"
        cx="50"
        cy="50"
        stroke="currentColor"
        stroke-width="8px"
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
        font-weight="bold"
        style={{ transform: "rotate(90deg) translate(0px, -98px)" }}
      >
        {chain.progress}
      </text>
    </svg>
  )
}

export default LumeDashboard
