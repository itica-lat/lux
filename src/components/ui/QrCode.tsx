import QRCode from "react-qr-code";

interface QrCodeProps {
  value: string;
  size?: number;
  label?: string;
}

export function QrCode({ value, size = 128, label }: QrCodeProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-xl">
        <QRCode value={value} size={size} />
      </div>
      {label && (
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
