import clipboard from "clipboard-polyfill";

/**
 * Wraps Clipboard.writeText() with permission check if necessary
 * @param string - The string to be written to the clipboard.
 * @todo better error management
 */
export const writeTextToClipboard = (string: string) => {
  const write = () => clipboard.writeText(string);
  if (navigator.permissions) {
    navigator.permissions
      .query({
        name: "clipboard-read"
      })
      .then(readClipboardStatus => {
        if (readClipboardStatus.state) {
          write();
        }
      });
  } else {
    write();
  }
};
