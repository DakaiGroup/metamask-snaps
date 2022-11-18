import { OnRpcRequestHandler } from "@metamask/snap-types";
import { clearTodos, getPokemon, getTodos, saveTodos } from "./utils/methods";

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const state = await getTodos();
  switch (request.method) {
    case "hello":
      return wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: `Hello, World!`,
          },
        ],
      });
    case "get_pokemon":
      const pokemon = await getPokemon();
      return wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: `Pokemon, ${pokemon.name}`,
            textAreaContent: "It's abilities are: " + pokemon.abilities,
          },
        ],
      });
    case "save_todo":
      const { id, todo } = request.params as { id: string; todo: string };
      const newState = { id, todo };
      await saveTodos(newState, state);
      return "OK";
    case "get_todos":
      const showTodos = await wallet.request({
        method: "snap_confirm",
        params: [
          {
            prompt: "Confirm todo request?",
            description: "Do you want to replace local todos with remote ones?",
          },
        ],
      });
      if (!showTodos) {
        return undefined;
      }
      return state;
    case "clear_todos":
      await clearTodos();
      return "OK";
    default:
      throw new Error("Method not found.");
  }
};
