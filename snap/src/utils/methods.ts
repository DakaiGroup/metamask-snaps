import { Pokemon } from "../interfaces/pokemon";
import { POKEMONS } from "./consts";

export async function getTodos() {
  const state = await wallet.request({
    method: "snap_manageState",
    params: ["get"],
  });

  if (!state || !(state as any).todos) {
    return {};
  }
  return (state as any).todos;
}

export async function saveTodos(newState: any, oldState: any) {
  await wallet.request({
    method: "snap_manageState",
    params: [
      "update",
      { todos: { ...oldState, [newState.id]: newState.todo } },
    ],
  });
}

export async function getPokemon(): Promise<{
  name: string;
  abilities: string;
}> {
  const randomPokemonName =
    POKEMONS[Math.floor(Math.random() * POKEMONS.length - 1)].toLowerCase();
  const url = "https://pokeapi.co/api/v2/pokemon/" + randomPokemonName;
  const pokemon_data = (await (await fetch(url)).json()) as Pokemon;
  const abs = pokemon_data.abilities
    .map((ability) => ability.ability.name)
    .join(" ");

  return { name: pokemon_data.name, abilities: abs };
}

export async function clearTodos() {
  const response = await wallet.request({
    method: "snap_confirm",
    params: [
      {
        prompt: `Delete remote todos?`,
        textAreaContent: "This action will delete all remotely stored todos.",
      },
    ],
  });
  if (!response) {
    return;
  }

  await wallet.request({
    method: "snap_manageState",
    params: ["clear"],
  });
}
