"use client";

import CharacterCard from "@/components/CharacterCard";
import Template from "@/components/Template";
import { Investigator } from "@/types/Charaeno7th";

import fugakuRairi from "@/data/sample-character/fugaku-rairi.json";
import hamuroAmana from "@/data/sample-character/hamuro-amana.json";
import hamuroMichiharu from "@/data/sample-character/hamuro-michiharu.json";
import hazamaKureha from "@/data/sample-character/hazama-kureha.json";
import kawasakiSora from "@/data/sample-character/kawasaki-sora.json";
import yamatoAkira from "@/data/sample-character/yamato-akira.json";

export default function Home() {
  const fugakuRairiJson: Investigator = fugakuRairi;
  const hamuroAmanaJson: Investigator = hamuroAmana;
  const hamuroMichiharuJson: Investigator = hamuroMichiharu;
  const hazamaKurehaJson: Investigator = hazamaKureha;
  const kawasakiSoraJson: Investigator = kawasakiSora;
  const yamatoAkiraJson: Investigator = yamatoAkira;

  const characterList = [
    { characterData: hamuroMichiharuJson },
    { characterData: hamuroAmanaJson },
    { characterData: hazamaKurehaJson },
    { characterData: yamatoAkiraJson },
    { characterData: fugakuRairiJson },
    { characterData: kawasakiSoraJson },
  ];

  return (
    <Template>
      <div className="grid gap-6 xl:grid-cols-2 grid-cols-1">
        {characterList.map((character, index) => {
          return (
            <div key={`chart-card-${index}`}>
              <CharacterCard data={character.characterData} />
            </div>
          );
        })}
      </div>
    </Template>
  );
}
