import { makeSwitchable, useSwitchableComponent } from "@/components/SwitchableComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import React from "react";

// Extracted components
const SubmitButtonComponent = ({ }) => {
  const { setVisibleComponent } = useSwitchableComponent();
  return (
    <Button className='w-full h-12' variant={"outline"} onClick={() => setVisibleComponent(components.SeedPhraseInput)}>
      <span className="text-center text-lg font-normal leading-normal">Sign in with Account Key</span>
    </Button>
  )
};

const SeedPhraseInputComponent = ({ signIn }: { signIn: (value: string) => void }) => {
  const [value, setValue] = React.useState<string>("");
  return (
    <motion.form className='flex-col flex gap-y-4'>
      <Input className='h-12 w-full text-lg' value={value} onChange={(e) => setValue(e.target?.value)} />
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: -50 }}
        transition={{ type: "just", delay: 0.1 }}
        className="h-12"
      >
        <Button className='w-full h-full' onClick={() => signIn(value)}>
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
      <Button className='w-full h-full' onClick={() => setVisibleComponent(components.SeedPhraseForm)}>
        <span className="text-center text-lg font-normal leading-normal">I get it, I'll keep it safe. Let's see the key.</span>
      </Button>
    </motion.div>
  )
};

const SeedPhraseFormComponent = ({ phraseLength = 12 }) => (
  <div className="w-full h-full flex-wrap justify-center items-center gap-2.5 inline-flex">
    {Array(phraseLength).fill("a phrase").map((phrase, index) => (
      <div className={`justify-center items-center gap-2.5 flex w-[calc(33%-10px)] h-10 rounded border border-current relative ring-current text-neutral-700`}>
        <span className=" text-white text-lg font-normal leading-normal w-full h-fit px-2.5 bg-transparent text-center">{phrase}</span>
        <span className="left-[6px] top-0 absolute text-current text-xs font-normal leading-normal">{index + 1}</span>
      </div>
    ))}
    <Button variant="outline">
      Add to Clipboard
    </Button>
  </div>
);

// Usage
const components = {
  SubmitButton: makeSwitchable(SubmitButtonComponent, 'submit-button'),
  SeedPhraseInput: makeSwitchable(SeedPhraseInputComponent, 'seed-phrase-input'),
  SetupAccountKey: makeSwitchable(SetupAccountKeyComponent, 'setup-account-key'),
  SeedPhraseForm: makeSwitchable(SeedPhraseFormComponent, 'seed-phrase-form'),
};

export default components;
