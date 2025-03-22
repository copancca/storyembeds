import { create } from "zustand";
import { PhoneData } from "../types/Phone";
import { TwitterData } from "../types/Twitter";
import { InstaData } from "../types/Instagram";

// define the structure of the config data
interface ConfigState {
  rawConfig: string;
  twitterData: TwitterData | null;
  instaData: InstaData | null;
  phoneData: PhoneData | null;
  workskin: boolean;
  output: string;
  storyData: string;
  renderedStory: string;
  toggleWorkSkin: () => void;
  setRawConfig: (newConfig: string) => void;
  setTwitterData: (newData: TwitterData) => void;
  setInstaData: (newData: any) => void;
  setPhoneData: (newData: any) => void;
  setOutput: (newOutput: string) => void;
  setStoryData: (newStoryData: string) => void;
  setRenderedStory: (newRenderedStory: string) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  rawConfig: "",
  twitterData: null,
  instaData: null,
  phoneData: null,
  workskin: true,
  output: "",
  storyData: "",
  renderedStory: "",
  toggleWorkSkin: () => set((state) => ({ workskin: !state.workskin })),
  setRawConfig: (newConfig) => set({ rawConfig: newConfig }),
  setTwitterData: (newData) => set({ twitterData: newData }),
  setInstaData: (newData) => set({ instaData: newData }),
  setPhoneData: (newData) => set({ phoneData: newData }),
  setOutput: (newOutput) => set({ output: newOutput }),
  setStoryData: (newStoryData) => set({ storyData: newStoryData }),
  setRenderedStory: (newRenderedStory) =>
    set({ renderedStory: newRenderedStory }),
}));
