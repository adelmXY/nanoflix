import { useState } from "react";
import type { ImageAsset } from "../features/catalog";
export function Media({
  asset,
  mobileAsset,
  label,
  ratio = "wide",
  eager = false,
}: {
  asset?: ImageAsset;
  mobileAsset?: ImageAsset;
  label: string;
  ratio?: "poster" | "wide" | "hero";
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`media media-${ratio}`}>
      {asset && !failed ? (
        <picture>
          {mobileAsset && (
            <source media="(max-width: 600px)" srcSet={mobileAsset.src} />
          )}
          <img
            src={asset.src}
            alt={asset.alt}
            style={{ objectPosition: asset.position }}
            loading={eager ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />
        </picture>
      ) : (
        <div className="placeholder">
          <span>{label}</span>
          <small>Immagine non ancora disponibile</small>
        </div>
      )}
    </div>
  );
}
