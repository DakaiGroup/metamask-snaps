# Metamask Snaps Test

This is a `next.js` app made to showcase some of the basic functionality of Metamask Snaps

## Getting Started

Clone the repository by `git clone https://github.com/SticketInya/snap-test.git`

Install all packages

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx` and `packages/snap/src/index.ts`

## Start your own project

### Requirements

- [Metamask Flask](https://metamask.io/flask/) installed (Metamask uninstalled or disabled)

### Setup

#### Install Metamask packages

```bash
yarn add -D @metamask/snaps-cli @metamask/snap-types @metamask/eslint-config @metamask/eslint-config-nodejs @metamask/eslint-config-typescript
```

#### Create required files

Create a `snap.config.js` and a `snap.manifest.json` file in your project directory. These are required files and your snaps won`t even start without them.

Sample `snap.config.js` file:

```js
module.exports = {
  cliOptions: {
    port: 8082, //Can be any free port
    dist: "dist",
    outfileName: "bundle.js",
    src: "./packages/snap/src/index.ts", //If you structure your snap files differently, be sure to update this to the relevant path
  },
};
```

Sample `snap.manifest.json` file:

```json
{
  "version": "0.1.0",
  "description": "Your description",
  "proposedName": "Your snap`s name",
  "source": {
    "shasum": "hash of the package", //Managed and updated by mm-cli
    "location": {
      "npm": {
        "filePath": "dist/bundle.js",
        "packageName": "your-package-name",
        "registry": "https://registry.npmjs.org/"
      }
    }
  },
  "initialPermissions": {
    "snap_confirm": {}
  },
  "manifestVersion": "0.1"
}
```

You can read more about the structure of snaps in the [MetaMask Docs](https://docs.metamask.io/guide/snaps-development-guide.html#the-anatomy-of-a-snap)

#### Add types and type definitons

Add the following line to your `tsconfig.json`.

```json
 "files": ["./node_modules/@metamask/snap-types/global.d.ts"],
```

Without this, typescript won't be able to recognize the `wallet` object provided by `snap-types`.

Create a `global.d.ts` file in your project directory and add the following code:

```ts
import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
```

This will tell typescript that there is an `ethereum` object on the `window` global, provided by Metamask.

#### Scripts

To run both a `next.js developer server` and the `snaps node server` you have to add two simple scripts to the `package.json` file.

```json
"dev": "next dev & yarn watch",
"watch": "mm-snap watch"
```

Now you can start your servers with

```bash
yarn dev
```

#### JSON-RPC

Snaps communicate with your `dapp` through a protocol called `JSON-RPC`. A `JSON-RPC` call consists of 3 main properties.

1. `method`: This is a string refering to the called remote procidure.
2. `params`: This can be an Object or an Array sent to the called remote function.
3. `id`: This is a number or string

### Hello World

To get a basic `hello word` to work, you have to know the `snapId`. Paste the following code to the page of your application to set it dynamically on the first render of the page.

```tsx
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
```

With the `snapId` acquired you can connect the user's metamask wallet to your application. The following code will connect your user and install your snap.

```tsx
const handleConnectMetamask = async () => {
  try {
    await window?.ethereum?.request({
      method: "wallet_enable",
      params: [
        {
          wallet_snap: {
            [snapId]: {},
          },
        },
      ],
    });
  } catch (error) {
    console.error("Failed to connect wallet", error);
  }
};
```

> Snaps require a reinstall on changes. So when, in the future, you make changes to your snap reconnect and reinstall it for the changes to properly take effect.

To create your first method create/navigate to the `packages/snap/src/index.ts` file and paste the following code.

```ts
import { OnRpcRequestHandler } from "@metamask/snap-types";

export const onRpcRequest: OnRpcRequestHandler = async () => {
  //Your snap code...
};
```

Get the request object from the function arguments and add a `switch` statement evaluating the `request.method`.

```ts
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case "hello":
      return "World";
    default:
      throw new Error("Method not found.");
  }
};
```

With that done, your snap is ready to be called. Navigate back to `pages/index.tsx` file and add the following function call.

```tsx
const handleClick = async () => {
  try {
    const response = await window?.ethereum?.request({
      method: "wallet_invokeSnap",
      params: [
        snapId,
        {
          method: "hello",
        },
      ],
    });
    window.alert(response);
  } catch (error) {
    console.error(error);
  }
};
```

Assign the function to a `click` event and restart your development server. Reconnect metamask, install your snap and hit the button. You should see an alert popup containing your response message `World`.

#### Send Data to your snap

You can also send data to your snap through the params property of the `JSON-RPC` call.

First, add the params property and pass some data into it. The second element of the params array is also a `JSON-RPC` request object, so you can send data to your snap with it.

```tsx
const handleClick = async () => {
  try {
    const response = await window?.ethereum?.request({
      method: "wallet_invokeSnap",
      params: [
        snapId,
        {
          method: "hello",
          params: { hello: "world" },
        },
      ],
    });
    window.alert(response);
  } catch (error) {
    console.error(error);
  }
};
```

Now head back to your snap source file and modify it to use the passed data. You can acces the sent data through `request.params`.

```ts
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case "hello":
      const { hello } = request.params as { hello: string };
      return `Hello, ${hello} !`;
    default:
      throw new Error("Method not found.");
  }
};
```

Thats it! Restart your application and you should see `"Hello, world !"` alerted when clicking the button.

#### Use built in RPCs

You can use built in RPC to ask confirmation, manage state and so on. All you need to do is to call them in your snap.

```ts
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
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
    default:
      throw new Error("Method not found.");
  }
};
```

The `snap_confirm` method returns a `true` or `false` depending on if the user has approved or denied your confirmation.

```ts
case "hello":
    const isApproved = await wallet.request({
    method: "snap_confirm",
    params: [
        {
        prompt: `Hello, World?`,
        },
    ],
    });
    return isApproved ? "Hello" : "World";
```

#### Manage State

You can also manage state with the built in `snap_manageState` RPC. You can use `update`,`get` and `clear` parameter to perform state operations.

```ts
case "save_state":
    const {state} = request.params;
    await wallet.request({
        method:"snap_manageState",
        params:["update", {state}]
    });
    return "OK";

case "get_state":
    const state = await waller.request({
        method:"snap_manageState",
        params:["get"]
    });
    return state;

case "clear_state":
    await wallet.request({
        method:"snap_manageState",
        params:["clear"]
    });
    return "OK";
```

You can read more about built in methods in the [MetaMask Docs](https://docs.metamask.io/guide/snaps-rpc-api.html#unrestricted-methods)

#### Use 3rd party API data

You can call webAPIs in your snap as well. First, you need to ask for `network-access` permission. This needs to happen when installing the snap, so you need to add `endowment:network-access` to your `snap.manifest.json`'s `initialPermissions` property.

```json
"initialPermissions": {
    "snap_confirm": {},
    "endowment:network-access": {}
  }
```

With the permission added, you can use `fetch` in your snap to interact with any API.

```ts
case "pikachu":
    const { name } = await (
    await fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
    ).json();
    return name;
```

You can read more about the execution environment and globals in the [MetaMask Docs](https://docs.metamask.io/guide/snaps-development-guide.html#developing-a-snap)

## Useful links and resources

- [MetaMask Snaps Monorepo](https://github.com/MetaMask/snaps-monorepo/discussions/675)
- [MetaMask Docs](https://docs.metamask.io/guide/snaps.html#introduction)
