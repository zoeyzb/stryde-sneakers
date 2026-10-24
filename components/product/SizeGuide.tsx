"use client";

import { useState } from "react";

const TOPS = [
  { size: "XS", chest: 54, length: 66, sleeve: 21 },
  { size: "S", chest: 57, length: 68, sleeve: 22 },
  { size: "M", chest: 60, length: 70, sleeve: 23 },
  { size: "L", chest: 63, length: 72, sleeve: 24 },
  { size: "XL", chest: 66, length: 74, sleeve: 25 },
];
const PANTS = [
  { size: "XS", waist: 72, hip: 100, inseam: 72 },
  { size: "S", waist: 76, hip: 104, inseam: 74 },
  { size: "M", waist: 80, hip: 108, inseam: 76 },
  { size: "L", waist: 84, hip: 112, inseam: 78 },
  { size: "XL", waist: 88, hip: 116, inseam: 80 },
];
const fmt = (value: number, unit: "cm" | "in") => unit === "cm" ? String(value) : (value / 2.54).toFixed(1);

export default function SizeGuide({ productType }: { productType: string }) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const pants = productType === "Pants";

  return (
    <details className="group border-y border-line py-4">
      <summary className="flex justify-between items-center cursor-pointer list-none text-xs text-ivory underline underline-offset-4">
        Size & fit guide
        <span className="text-mist group-open:rotate-45 transition-transform no-underline" aria-hidden>+</span>
      </summary>
      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <p className="eyebrow text-mist">Garment measurements</p>
          <div className="flex border border-line" role="group" aria-label="Measurement unit">
            {(["cm", "in"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={unit === value}
                className={`text-xs px-3 py-2 uppercase ${unit === value ? "bg-ivory text-ink" : "text-mist"}`}
                onClick={() => setUnit(value)}
              >{value}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tabular-nums" aria-label={`Illustrative ${productType.toLowerCase()} sizing in ${unit}`}>
            <thead className="border-y border-line text-mist">
              <tr>
                <th scope="col" className="py-3 pr-4">Size</th>
                <th scope="col" className="py-3 pr-4">{pants ? "Waist" : "Chest width"}</th>
                <th scope="col" className="py-3 pr-4">{pants ? "Hip" : "Length"}</th>
                <th scope="col" className="py-3">{pants ? "Inseam" : "Sleeve"}</th>
              </tr>
            </thead>
            <tbody>
              {pants ? PANTS.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <th scope="row" className="py-3">{row.size}</th>
                  <td>{fmt(row.waist, unit)}</td><td>{fmt(row.hip, unit)}</td><td>{fmt(row.inseam, unit)}</td>
                </tr>
              )) : TOPS.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <th scope="row" className="py-3">{row.size}</th>
                  <td>{fmt(row.chest, unit)}</td><td>{fmt(row.length, unit)}</td><td>{fmt(row.sleeve, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-6 text-mist">
          Illustrative measurements for this demo, not final manufactured specifications.
          For tops, chest width is measured flat across the garment. Compare against a piece you own.
        </p>
      </div>
    </details>
  );
}
