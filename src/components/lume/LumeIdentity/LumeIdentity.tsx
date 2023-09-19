import React from 'react';

import LumeLogoBg from '@/assets/lume-logo-bg.svg';
import { Button } from '@/components/ui/button';
import { SwitchableComponent, SwitchableComponentProvider, useSwitchableComponent } from '@/components/SwitchableComponent';
import ComponentList from "./components";
import { LumeIdentityContext, Session } from './LumeIdentityContext';
import { LazyMotion, domAnimation } from 'framer-motion';

type Props = {}

const LumeIdentity: React.FC<Props> = ({ }) => {
  const { visibleComponent, setVisibleComponent } = useSwitchableComponent(ComponentList.SubmitButton)

  const isSubmitButtonInView = [ComponentList.SubmitButton.index].includes(visibleComponent.index)
  const isLoginWithAccountKey = [ComponentList.SeedPhraseInput.index].includes(visibleComponent.index)
  const isCreatingAccount = [ComponentList.SetupAccountKey.index].includes(visibleComponent.index)
  const isShowingSeedPhrase = [ComponentList.SeedPhraseGeneration.index].includes(visibleComponent.index)
  const isFinalStep = [ComponentList.SeedPhraseGeneration.index].includes(visibleComponent.index)
  const shouldShowBackButton = isCreatingAccount

  const coloredOrLine = isSubmitButtonInView ? 'text-primary' : 'text-border'


  return <div className="relative w-96 max-w-full inline-flex flex-col items-center justify-center gap-2.5 bg-zinc-950 px-8 py-11 transition-[height] duration-100 [&>*]:transition-all [&>*]:duration-100 overflow-hidden">
    <div className="absolute left-[168px] top-[-8px] h-64 w-[280px] overflow-hidden">
      <LumeLogoBg />
    </div>
    <div className="w-full z-10 flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col items-start justify-start gap-10">
        <h2 className="w-full text-5xl font-normal leading-14 text-white">
          {isSubmitButtonInView || isLoginWithAccountKey ? 'Sign in with Lume' : null}
          {isCreatingAccount && !isShowingSeedPhrase ? 'Set up your account key' : null}
          {isShowingSeedPhrase ? "Here's your account key" : null}
        </h2>
      </div>
      <div className="flex flex-col items-start justify-start gap-2.5">
          <LazyMotion features={domAnimation}>
            <SwitchableComponent index={visibleComponent.index}>
                <visibleComponent.render />
            </SwitchableComponent>
          </LazyMotion>
        {!isFinalStep ? <>
          <div className={`relative h-7 w-full overflow-hidden ${coloredOrLine}`}>
            <svg width="409" height="28" className="max-w-full -left-1/2" viewBox="0 0 409 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M183 13H0V14H183V13ZM224 14H409V13H224V14Z" fill="currentColor" />
              <path d="M199.75 19.0781C198.359 19.0781 197.299 18.6562 196.57 17.8125C195.841 16.9688 195.477 15.7344 195.477 14.1094C195.477 12.4896 195.839 11.2656 196.562 10.4375C197.292 9.60417 198.354 9.1875 199.75 9.1875C201.151 9.1875 202.216 9.60417 202.945 10.4375C203.674 11.2656 204.039 12.4896 204.039 14.1094C204.039 15.7344 203.674 16.9688 202.945 17.8125C202.216 18.6562 201.151 19.0781 199.75 19.0781ZM199.75 18.0234C200.729 18.0234 201.479 17.6901 202 17.0234C202.521 16.3516 202.781 15.3802 202.781 14.1094C202.781 12.8385 202.521 11.8776 202 11.2266C201.484 10.5703 200.734 10.2422 199.75 10.2422C198.771 10.2422 198.023 10.5703 197.508 11.2266C196.992 11.8776 196.734 12.8385 196.734 14.1094C196.734 15.3854 196.992 16.3568 197.508 17.0234C198.023 17.6901 198.771 18.0234 199.75 18.0234ZM206.742 19.0234C206.367 19.0234 206.18 18.9219 206.18 18.7188V9.69531C206.18 9.54948 206.214 9.44531 206.281 9.38281C206.349 9.3151 206.456 9.28125 206.602 9.28125H208.938C210.047 9.28125 210.88 9.47656 211.438 9.86719C212 10.2578 212.281 10.8802 212.281 11.7344C212.281 12.3125 212.141 12.7995 211.859 13.1953C211.583 13.5859 211.193 13.8802 210.688 14.0781V14.1328C210.958 14.2266 211.18 14.4089 211.352 14.6797C211.529 14.9453 211.724 15.3411 211.938 15.8672L213.023 18.6094C213.049 18.7031 213.062 18.7682 213.062 18.8047C213.062 18.9505 212.867 19.0234 212.477 19.0234H212.336C212.195 19.0234 212.073 19.0052 211.969 18.9688C211.87 18.9271 211.807 18.8724 211.781 18.8047L210.727 16.0781C210.591 15.724 210.432 15.4479 210.25 15.25C210.068 15.0521 209.852 14.9141 209.602 14.8359C209.352 14.7578 209.036 14.7188 208.656 14.7188H207.406V18.7188C207.406 18.9219 207.221 19.0234 206.852 19.0234H206.742ZM209.234 13.6641C209.562 13.6641 209.862 13.5859 210.133 13.4297C210.409 13.2734 210.625 13.0651 210.781 12.8047C210.943 12.5391 211.023 12.2578 211.023 11.9609C211.023 11.4141 210.857 11.0078 210.523 10.7422C210.19 10.4714 209.729 10.3359 209.141 10.3359H207.406V13.6641H209.234Z" fill="currentColor" />
            </svg>
          </div>
          <Button className="h-12 w-full" variant={isSubmitButtonInView ? undefined : 'outline'} onClick={() => setVisibleComponent(shouldShowBackButton ? ComponentList.SubmitButton : ComponentList.SetupAccountKey)}>
            <span className="text-center text-lg font-normal leading-normal">{shouldShowBackButton ? 'Go Back' : 'Create an Account'}</span>
          </Button>
        </> : null}
      </div>
    </div>
  </div>

};

export default () => {
  const [session, setSession] = React.useState<Session>();
  return <LumeIdentityContext.Provider value={{ session, setSession }}>
    <SwitchableComponentProvider>
      <LumeIdentity />
    </SwitchableComponentProvider>
  </LumeIdentityContext.Provider>
};
