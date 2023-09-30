import React, { useContext } from 'react';

type LumeSyncState = 'syncing' | 'done' | 'error'

export type Chain = {
  syncState: LumeSyncState,
  name: string,
  chainId: string,
  active: boolean,
  progress: number, // in porcentage
  logs: string[],
  type: 'blockchain' | 'content',
  peerCount?: number
}

type LumeObject = {
  chains: Chain[],
  activeResolver: 'local' | 'rpc'
}

type LumeContext = {
  lume: LumeObject
}

const LumeContext = React.createContext<LumeContext | undefined>(undefined);

const LumeProvider = ({ children }: { children: React.ReactNode }) => {
  const [lume, setLume] = React.useState<LumeObject>({
    chains: [
      {
        name: 'Ethereum',
        syncState: 'done',
        chainId: '1',
        active: true,
        progress: 100,
        logs: [],
        type: 'blockchain'
      },
      {
        name: "IPFS",
        syncState: 'syncing',
        chainId: '2',
        active: false,
        progress: 50,
        logs: [],
        type: 'content',
        peerCount: 3
      }
    ],
    activeResolver: 'local',
  });

  // Here you can add the logic to update the lume state

  return (
    <LumeContext.Provider value={{ lume }}>
      {children}
    </LumeContext.Provider>
  );
};

export default LumeProvider;

export function useLume() {
  const ctx = useContext(LumeContext);

  if (!ctx) {
    throw new Error('useLume must be used within a LumeProvider');
  }

  const { lume } = ctx;
  return lume
}
