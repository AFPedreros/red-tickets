import { title } from "./primitives";

export const Hero = () => {
  return (
    <section
      className="relative flex h-full w-full flex-col items-start justify-center gap-4 bg-cover bg-center bg-no-repeat py-8 md:py-10"
      style={{
        backgroundImage: "url(/bg-hero.png)",
      }}
    >
      <div className="absolute h-full w-full bg-black/50" />
      <div className="z-10 inline-block w-1/2 justify-center p-6">
        <h1 className={title()}>
          Make&nbsp;
          <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
          websites regardless of your design experience.
        </h1>
      </div>
    </section>
  );
};
