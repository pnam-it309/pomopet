'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { PetCanvas } from './PetCanvas';
import { Heart, Apple, Sparkles, Zap, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PetCard() {
  const { pet, patPet, feedPet, profile, isAuthenticated } = useApp();

  const handlePat = () => {
    patPet();
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.65 },
      colors: ['#F43F5E', '#FB7185', '#FDA4AF'],
    });
  };

  const handleQuickFeed = () => {
    // Look for food item in inventory or feed default apple
    const foodItem = profile?.inventory?.find(
      (i) => i.item?.category === 'food' && i.quantity > 0
    );
    feedPet(foodItem ? foodItem.item_id : 'apple');
  };

  const expPercentage = pet && pet.max_exp > 0 ? Math.min(100, (pet.exp / pet.max_exp) * 100) : 0;
  const hunger = pet ? pet.hunger : 80;
  const energy = pet ? pet.energy : 90;
  const mood = pet ? pet.mood : 'happy';

  const speciesNames: Record<string, string> = {
    cat: 'Mèo Mochi',
    dragon: 'Rồng Con',
    sprout: 'Bé Mầm',
    penguin: 'Cánh Cụt Pingu',
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-rose-100 shadow-xl shadow-rose-900/5 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between relative z-10 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-slate-800">
              {pet?.name || speciesNames[pet?.species || 'cat'] || 'Thú cưng'}
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Lv.{pet?.level || 1}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 capitalize">
            {pet?.stage || 'Giai đoạn em bé'} • Tâm trạng: {mood}
          </p>
        </div>

        {/* EXP Progress Bar */}
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400">
            {pet?.exp || 0}/{pet?.max_exp || 100} EXP
          </span>
          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden mt-0.5 border border-slate-200">
            <div
              className="h-full bg-linear-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${expPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pet Interactive Canvas */}
      <div className="py-2 flex justify-center relative">
        <PetCanvas pet={pet} onPetClick={handlePat} width={260} height={220} />
      </div>

      {/* Pet Vitals Meters */}
      <div className="grid grid-cols-2 gap-2 mt-1 relative z-10">
        {/* Hunger Bar */}
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Apple className="w-3.5 h-3.5 text-rose-500" />
              <span>Độ no</span>
            </span>
            <span className="text-rose-600">{hunger}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, hunger)}%` }}
            />
          </div>
        </div>

        {/* Energy Bar */}
        <div className="bg-slate-50 border border-slate-100 p-2 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Năng lượng</span>
            </span>
            <span className="text-amber-600">{energy}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, energy)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div className="flex items-center gap-2 mt-3 relative z-10">
        <button
          onClick={handlePat}
          className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
        >
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>Vuốt ve (+Tâm trạng)</span>
        </button>
        <button
          onClick={handleQuickFeed}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs"
        >
          <Apple className="w-4 h-4 text-amber-600" />
          <span>Cho ăn (+No nê)</span>
        </button>
      </div>
    </div>
  );
}
