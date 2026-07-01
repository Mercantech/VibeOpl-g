import QRCode from "react-qr-code";
import "./DiscordQrCode.css";

interface Props {
  url: string;
  size?: number;
  label?: string;
}

export function DiscordQrCode({ url, size = 160, label = "Scan for at joinne Discord" }: Props) {
  if (!url || url === "#") return null;

  return (
    <div className="discord-qr">
      <div className="discord-qr-code" aria-hidden="true">
        <QRCode
          value={url}
          size={size}
          bgColor="#ffffff"
          fgColor="#0f1419"
          level="M"
        />
      </div>
      <p className="discord-qr-label">{label}</p>
    </div>
  );
}
