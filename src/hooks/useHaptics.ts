import { useWebHaptics } from "web-haptics/react";

export function useHaptics() {
  return useWebHaptics();
}

// En su momento se planteo integrar webhaptics mediante la libreria pero esta fue "destruida" por apple al parchear el exploit que permitia usarla, por lo que quedo en desuso.