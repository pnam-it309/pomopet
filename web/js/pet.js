/* ==========================================================================
   POMOPET MOBILE - Pet Canvas Renderer & Animation Engine (OOP)
   Procedural 2D Virtual Pet Canvas with Expressions & Accessories
   ========================================================================== */

class PetRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.petData = {
      species: 'cat',
      stage: 'baby',
      mood: 'happy',
      equipped_hat: '',
      level: 1
    };

    // Animation state
    this.tick = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.confetti = [];
    this.heartsContainer = document.getElementById('hearts-layer');

    this.startAnimationLoop();
  }

  updatePetData(data) {
    if (!data) return;
    this.petData = { ...this.petData, ...data };
  }

  startAnimationLoop() {
    const loop = () => {
      this.tick++;
      this.updateState();
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateState() {
    // Blinking logic
    this.blinkTimer++;
    if (this.blinkTimer > 180 + Math.sin(this.tick * 0.05) * 60) {
      this.isBlinking = true;
      if (this.blinkTimer > 195) {
        this.isBlinking = false;
        this.blinkTimer = 0;
      }
    }

    // Confetti physics
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.15; // gravity
      c.rotation += c.vRot;
      c.life--;
      if (c.life <= 0) this.confetti.splice(i, 1);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const centerX = this.width / 2;
    // Breathing & floating motion
    const breathY = Math.sin(this.tick * 0.06) * 4;
    const centerY = this.height / 2 + 15 + breathY;

    // Soft ground shadow
    this.drawShadow(centerX, centerY + 55);

    // Draw Pet Body based on Species
    switch (this.petData.species) {
      case 'dragon':
        this.drawDragon(centerX, centerY);
        break;
      case 'sprout':
        this.drawSprout(centerX, centerY);
        break;
      case 'penguin':
        this.drawPenguin(centerX, centerY);
        break;
      case 'cat':
      default:
        this.drawCat(centerX, centerY);
        break;
    }

    // Draw Equipped Hat
    if (this.petData.equipped_hat) {
      this.drawHat(centerX, centerY, this.petData.equipped_hat);
    }

    // Draw Confetti
    this.drawConfetti();
  }

  drawShadow(x, y) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 50, 10, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fill();
    this.ctx.restore();
  }

  // CAT DRAWING
  drawCat(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Tail wiggle
    const tailWiggle = Math.sin(this.tick * 0.08) * 15;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 25);
    ctx.quadraticCurveTo(x - 65, y + 10 + tailWiggle, x - 55, y - 10 + tailWiggle);
    ctx.strokeStyle = '#f6d365';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 42, 44, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(x, y - 35, x, y + 55);
    grad.addColorStop(0, '#fda085');
    grad.addColorStop(1, '#f6d365');
    ctx.fillStyle = grad;
    ctx.fill();

    // Belly patch
    ctx.beginPath();
    ctx.ellipse(x, y + 20, 24, 25, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fill();

    // Ears
    ctx.beginPath();
    ctx.moveTo(x - 34, y - 20);
    ctx.lineTo(x - 42, y - 55);
    ctx.lineTo(x - 14, y - 32);
    ctx.fillStyle = '#fda085';
    ctx.fill();

    // Inner ear
    ctx.beginPath();
    ctx.moveTo(x - 32, y - 22);
    ctx.lineTo(x - 38, y - 48);
    ctx.lineTo(x - 18, y - 30);
    ctx.fillStyle = '#ffb8b8';
    ctx.fill();

    // Right ear
    ctx.beginPath();
    ctx.moveTo(x + 34, y - 20);
    ctx.lineTo(x + 42, y - 55);
    ctx.lineTo(x + 14, y - 32);
    ctx.fillStyle = '#fda085';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 32, y - 22);
    ctx.lineTo(x + 38, y - 48);
    ctx.lineTo(x + 18, y - 30);
    ctx.fillStyle = '#ffb8b8';
    ctx.fill();

    // Eyes
    this.drawEyes(x, y - 4, 18);

    // Blushing cheeks
    this.drawCheeks(x, y + 6, 24);

    // Nose & Mouth
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 2);
    ctx.lineTo(x + 3, y + 2);
    ctx.lineTo(x, y + 5);
    ctx.closePath();
    ctx.fillStyle = '#d94f5c';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 5, y + 7, 5, 0, Math.PI, false);
    ctx.arc(x + 5, y + 7, 5, 0, Math.PI, false);
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 22, y + 4); ctx.lineTo(x - 44, y + 1);
    ctx.moveTo(x - 22, y + 8); ctx.lineTo(x - 42, y + 10);
    ctx.moveTo(x + 22, y + 4); ctx.lineTo(x + 44, y + 1);
    ctx.moveTo(x + 22, y + 8); ctx.lineTo(x + 42, y + 10);
    ctx.stroke();

    // Paws
    ctx.beginPath();
    ctx.ellipse(x - 16, y + 46, 9, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 16, y + 46, 9, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf0';
    ctx.fill();

    ctx.restore();
  }

  // DRAGON DRAWING
  drawDragon(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Dragon wings flapping
    const flap = Math.sin(this.tick * 0.1) * 8;
    ctx.beginPath();
    ctx.moveTo(x - 25, y);
    ctx.quadraticCurveTo(x - 65, y - 35 + flap, x - 50, y - 10);
    ctx.quadraticCurveTo(x - 45, y + 10, x - 25, y + 15);
    ctx.fillStyle = '#ff7675';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 25, y);
    ctx.quadraticCurveTo(x + 65, y - 35 + flap, x + 50, y - 10);
    ctx.quadraticCurveTo(x + 45, y + 10, x + 25, y + 15);
    ctx.fillStyle = '#ff7675';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 44, 46, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(x, y - 35, x, y + 55);
    grad.addColorStop(0, '#e84118');
    grad.addColorStop(1, '#c23616');
    ctx.fillStyle = grad;
    ctx.fill();

    // Golden belly plates
    ctx.beginPath();
    ctx.ellipse(x, y + 18, 22, 28, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fbc531';
    ctx.fill();

    // Horns
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 32);
    ctx.lineTo(x - 36, y - 56);
    ctx.lineTo(x - 10, y - 40);
    ctx.fillStyle = '#fbc531';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 20, y - 32);
    ctx.lineTo(x + 36, y - 56);
    ctx.lineTo(x + 10, y - 40);
    ctx.fillStyle = '#fbc531';
    ctx.fill();

    // Eyes
    this.drawEyes(x, y - 6, 18, '#2f3640', '#fbc531');
    this.drawCheeks(x, y + 4, 25);

    // Snout
    ctx.beginPath();
    ctx.ellipse(x, y + 5, 14, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#e84118';
    ctx.fill();

    // Nostril smokes
    ctx.fillStyle = '#2f3640';
    ctx.beginPath();
    ctx.arc(x - 4, y + 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 4, y + 4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // SPROUT DRAWING
  drawSprout(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Leaves on head swaying
    const leafSway = Math.sin(this.tick * 0.08) * 6;
    ctx.beginPath();
    ctx.moveTo(x, y - 35);
    ctx.quadraticCurveTo(x - 25 + leafSway, y - 65, x, y - 55);
    ctx.quadraticCurveTo(x + 25 + leafSway, y - 65, x, y - 35);
    ctx.fillStyle = '#4cd137';
    ctx.fill();

    // Sprout body
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 42, 40, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(x, y - 30, x, y + 50);
    grad.addColorStop(0, '#74b9ff');
    grad.addColorStop(1, '#a8e6cf');
    ctx.fillStyle = grad;
    ctx.fill();

    this.drawEyes(x, y - 2, 16);
    this.drawCheeks(x, y + 8, 22, 'rgba(255, 120, 150, 0.4)');

    // Smile
    ctx.beginPath();
    ctx.arc(x, y + 8, 6, 0.2, Math.PI - 0.2, false);
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  // PENGUIN DRAWING
  drawPenguin(x, y) {
    const ctx = this.ctx;
    ctx.save();

    // Body (Black back)
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 42, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2f3640';
    ctx.fill();

    // White belly
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 28, 36, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f6fa';
    ctx.fill();

    // Wings
    const wFlap = Math.sin(this.tick * 0.1) * 5;
    ctx.beginPath();
    ctx.ellipse(x - 38, y + 16 + wFlap, 10, 24, 0.3, 0, Math.PI * 2);
    ctx.ellipse(x + 38, y + 16 - wFlap, 10, 24, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#2f3640';
    ctx.fill();

    this.drawEyes(x, y - 8, 16);
    this.drawCheeks(x, y + 4, 24);

    // Beak
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 2);
    ctx.lineTo(x + 8, y + 2);
    ctx.lineTo(x, y + 10);
    ctx.closePath();
    ctx.fillStyle = '#fbc531';
    ctx.fill();

    // Feet
    ctx.beginPath();
    ctx.ellipse(x - 16, y + 52, 12, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 16, y + 52, 12, 6, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fbc531';
    ctx.fill();

    ctx.restore();
  }

  drawEyes(x, y, spacing, eyeColor = '#2f3640', iris = '#ffffff') {
    const ctx = this.ctx;
    ctx.save();

    if (this.isBlinking) {
      // Closed line eyes
      ctx.beginPath();
      ctx.arc(x - spacing, y, 6, 0.2, Math.PI - 0.2, false);
      ctx.arc(x + spacing, y, 6, 0.2, Math.PI - 0.2, false);
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else {
      // Big lively eyes
      ctx.beginPath();
      ctx.arc(x - spacing, y, 6.5, 0, Math.PI * 2);
      ctx.arc(x + spacing, y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor;
      ctx.fill();

      // Sparkles
      ctx.beginPath();
      ctx.arc(x - spacing - 2, y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(x + spacing - 2, y - 2, 2.5, 0, Math.PI * 2);
      ctx.arc(x - spacing + 2, y + 2, 1.2, 0, Math.PI * 2);
      ctx.arc(x + spacing + 2, y + 2, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = iris;
      ctx.fill();
    }
    ctx.restore();
  }

  drawCheeks(x, y, spacing, color = 'rgba(255, 107, 129, 0.4)') {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x - spacing, y, 7, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + spacing, y, 7, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // DRAW HATS
  drawHat(x, y, hatId) {
    const ctx = this.ctx;
    ctx.save();
    const hatY = y - 44;

    switch (hatId) {
      case 'hat_chef':
        // Chef toque
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 12, hatY - 14, 12, 0, Math.PI * 2);
        ctx.arc(x, hatY - 20, 14, 0, Math.PI * 2);
        ctx.arc(x + 12, hatY - 14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 16, hatY - 8, 32, 10);
        break;

      case 'hat_witch':
        // Wizard witch hat
        ctx.fillStyle = '#4834d4';
        ctx.beginPath();
        ctx.ellipse(x, hatY, 26, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 16, hatY);
        ctx.lineTo(x + 16, hatY);
        ctx.lineTo(x + 8, hatY - 32);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f9ca24';
        ctx.fillRect(x - 12, hatY - 6, 24, 4);
        break;

      case 'hat_crown':
        // Royal gold crown
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(x - 18, hatY);
        ctx.lineTo(x - 18, hatY - 16);
        ctx.lineTo(x - 9, hatY - 8);
        ctx.lineTo(x, hatY - 20);
        ctx.lineTo(x + 9, hatY - 8);
        ctx.lineTo(x + 18, hatY - 16);
        ctx.lineTo(x + 18, hatY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, hatY - 6, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hat_viking':
      default:
        // Viking helmet
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(x, hatY, 20, Math.PI, 0);
        ctx.fill();
        // Horns
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(x - 18, hatY); ctx.quadraticCurveTo(x - 30, hatY - 15, x - 25, hatY - 25);
        ctx.moveTo(x + 18, hatY); ctx.quadraticCurveTo(x + 30, hatY - 15, x + 25, hatY - 25);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  spawnHeartParticles() {
    if (!this.heartsContainer) return;
    for (let i = 0; i < 4; i++) {
      const h = document.createElement('div');
      h.className = 'floating-dot';
      h.style.left = `${45 + (Math.random() * 20 - 10)}%`;
      h.style.top = `${50 + (Math.random() * 20 - 10)}%`;
      this.heartsContainer.appendChild(h);
      setTimeout(() => h.remove(), 1000);
    }
  }

  spawnConfetti() {
    const colors = ['#f39c12', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f'];
    for (let i = 0; i < 40; i++) {
      this.confetti.push({
        x: this.width / 2,
        y: this.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 2,
        vRot: (Math.random() - 0.5) * 0.2,
        rotation: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        life: 80 + Math.random() * 40
      });
    }
  }

  drawConfetti() {
    const ctx = this.ctx;
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    }
  }
}

window.PetRenderer = PetRenderer;
