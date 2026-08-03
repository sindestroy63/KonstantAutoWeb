/** Set KONSTANT_UI_VERSION=v1 and restart the app to restore the V1 presentation. */
export const USE_UI_V2 = process.env.KONSTANT_UI_VERSION?.toLowerCase() !== "v1";
