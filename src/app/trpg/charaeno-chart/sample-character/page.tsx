"use client";

import CharacterCard from "@/components/CharacterCard";
import Template from "@/components/Template";
import { Investigator } from "@/types/Charaeno7th";

import abbeyPriestly from "@/data/abbey-priestly.json";
import alisaSolera from "@/data/alisa-solera.json";
import hamuroAmana from "@/data/hamuro-amana.json";
import hamuroMichiharu from "@/data/hamuro-michiharu.json";
import hazamaKureha from "@/data/hazama-kureha.json";
import ibaRena from "@/data/iba-rena.json";
import josephineGrimaldi from "@/data/josephine-grimaldi.json";
import kawasakiSora from "@/data/kawasaki-sora.json";
import kotoneTsuyu from "@/data/kotone-tsuyu.json";
import kushitaTaiga from "@/data/kushita-taiga.json";
import uedaKumiko from "@/data/ueda-kumiko.json";
import yamatoAkira from "@/data/yamato-akira.json";

export default function Home() {
  const abbeyPriestlyJson: Investigator = abbeyPriestly;
  const alisaSoleraJson: Investigator = alisaSolera;
  const hamuroAmanaJson: Investigator = hamuroAmana;
  const hamuroMichiharuJson: Investigator = hamuroMichiharu;
  const hazamaKurehaJson: Investigator = hazamaKureha;
  const ibaRenaJson: Investigator = ibaRena;
  const josephineGrimaldiJson: Investigator = josephineGrimaldi;
  const kawasakiSoraJson: Investigator = kawasakiSora;
  const kotoneTsuyuJson: Investigator = kotoneTsuyu;
  const kushitaTaigaJson: Investigator = kushitaTaiga;
  const uedaKumikoJson: Investigator = uedaKumiko;
  const yamatoAkiraJson: Investigator = yamatoAkira;

  const characterList = [
    { characterData: abbeyPriestlyJson },
    { characterData: alisaSoleraJson },
    { characterData: hamuroAmanaJson },
    { characterData: hamuroMichiharuJson },
    { characterData: hazamaKurehaJson },
    { characterData: ibaRenaJson },
    { characterData: josephineGrimaldiJson },
    { characterData: kawasakiSoraJson },
    { characterData: kotoneTsuyuJson },
    { characterData: kushitaTaigaJson },
    { characterData: uedaKumikoJson },
    { characterData: yamatoAkiraJson },
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
