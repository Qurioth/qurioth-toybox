"use client";

import { useEffect, useState } from "react";
import {
  type Connection,
  type ConnectionMap,
  type Participant,
  type StoredConnectionTable,
  TOWN_CONNECTION,
  TOWN_ID,
  connectionKey,
  createDefaultConnection,
  createInitialConnections,
  initialParticipants,
  isTownConnection,
  restoreConnectionTable,
} from "@/utils/connection-table-utils";

const STORAGE_KEY = "qurioth-toybox:trpg:connection-table";

/** コネクション表の状態と、localStorage への保存・復元を受け持つ */
export const useConnectionTable = () => {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [connections, setConnections] = useState<ConnectionMap>(() =>
    createInitialConnections(initialParticipants),
  );
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (storedValue) {
      const restoredValue = restoreConnectionTable(storedValue);

      if (restoredValue) {
        setParticipants(restoredValue.participants);
        setConnections(restoredValue.connections);
      }
    }

    setIsRestored(true);
  }, []);

  useEffect(() => {
    // 復元前に書き込むと、保存済みの内容を初期状態で上書きしてしまう
    if (!isRestored) {
      return;
    }

    const storedValue: StoredConnectionTable = {
      participants,
      connections,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedValue));
  }, [connections, isRestored, participants]);

  const updateParticipantName = (id: string, name: string) => {
    if (id === TOWN_ID) {
      return;
    }

    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === id ? { ...participant, name } : participant,
      ),
    );
  };

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: `person-${Date.now()}`,
      name: "",
    };

    setParticipants((currentParticipants) => [
      ...currentParticipants,
      newParticipant,
    ]);
    setConnections((currentConnections) => {
      const nextConnections = { ...currentConnections };

      participants.forEach((participant) => {
        nextConnections[connectionKey(participant.id, newParticipant.id)] =
          createDefaultConnection();
        nextConnections[connectionKey(newParticipant.id, participant.id)] =
          createDefaultConnection();
      });

      return nextConnections;
    });
  };

  const removeParticipant = (id: string) => {
    if (id === TOWN_ID) {
      return;
    }

    setParticipants((currentParticipants) =>
      currentParticipants.filter((participant) => participant.id !== id),
    );
    setConnections((currentConnections) =>
      Object.fromEntries(
        Object.entries(currentConnections).filter(([key]) => {
          const [fromId, toId] = key.split(":");
          return fromId !== id && toId !== id;
        }),
      ),
    );
  };

  const updateConnection = (
    fromId: string,
    toId: string,
    patch: Partial<Connection>,
  ) => {
    setConnections((currentConnections) => {
      const key = connectionKey(fromId, toId);
      const currentConnection =
        currentConnections[key] ?? createDefaultConnection();

      // 町からのつながりは内容を変更できない
      const nextConnection = isTownConnection(fromId, toId)
        ? {
            ...currentConnection,
            content: TOWN_CONNECTION.content,
            strength: patch.strength ?? currentConnection.strength,
          }
        : { ...currentConnection, ...patch };

      return { ...currentConnections, [key]: nextConnection };
    });
  };

  return {
    participants,
    connections,
    updateParticipantName,
    addParticipant,
    removeParticipant,
    updateConnection,
  };
};
