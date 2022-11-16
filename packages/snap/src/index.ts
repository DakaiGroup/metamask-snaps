import { OnRpcRequestHandler } from "@metamask/snap-types";

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
