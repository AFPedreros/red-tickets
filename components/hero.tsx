import { Chip } from "@nextui-org/chip";
import Image from "next/image";

import { title } from "./primitives";

import { api } from "@/lib/client-api";
import { formatDate } from "@/lib/format-date";

export const Hero = async () => {
  let matches = [];

  try {
    const response = await api.get("/v4/teams/57/matches", {
      params: {
        season: "2023",
        status: "FINISHED",
        limit: 1,
        sort: "desc",
      },
    });

    matches = response.data.matches;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[ERROR]", error);
  }

  return (
    <section
      className="relative flex h-full w-full flex-col items-start justify-center bg-cover bg-center bg-no-repeat py-8 md:py-10"
      style={{
        backgroundImage: "url(/bg-hero.png)",
      }}
    >
      <div className="absolute h-full w-full bg-black/75" />

      <div className="z-10 flex flex-col gap-8 px-6">
        <div className="z-10 flex items-center gap-4">
          <Chip color="danger" size="lg" variant="flat">
            {matches[0].competition.name}
          </Chip>{" "}
          <p>{formatDate(matches[0].utcDate)}</p>
        </div>
        <div className="z-10 flex flex-col gap-4">
          <div className="flex items-center justify-start gap-4">
            <div className="flex flex-col items-center">
              <Image
                alt="home team"
                className="size-12 rounded-full"
                height={48}
                src={matches[0].homeTeam.crest}
                width={48}
              />
              <span>{matches[0].homeTeam.shortName}</span>
            </div>
            <span className="text-2xl font-bold">
              {matches[0].score.fullTime.home} :{" "}
              {matches[0].score.fullTime.away}
            </span>
            <div className="flex flex-col items-center">
              <Image
                alt="away team"
                className="size-12 rounded-full"
                height={48}
                src={matches[0].awayTeam.crest}
                width={48}
              />
              <span>{matches[0].awayTeam.shortName}</span>
            </div>
          </div>
        </div>
        <div className="z-10 inline-block w-1/2 justify-center">
          <h1 className={title()}>
            Buy your tickets for the next match on the official{" "}
            <span className="text-[#E30613]">Arsenal FC</span> website using
            blockchain technology.
          </h1>
        </div>
      </div>
    </section>
  );
};
