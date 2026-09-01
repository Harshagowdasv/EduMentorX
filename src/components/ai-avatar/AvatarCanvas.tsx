import React, { useRef, useEffect } from 'react';

interface AvatarCanvasProps {
  emotion: 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'concerned';
  themeColor?: string; // e.g. '#6366f1' or '#a855f7'
  isSpeaking?: boolean;
}

export const AvatarCanvas: React.FC<AvatarCanvasProps> = ({
  emotion = 'idle',
  themeColor = '#6366f1',
  isSpeaking = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2 - 10;

      ctx.clearRect(0, 0, width, height);

      // 1. Dynamic Outer Glow & Halo Wave
      const pulse = Math.sin(time * 2) * 5;
      const glowGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 110 + pulse);
      glowGrad.addColorStop(0, `${themeColor}40`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 110 + pulse, 0, Math.PI * 2);
      ctx.fill();

      // 2. Avatar Head Base Shape
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Futuristic Orbit Rings
      ctx.strokeStyle = `${themeColor}60`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 80 + Math.sin(time) * 3, 25, time * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Eyes Animation
      const eyeBlink = Math.sin(time * 0.8) > 0.96 ? 2 : 10;
      let eyeColor = '#38bdf8';
      if (emotion === 'happy') eyeColor = '#34d399';
      if (emotion === 'concerned') eyeColor = '#fb7185';
      if (emotion === 'thinking') eyeColor = '#c084fc';

      ctx.fillStyle = eyeColor;
      // Left Eye
      ctx.beginPath();
      ctx.ellipse(cx - 22, cy - 10, 8, eyeBlink, 0, 0, Math.PI * 2);
      ctx.fill();
      // Right Eye
      ctx.beginPath();
      ctx.ellipse(cx + 22, cy - 10, 8, eyeBlink, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye Glow Pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 20, cy - 12, 3, 0, Math.PI * 2);
      ctx.arc(cx + 24, cy - 12, 3, 0, Math.PI * 2);
      ctx.fill();

      // 5. Animated Lip-Sync Mouth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();

      if (isSpeaking || emotion === 'speaking') {
        const mouthOpen = Math.abs(Math.sin(time * 8)) * 14 + 4;
        ctx.ellipse(cx, cy + 22, 12, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      } else if (emotion === 'happy') {
        ctx.arc(cx, cy + 16, 16, 0.1 * Math.PI, 0.9 * Math.PI, false);
      } else if (emotion === 'concerned') {
        ctx.arc(cx, cy + 28, 14, 1.1 * Math.PI, 1.9 * Math.PI, false);
      } else if (emotion === 'thinking') {
        ctx.moveTo(cx - 12, cy + 22);
        ctx.lineTo(cx + 12, cy + 18);
      } else {
        // Idle gentle smile
        ctx.arc(cx, cy + 18, 12, 0.15 * Math.PI, 0.85 * Math.PI, false);
      }
      ctx.stroke();

      // 6. Voice Wave Visualizer Bars when speaking
      if (isSpeaking || emotion === 'speaking' || emotion === 'listening') {
        const bars = 7;
        const barWidth = 4;
        const spacing = 8;
        const startX = cx - ((bars * spacing) / 2);

        for (let i = 0; i < bars; i++) {
          const h = Math.abs(Math.sin(time * 10 + i * 0.8)) * 25 + 6;
          ctx.fillStyle = themeColor;
          ctx.beginPath();
          ctx.roundRect(startX + i * spacing, cy + 65, barWidth, h, 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [emotion, themeColor, isSpeaking]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={260}
        height={240}
        className="rounded-full drop-shadow-[0_0_25px_rgba(99,102,241,0.3)]"
      />
    </div>
  );
};
