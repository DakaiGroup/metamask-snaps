import { FormEvent, useState } from "react";
import { useSnapId } from "../hooks/useSnapId";
import styles from "../styles/Home.module.css";
import { connectWallet, invokeSnap } from "../utils/snap";

export default function Home() {
  const [todos, setTodos] = useState<{ id: string; todo: string }[]>([]);
  const [todoText, setTodoText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const snapId = useSnapId();

  const handleClick = async () => {
    try {
      await invokeSnap(snapId, "hello");
    } catch (error) {
      console.error(error);
    }
  };

  const handlePokemon = async () => {
    try {
      await invokeSnap(snapId, "get_pokemon");
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnectMetamask = async () => {
    try {
      await connectWallet(snapId);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  };

  async function saveTodo(e: FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const todoId = todoText + Math.floor(Math.random() * 1000);
      await invokeSnap(snapId, "save_todo", { id: todoId, todo: todoText });
      setTodos((prev) => [...prev, { id: todoId, todo: todoText }]);
    } catch (error) {
      console.error("Failed to save todo", error);
    }
  }

  async function getTodos() {
    try {
      const response = await invokeSnap(snapId, "get_todos");
      if (response !== undefined) {
        setTodos(
          Object.entries(response as { [key: string]: string }).map(
            ([key, value]) => ({ id: key, todo: value })
          )
        );
      }
    } catch (error) {
      console.log("Failed to get remote todos", error);
    }
  }

  async function clearTodos() {
    try {
      await invokeSnap(snapId, "clear_todos");
    } catch (error) {
      console.error("Failed to clear remote todos", error);
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span>Metamask Snaps Test!</span>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
          {" and "}
          <code className={styles.code}>packages/snap/src/index.ts</code>
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Authorize</h2>
            <p>Connect your metamask wallet and install snap</p>
            <button onClick={handleConnectMetamask}>
              {isConnected ? "Reconnect " : "Connect "} Metamask
            </button>
          </div>
          <div className={styles.card}>
            <h2>Send message </h2>
            <p>Send a 'hello world' message through metamask</p>
            <button disabled={!isConnected} onClick={handleClick}>
              Press me
            </button>
          </div>
          <div className={styles.card}>
            <h2>Get Pokemon </h2>
            <p>Get some data about a random pokemon</p>
            <button disabled={!isConnected} onClick={handlePokemon}>
              Press me
            </button>
          </div>
          <div className={styles.card}>
            <h2>Remote Todos </h2>
            <p>Metamask keeps stored data even on page refresh</p>
            <button disabled={!isConnected} onClick={getTodos}>
              Press me
            </button>
            <button disabled={!isConnected} onClick={clearTodos}>
              Clear
            </button>
          </div>
          <div className={styles.card}>
            <h2>Local Todos</h2>
            <p>These are lost on page refresh</p>
            <ul>
              {todos.map((todo) => (
                <li key={todo.id}>{todo.todo}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <h2>Save Todo </h2>
            <p>Save todo to metamask and local state</p>
            <form onSubmit={saveTodo}>
              <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                disabled={!isConnected}
              />
              <button disabled={!isConnected} type="submit">
                Save
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
