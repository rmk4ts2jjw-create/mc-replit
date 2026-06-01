// CrewSprite — canvas-drawn pixel-art agent sprite, animated via rAF.
// Renders at 320×240 internal resolution, displayed at CSS 160×120.

import { useEffect, useRef } from "react";
import { drawCrew, FRAME_W, FRAME_H, type SpritePose } from "@/lib/crew-sprites";

interface CrewSpriteProps {
  agentId: string;
  pose: SpritePose;
  /** extra CSS classes on the wrapper div */
  className?: string;
  /** display size in px — defaults to 160×120 */
  displayWidth?: number;
  displayHeight?: number;
  filter?: string;
}

export function CrewSprite({ agentId, pose, className, displayWidth = 160, displayHeight = 120, filter }: CrewSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tickRef   = useRef(0);
  const poseRef   = useRef(pose);
  const agentRef  = useRef(agentId);

  poseRef.current  = pose;
  agentRef.current = agentId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    let alive = true;
    function loop() {
      if (!alive || !canvas) return;
      ctx!.clearRect(0, 0, FRAME_W, FRAME_H);
      drawCrew(agentRef.current, ctx!, poseRef.current, 0, 0, tickRef.current);
      tickRef.current++;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { alive = false; };
  }, []);

  return (
    <div className={className} style={{ width: displayWidth, height: displayHeight, lineHeight: 0 }}>
      <canvas
        ref={canvasRef}
        width={FRAME_W}
        height={FRAME_H}
        style={{
          width: displayWidth,
          height: displayHeight,
          imageRendering: "pixelated",
          filter,
        }}
      />
    </div>
  );
}
