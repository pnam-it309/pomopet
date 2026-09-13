'use client';

import React, { useEffect, useRef } from 'react';
import { Pet } from '@/lib/api';

interface PetCanvasProps {
  pet: Pet | null;
  onPetClick?: () => void;
  width?: number;
  height?: number;
}

export function PetCanvas({ pet, onPetClick, width = 280, height = 240 }: PetCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;
    let blinkTimer = 0;
    let isBlinking = false;

    const render = () => {
      tick++;
      blinkTimer++;
      if (blinkTimer > 160 + Math.sin(tick * 0.05) * 50) {
        isBlinking = true;
        if (blinkTimer > 175) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const breathY = Math.sin(tick * 0.07) * 4;
      const centerY = height / 2 + 10 + breathY;

      // Soft ground shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 58, 56, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fill();
      ctx.restore();

      const species = pet?.species || 'cat';
      const stage = pet?.stage || 'baby';

      // Draw species
      switch (species) {
        case 'dragon':
          drawDragon(ctx, centerX, centerY, isBlinking, tick, stage);
          break;
        case 'sprout':
          drawSprout(ctx, centerX, centerY, isBlinking, tick, stage);
          break;
        case 'penguin':
          drawPenguin(ctx, centerX, centerY, isBlinking, tick, stage);
          break;
        case 'cat':
        default:
          drawCat(ctx, centerX, centerY, isBlinking, tick, stage);
          break;
      }

      // Draw hat if equipped
      if (pet?.equipped_hat) {
        drawHat(ctx, centerX, centerY, pet.equipped_hat);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [pet, width, height]);

  // --- CAT DRAWING ---
  function drawCat(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    blinking: boolean,
    tick: number,
    stage: string
  ) {
    ctx.save();

    // Tail wiggle
    const tailAngle = Math.sin(tick * 0.08) * 0.25;
    ctx.save();
    ctx.translate(x + 40, y + 25);
    ctx.rotate(tailAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(28, -25, 20, -45);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#FBBF24';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 44, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Belly patch
    ctx.beginPath();
    ctx.ellipse(x, y + 22, 26, 24, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FEF3C7';
    ctx.fill();

    // Ears
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#D97706';
    // Left ear
    ctx.beginPath();
    ctx.moveTo(x - 36, y - 18);
    ctx.lineTo(x - 48, y - 56);
    ctx.lineTo(x - 14, y - 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Left ear inner
    ctx.beginPath();
    ctx.moveTo(x - 33, y - 22);
    ctx.lineTo(x - 43, y - 48);
    ctx.lineTo(x - 18, y - 34);
    ctx.closePath();
    ctx.fillStyle = '#FCA5A5';
    ctx.fill();

    // Right ear
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(x + 36, y - 18);
    ctx.lineTo(x + 48, y - 56);
    ctx.lineTo(x + 14, y - 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right ear inner
    ctx.beginPath();
    ctx.moveTo(x + 33, y - 22);
    ctx.lineTo(x + 43, y - 48);
    ctx.lineTo(x + 18, y - 34);
    ctx.closePath();
    ctx.fillStyle = '#FCA5A5';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x, y - 12, 42, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#D97706';
    ctx.stroke();

    // Eyes
    drawEyes(ctx, x - 15, x + 15, y - 14, blinking, '#78350F');

    // Cheeks
    ctx.fillStyle = 'rgba(248, 113, 113, 0.45)';
    ctx.beginPath();
    ctx.ellipse(x - 25, y - 4, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 25, y - 4, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6);
    ctx.lineTo(x + 4, y - 6);
    ctx.lineTo(x, y - 2);
    ctx.closePath();
    ctx.fillStyle = '#F43F5E';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(x - 5, y - 1, 5, 0.1 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 5, y - 1, 5, 0.15 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.8;
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(x - 22, y - 6);
    ctx.lineTo(x - 42, y - 10);
    ctx.moveTo(x - 22, y - 1);
    ctx.lineTo(x - 44, y + 2);
    ctx.stroke();
    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(x + 22, y - 6);
    ctx.lineTo(x + 42, y - 10);
    ctx.moveTo(x + 22, y - 1);
    ctx.lineTo(x + 44, y + 2);
    ctx.stroke();

    // Paws
    ctx.fillStyle = '#FEF3C7';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x - 18, y + 50, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 18, y + 50, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // --- DRAGON DRAWING ---
  function drawDragon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    blinking: boolean,
    tick: number,
    stage: string
  ) {
    ctx.save();

    // Wings flapping
    const wingAngle = Math.sin(tick * 0.1) * 0.2;
    // Left wing
    ctx.save();
    ctx.translate(x - 30, y - 10);
    ctx.rotate(-wingAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-45, -35, -30, -50);
    ctx.quadraticCurveTo(-15, -35, -5, -45);
    ctx.quadraticCurveTo(0, -20, 0, 0);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(x + 30, y - 10);
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(45, -35, 30, -50);
    ctx.quadraticCurveTo(15, -35, 5, -45);
    ctx.quadraticCurveTo(0, -20, 0, 0);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 44, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#047857';
    ctx.stroke();

    // Yellow belly
    ctx.beginPath();
    ctx.ellipse(x, y + 22, 26, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();

    // Horns
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(x - 22, y - 36);
    ctx.lineTo(x - 34, y - 62);
    ctx.lineTo(x - 12, y - 44);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 22, y - 36);
    ctx.lineTo(x + 34, y - 62);
    ctx.lineTo(x + 12, y - 44);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(x, y - 14, 42, 36, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
    ctx.stroke();

    drawEyes(ctx, x - 15, x + 15, y - 16, blinking, '#064E3B');

    // Cute cute dragon snout
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 16, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#34D399';
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- SPROUT DRAWING ---
  function drawSprout(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    blinking: boolean,
    tick: number,
    stage: string
  ) {
    ctx.save();

    // Plant Leaf on head swaying
    const leafSway = Math.sin(tick * 0.08) * 0.15;
    ctx.save();
    ctx.translate(x, y - 46);
    ctx.rotate(leafSway);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-22, -28, -26, -14);
    ctx.quadraticCurveTo(-14, 2, 0, 0);
    ctx.fillStyle = '#22C55E';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(22, -28, 26, -14);
    ctx.quadraticCurveTo(14, 2, 0, 0);
    ctx.fillStyle = '#4ADE80';
    ctx.fill();
    ctx.restore();

    // Round chubby body
    ctx.beginPath();
    ctx.ellipse(x, y + 6, 44, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ECFCCB';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#84CC16';
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x - 22, y + 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 22, y + 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    drawEyes(ctx, x - 14, x + 14, y, blinking, '#365314');

    // Happy smile
    ctx.beginPath();
    ctx.arc(x, y + 10, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = '#4D7C0F';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
  }

  // --- PENGUIN DRAWING ---
  function drawPenguin(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    blinking: boolean,
    tick: number,
    stage: string
  ) {
    ctx.save();

    // Flippers
    const flipper = Math.sin(tick * 0.1) * 0.15;
    ctx.save();
    ctx.translate(x - 36, y + 8);
    ctx.rotate(-flipper);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 24, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x + 36, y + 8);
    ctx.rotate(flipper);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 24, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 42, 48, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();

    // White belly
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 30, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    drawEyes(ctx, x - 14, x + 14, y - 6, blinking, '#0F172A');

    // Beak
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 2);
    ctx.lineTo(x + 8, y + 2);
    ctx.lineTo(x, y + 12);
    ctx.closePath();
    ctx.fillStyle = '#F97316';
    ctx.fill();

    // Orange feet
    ctx.fillStyle = '#FB923C';
    ctx.beginPath();
    ctx.ellipse(x - 16, y + 54, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 54, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- EYES HELPER ---
  function drawEyes(
    ctx: CanvasRenderingContext2D,
    lx: number,
    rx: number,
    ey: number,
    blinking: boolean,
    color: string
  ) {
    if (blinking) {
      ctx.beginPath();
      ctx.moveTo(lx - 5, ey);
      ctx.lineTo(lx + 5, ey);
      ctx.moveTo(rx - 5, ey);
      ctx.lineTo(rx + 5, ey);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
      ctx.stroke();
    } else {
      // Big kawaii eyes with double catchlights
      [lx, rx].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex, ey, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex - 2, ey - 2, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ex + 2.5, ey + 2, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      });
    }
  }

  // --- ACCESSORY HATS ---
  function drawHat(ctx: CanvasRenderingContext2D, x: number, y: number, hat: string) {
    ctx.save();
    if (hat === 'wizard_hat') {
      ctx.fillStyle = '#6D28D9';
      ctx.beginPath();
      ctx.ellipse(x, y - 42, 34, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 24, y - 42);
      ctx.lineTo(x + 18, y - 90);
      ctx.lineTo(x + 24, y - 42);
      ctx.closePath();
      ctx.fill();
      // Star badge
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(x, y - 56, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'straw_hat') {
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.ellipse(x, y - 40, 42, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - 44, 20, Math.PI, 0);
      ctx.fill();
      // Red ribbon
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(x - 20, y - 46, 40, 5);
    } else if (hat === 'crown') {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(x - 22, y - 44);
      ctx.lineTo(x - 26, y - 66);
      ctx.lineTo(x - 11, y - 52);
      ctx.lineTo(x, y - 72);
      ctx.lineTo(x + 11, y - 52);
      ctx.lineTo(x + 26, y - 66);
      ctx.lineTo(x + 22, y - 44);
      ctx.closePath();
      ctx.fill();
      // Jewels
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x, y - 52, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'cap') {
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(x, y - 42, 24, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 16, y - 40, 22, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  return (
    <div
      onClick={onPetClick}
      className="relative cursor-pointer select-none transition-transform duration-200 active:scale-95 flex flex-col items-center justify-center"
      title="Nhấn để vuốt ve thú cưng!"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-[280px] h-auto drop-shadow-md"
      />
    </div>
  );
}
