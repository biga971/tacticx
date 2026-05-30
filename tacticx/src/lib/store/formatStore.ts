import { create } from 'zustand'

export type Format = 'vgc' | '3v3'

interface FormatState {
  format: Format
  setFormat: (format: Format) => void
}

/** Global VGC/Singles toggle shared across every main screen. */
export const useFormatStore = create<FormatState>((set) => ({
  format: 'vgc',
  setFormat: (format) => set({ format }),
}))
