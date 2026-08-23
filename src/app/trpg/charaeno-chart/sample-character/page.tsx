"use client";

import CharacterCard from "@/components/CharacterCard";
import Template from "@/components/Template";
import type { Investigator } from "@/types/Charaeno7th";
import { toCardDataFrom7th } from "@/utils/character-card-utils";

import fugakuRairi from "@/data/sample-character/fugaku-rairi.json";
import hamuroAmana from "@/data/sample-character/hamuro-amana.json";
import hamuroMichiharu from "@/data/sample-character/hamuro-michiharu.json";
import hazamaKureha from "@/data/sample-character/hazama-kureha.json";
import kawasakiSora from "@/data/sample-character/kawasaki-sora.json";
import yamatoAkira from "@/data/sample-character/yamato-akira.json";

export default function SampleCharacterPage() {
  const fugakuRairiJson: Investigator = fugakuRairi;
  const hamuroAmanaJson: Investigator = hamuroAmana;
  const hamuroMichiharuJson: Investigator = hamuroMichiharu;
  const hazamaKurehaJson: Investigator = hazamaKureha;
  const kawasakiSoraJson: Investigator = kawasakiSora;
  const yamatoAkiraJson: Investigator = yamatoAkira;

  // サンプルは7版のみ。カードは版に依存しない形しか受け取らないので、変換を通してから渡す
  const characterList = [
    hamuroMichiharuJson,
    hamuroAmanaJson,
    hazamaKurehaJson,
    yamatoAkiraJson,
    fugakuRairiJson,
    kawasakiSoraJson,
  ].map((investigator) => ({ characterData: toCardDataFrom7th(investigator) }));

  return (
    <Template>
      <div className="grid gap-6 xl:grid-cols-2 grid-cols-1">
        {characterList.map((character) => {
          return (
            <div key={character.characterData.name}>
              <CharacterCard data={character.characterData} />
            </div>
          );
        })}
      </div>
    </Template>
  );
}
