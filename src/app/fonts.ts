import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";

export const gilroy = localFont({
  variable: "--font-gilroy",
  display: "swap",
  src: [
    { path: "./fonts/Gilroy-Light.woff", weight: "400", style: "normal" },
    { path: "./fonts/Gilroy-Semibold.woff", weight: "600", style: "normal" },
    { path: "./fonts/Gilroy-Bold.woff", weight: "700", style: "normal" },
    { path: "./fonts/Gilroy-Heavy.woff", weight: "800", style: "normal" },
  ],
});

export const monument = localFont({
  variable: "--font-monument",
  display: "swap",
  src: [{ path: "./fonts/MonumentExtended-Ultrabold.otf", weight: "800", style: "normal" }],
});

export const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
