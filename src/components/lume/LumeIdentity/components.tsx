import { makeSwitchable, useSwitchableComponent } from "@/components/SwitchableComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, ClipboardCopyIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { useLumeIndentity } from "./LumeIdentityContext";

// Extracted components
const SubmitButtonComponent = ({ }) => {
  const { setVisibleComponent } = useSwitchableComponent();
  return (
    <Button className='w-full h-12' variant={"outline"} onClick={() => setVisibleComponent(components.SeedPhraseInput)}>
      <span className="text-center text-lg font-normal leading-normal">Sign in with Account Key</span>
    </Button>
  )
};

const SeedPhraseInputComponent = ({ }) => {
  const { signIn } = useLumeIndentity();
  return (
    <motion.form className='flex-col flex gap-y-4' onSubmit={(e) => {
      e.preventDefault();
      const target = e.target as typeof e.target & {
        elements: {
          seedPhrase: { value: string };
        }
      };
      const seedPhrase = target.elements.seedPhrase.value;
      signIn(seedPhrase)
    }}>
      <Input className='h-12 w-full text-lg' name="seedPhrase" />
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: -50 }}
        transition={{ type: "just", delay: 0.1 }}
        className="h-12"
      >
        <Button className='w-full h-full' role="submit">
          <span className="text-center text-lg font-normal leading-normal">Sign in</span>
        </Button>
      </motion.div>
    </motion.form>
  );
};

const SetupAccountKeyComponent = () => {
  const { setVisibleComponent } = useSwitchableComponent();

  return (
    <motion.div
      initial={{ y: 50 }}
      animate={{ y: 0 }}
      exit={{ y: -50 }}
      transition={{ type: "just", delay: 0.1 }}
      className="h-12"
    >
      <Button className='w-full h-full' onClick={() => setVisibleComponent(components.SeedPhraseGeneration)}>
        <span className="text-center text-lg font-normal leading-normal">I get it, I'll keep it safe. Let's see the key.</span>
      </Button>
    </motion.div>
  )
};

const SeedPhraseGenerationComponent = ({ phraseLength = 12 }) => {
  const [buttonClickedState, setButtonClickedState] = React.useState<"idle" | "clicked">("idle");
  const [step, setStep] = React.useState<number>(0);
  const { signIn } = useLumeIndentity();

  const phrases = React.useMemo(() => {
    // TODO: Replace with actual BIP39 or whatever is used for phrase generation
    return Array(phraseLength).fill("a phrase")
  }, [phraseLength]);

  const key = React.useMemo(() => {
    return phrases.join(" ");
  }, [phrases]);

  const copyPhrasesToClipboard = () => {
    navigator.clipboard.writeText(phrases.join(" "));
    setButtonClickedState("clicked");
    setTimeout(() => setButtonClickedState("idle"), 1000);
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {step === 1 ? <motion.div className={`z-10 absolute top-0 bottom-0 left-0 right-0 bg-black pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75, top: -120, left: -20, right: -20, bottom: 120 }}
          transition={{ type: "tween", duration: 0.1 }}
        // onAnimationComplete={() => {
        //   setTimeout(() => {
        //     setOpacity(1);
        //   }, 2000);
        // }}
        ></motion.div> : null}
      </AnimatePresence>
      <div className="z-20 relative mb-2.5 w-full h-full flex-wrap justify-center items-center gap-2.5 inline-flex">
        {phrases.map((phrase, index) => (
          <div className={`justify-center items-center gap-2.5 flex w-[calc(33%-10px)] h-10 rounded border border-current relative ring-current text-neutral-700`}>
            <span className=" text-white text-lg font-normal leading-normal w-full h-fit px-2.5 bg-transparent text-center">{phrase}</span>
            <span className="left-[6px] top-0 absolute text-current text-xs font-normal leading-normal">{index + 1}</span>
          </div>
        ))}
        <AnimatePresence>
          {step === 1 ? <motion.div className="text-red-400 flex flex-row gap-5 py-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "linear", delay: 0.2, duration: 0.5 }}
          >
            <ExclamationTriangleIcon className="w-14 h-14" />
            <span>Make sure to write this down for safe keeping.</span>
          </motion.div> : null}
        </AnimatePresence>
        <Button className={`w-full h-12 ${buttonClickedState === 'clicked' ? '!text-primary !border-primary' : ''}`} variant="outline" onClick={copyPhrasesToClipboard}>
          {buttonClickedState === 'clicked' ? <CheckIcon className="w-5 h-5 mr-2.5" /> : <ClipboardCopyIcon className="w-5 h-5 mr-2.5" />}
          {buttonClickedState === 'clicked' ? 'Copied!' : 'Copy Account Key'}
        </Button>
      </div>
      {step === 0 ? (
        <Button className="z-20 w-full h-12 text-white bg-neutral-700 hover:bg-neutral-800" variant="secondary" onClick={() => setStep(1)}>
          Continue
        </Button>
      ) : null}
      <AnimatePresence>
        {step === 1 ? <motion.div className="z-20 w-full h-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "linear", delay: 2, duration: 0.5 }}
        >
          <Button className="w-full h-full" onClick={() => signIn(key)}>
            Sign In
          </Button>
        </motion.div> : null}
      </AnimatePresence>
    </div>
  )
};

// Usage
const components = {
  SubmitButton: makeSwitchable(SubmitButtonComponent, 'submit-button'),
  SeedPhraseInput: makeSwitchable(SeedPhraseInputComponent, 'seed-phrase-input'),
  SetupAccountKey: makeSwitchable(SetupAccountKeyComponent, 'setup-account-key'),
  SeedPhraseGeneration: makeSwitchable(SeedPhraseGenerationComponent, 'seed-phrase-form'),
};

export default components;
