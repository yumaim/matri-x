import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Matri-X - Xアルゴリズム解析プラットフォーム";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(29,155,240,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(120,86,255,0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "200px",
            background:
              "linear-gradient(90deg, rgba(29,155,240,0.15) 0%, rgba(120,86,255,0.15) 100%)",
            borderRadius: "100px",
            filter: "blur(60px)",
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #1d9bf0 0%, #7856ff 50%, #00ba7c 100%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: "96px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Matri-X
          </div>

          {/* Gradient divider */}
          <div
            style={{
              width: "200px",
              height: "4px",
              borderRadius: "2px",
              background:
                "linear-gradient(90deg, #1d9bf0 0%, #7856ff 100%)",
              margin: "8px 0",
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 700,
              background:
                "linear-gradient(90deg, #1d9bf0, #7856ff)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.3,
            }}
          >
            Xアルゴリズム解析プラットフォーム
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 400,
              marginTop: "8px",
            }}
          >
            ソースコードから読み解く、本当のアルゴリズム
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #00ba7c 0%, #7856ff 50%, #1d9bf0 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
