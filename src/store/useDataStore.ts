import { create } from "zustand";

// define the structure of the data
interface DataState {
  title: string;
  author: string;
  summary: string;
  notes: string;
  chapterTitle: string;
  chapterNumber: number;
  storyData: string;
  renderedStory: string;
  customSectionBreak: string;
  customSectionBreakStyle: string;
  setTitle: (newTitle: string) => void;
  setAuthor: (newAuthor: string) => void;
  setSummary: (newSummary: string) => void;
  setNotes: (newNotes: string) => void;
  setChapterTitle: (newChapterTitle: string) => void;
  setChapterNumber: (newChapterNumber: number) => void;
  setStoryData: (newStoryData: string) => void;
  setRenderedStory: (newRenderedStory: string) => void;
  setCustomSectionBreak: (newCustomSectionBreak: string) => void;
  setCustomSectionBreakStyle: (newCustomSectionBreakStyle: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
  title: "",
  author: "",
  summary: "",
  notes: "",
  chapterTitle: "",
  chapterNumber: 0,
  storyData: "",
  renderedStory: "",
  customSectionBreak: "",
  customSectionBreakStyle: "",
  setTitle: (newTitle: string) => set({ title: newTitle }),
  setAuthor: (newAuthor: string) => set({ author: newAuthor }),
  setSummary: (newSummary: string) => set({ summary: newSummary }),
  setNotes: (newNotes: string) => set({ notes: newNotes }),
  setChapterTitle: (newChapterTitle: string) =>
    set({ chapterTitle: newChapterTitle }),
  setChapterNumber: (newChapterNumber: number) =>
    set({ chapterNumber: newChapterNumber }),
  setStoryData: (newStoryData: string) => set({ storyData: newStoryData }),
  setRenderedStory: (newRenderedStory: string) =>
    set({ renderedStory: newRenderedStory }),
  setCustomSectionBreak: (newCustomSectionBreak: string) =>
    set({ customSectionBreak: newCustomSectionBreak }),
  setCustomSectionBreakStyle: (newCustomSectionBreakStyle: string) =>
    set({ customSectionBreakStyle: newCustomSectionBreakStyle }),
}));
