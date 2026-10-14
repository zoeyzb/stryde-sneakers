"use client";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import MusicStreamLine from "./MusicStreamLine";

const Header = () => {
  const color = useParams()?.slug === "white" ? "text-black" : "text-white";
  const { replace } = useRouter();
  return (
    <div className="fixed z-10 flex justify-between items-center w-full md:pt-10 pt-3 md:px-20 px-5">
      <div
        onClick={() => {
          replace("/");
        }}
        className={clsx(
           "md:w-44 w-40 h-16 flex items-center text-2xl font-bold tracking-widest cursor-pointer hover-animation ",
          color
        )}
       role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") replace("/"); }}>STRYDE</div>
      <MusicStreamLine color={color} />
    </div>
  );
};

export default Header;
