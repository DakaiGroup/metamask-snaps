import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import snapCfg from "../snap.config";
import snapManifest from "../snap.manifest.json";
import { connectWallet, invokeSnap } from "../utils/snap";

export default function Home() {
  const [snapId, setSnapId] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const id =
      window.location.hostname === "localhost"
        ? `local:${window.location.protocol}//${window.location.hostname}:${snapCfg.cliOptions.port}`
        : `npm:${snapManifest.source.location.npm.packageName}`;
    setSnapId(id);
  }, []);

  const handleClick = async () => {
    if (!window || !window.ethereum) {
      return;
    }
    try {
      await invokeSnap(snapId, "hello");
    } catch (error) {
      console.error(error);
    }
  };

  const handleConnectMetamask = async () => {
    if (!window || !window.ethereum) {
      return;
    }
    try {
      await connectWallet(snapId);
    } catch (error) {
      console.error("Failed to connect wallet", error);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.tsx</code>
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Authorize</h2>
            <p>Connect your metamask wallet and install snap</p>
            <button onClick={handleConnectMetamask}>Connect Metamask</button>
          </div>
          <div className={styles.card}>
            <h2>Send message </h2>
            <p>Find in-depth information about Next.js features and API.</p>
            <button onClick={handleClick}>Press me</button>
          </div>
        </div>
      </main>
    </div>
  );
}
