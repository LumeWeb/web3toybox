import { Variant, AnimatePresence, motion } from "framer-motion";
import React from "react";

const SwitchableComponentContext = React.createContext<SwitchableComponentContextType | undefined>(undefined);

export const SwitchableComponentProvider = ({ children }: React.PropsWithChildren) => {
  const [visibleComponent, setVisibleComponent] = React.useState<SwitchableComponentType>();

  return <SwitchableComponentContext.Provider
    value={{ visibleComponent: visibleComponent ?? DEFAULT_COMPONENT, setVisibleComponent }}
  >
    {children}
  </SwitchableComponentContext.Provider>
}

export function useSwitchableComponent(initialValue?: SwitchableComponentType) {
  const contextValue = React.useContext(SwitchableComponentContext);

  if (contextValue === undefined) {
    throw new Error('useSwitchableComponent hook is being used outside of its context. Please ensure that it is wrapped within a <SwitchableComponentProvider>.');
  }
  React.useEffect(() => {
    // Set the initial value if it's provided
    if (initialValue && contextValue.visibleComponent) {
      contextValue.setVisibleComponent(initialValue);
    }
  }, [initialValue]);

  return contextValue;
}

const variants: Record<string, Variant> = {
  hidden: { y: 50, opacity: 0, position: 'absolute' },
  show: {
    y: 0,
    opacity: 1,
    position: 'relative',
    transition: {
      type: "tween",
      ease: 'easeInOut'
    },
  },
  exit: { y: -50, opacity: 0, position: 'absolute' }
};

export const SwitchableComponent = ({ children, index }: React.PropsWithChildren<{ index: string }>) => {
  return (
    <AnimatePresence>
      <motion.div
        key={index}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={variants}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

type SwitchableComponentType<T extends {} = {}> = {
  index: string,
  render: (props: T | any) => ReturnType<React.FC>
}

type SwitchableComponentContextType<T = unknown> = {
  visibleComponent: SwitchableComponentType<T extends {} ? T : any>,
  setVisibleComponent: React.Dispatch<React.SetStateAction<SwitchableComponentType<T extends {} ? T : any> | undefined>>
}

const DEFAULT_COMPONENT = { render: () => undefined, index: Symbol('DEFAULT_COMPONENT').toString() }

// Factory function
export function makeSwitchable<T extends {}>(Component: React.FC<T>, index: string) {
  return {
    render(props: T) { return <Component {...props} /> },
    index: index || Symbol(Component.name).toString()
  };
};
