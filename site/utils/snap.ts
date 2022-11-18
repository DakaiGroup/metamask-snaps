export const connectWallet = async (snapId: string) =>
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

export const invokeSnap = async (
  snapId: string,
  method: string,
  params: any = {}
) =>
  await window?.ethereum?.request({
    method: "wallet_invokeSnap",
    params: [
      snapId,
      {
        method,
        params,
      },
    ],
  });
