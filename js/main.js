// main.js - 优化版本
document.addEventListener('DOMContentLoaded', () => {
  // 添加视频背景
  addVideoBackground();
  
  // 设置当前页面导航激活状态
  setActiveNav();
  
  // loader hide
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if(loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }
  }, 1500);

  // 滚动效果
  window.addEventListener('scroll', handleScroll);
  
  // speech toggle
  const speechBtn = document.getElementById('speechToggle');
  if(speechBtn){
    speechBtn.addEventListener('click', handleSpeechToggle);
  }

  // 卡片动画
  animateCardsOnScroll();

  // 页面特定功能
  if(window.pageName === 'index'){
    createHeroVisualization();
    setupFeatureCards();
  }
});

// 添加视频背景函数
function addVideoBackground() {
  if(document.querySelector('.video-background')) return;
  
  const videoBackground = document.createElement('div');
  videoBackground.className = 'video-background';
  videoBackground.innerHTML = `
    <video autoplay muted loop playsinline>
      <source src="images/bg.MP4" type="video/mp4">
      您的浏览器不支持视频标签。
    </video>
    <div class="video-overlay"></div>
    <div class="chinese-pattern"></div>
  `;
  
  document.body.insertBefore(videoBackground, document.body.firstChild);
  
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';
  
  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  
  if (header) contentWrapper.appendChild(header);
  if (main) contentWrapper.appendChild(main);
  if (footer) contentWrapper.appendChild(footer);
  
  document.body.appendChild(contentWrapper);
}

// 设置导航激活状态
function setActiveNav() {
  const currentPage = window.pageName;
  const navLinks = document.querySelectorAll('.nav a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage + '.html' || 
        (currentPage === 'index' && href === 'index.html') ||
        (currentPage === 'herbs' && href === 'herbs.html') ||
        (currentPage === 'evaluation' && href === 'evaluation.html') ||
        (currentPage === 'ai_doctor' && href === 'ai_doctor.html') ||
        (currentPage === 'plan' && href === 'plan.html') ||
        (currentPage === 'about' && href === 'about.html')) {
      link.classList.add('active');
    }
  });
}

// 滚动处理函数
function handleScroll() {
  const header = document.querySelector('.site-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// 卡片滚动动画
function animateCardsOnScroll() {
  const cards = document.querySelectorAll('.card, .herb-card, .ai-panel, .upload-panel');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

// 语音助手切换
function handleSpeechToggle() {
  const speechBtn = document.getElementById('speechToggle');
  if(window.speechHelper) {
    window.speechHelper.toggleSpeech();
    speechBtn.classList.toggle('active');
    
    if(speechBtn.classList.contains('active')) {
      showMessage('语音助手已开启', 'success');
    } else {
      showMessage('语音助手已关闭', 'info');
    }
  } else {
    showMessage('语音助手初始化中...', 'warning');
  }
}


// 创建首页可视化效果
function createHeroVisualization() {
  const heroRight = document.querySelector('.hero-right');
  if (!heroRight) return;

  const visualContainer = document.createElement('div');
  visualContainer.className = 'hero-visual';
  
  const canvas = document.createElement('canvas');
  canvas.width = 450;
  canvas.height = 320;
  
  visualContainer.appendChild(canvas);
  heroRight.innerHTML = '';
  heroRight.appendChild(visualContainer);

  startHarmoniousAnimation(canvas);
}

// 和谐的可视化动画
function startHarmoniousAnimation(canvas) {
  const ctx = canvas.getContext('2d');
  let t = 0;
  let herbs = [];
  let pulses = [];
 // 创建草药粒子
  for (let i = 0; i < 12; i++) {
    herbs.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 6,
      speed: Math.random() * 0.6 + 0.2,
      angle: Math.random() * Math.PI * 2,
      color: `rgba(42, 143, 122, ${Math.random() * 0.4 + 0.4})`,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  // 创建脉动效果
  function createPulse(x, y) {
    pulses.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: 50,
      speed: 1.5,
      alpha: 0.8,
      color: 'rgba(42, 143, 122, 0.25)'
    });
  }

  // 定期创建脉动
  setInterval(() => {
    if (herbs.length > 0 && Math.random() > 0.3) {
      const herb = herbs[Math.floor(Math.random() * herbs.length)];
      createPulse(herb.x, herb.y);
    }
  }, 1200);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(234, 250, 246, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制脉动效果
    pulses.forEach((pulse, index) => {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        pulse.x, pulse.y, 0,
        pulse.x, pulse.y, pulse.radius
      );
      gradient.addColorStop(0, 'rgba(42, 143, 122, 0.4)');
      gradient.addColorStop(1, 'rgba(42, 143, 122, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      pulse.radius += pulse.speed;
      if (pulse.radius > pulse.maxRadius) {
        pulses.splice(index, 1);
      }
    });

    // 绘制草药粒子
    herbs.forEach(herb => {
      herb.x += Math.cos(herb.angle) * herb.speed;
      herb.y += Math.sin(herb.angle) * herb.speed;
      herb.rotation += herb.rotationSpeed;
      herb.pulsePhase += 0.05;

      // 边界检查
      if (herb.x < -20) herb.x = canvas.width + 20;
      if (herb.x > canvas.width + 20) herb.x = -20;
      if (herb.y < -20) herb.y = canvas.height + 20;
      if (herb.y > canvas.height + 20) herb.y = -20;

      const pulseSize = Math.sin(herb.pulsePhase) * 2;
      const currentSize = herb.size + pulseSize;

      // 绘制草药
      ctx.save();
      ctx.translate(herb.x, herb.y);
      ctx.rotate(herb.rotation);
      
      ctx.fillStyle = herb.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, currentSize, currentSize * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = `rgba(42, 143, 122, 0.9)`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          Math.cos(angle) * currentSize * 1.8,
          Math.sin(angle) * currentSize * 1.8
        );
        ctx.stroke();
      }
      
      ctx.restore();
    });

    // 绘制中医太极符号
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    const glowGradient = ctx.createRadialGradient(0, 0, 45, 0, 0, 60);
    glowGradient.addColorStop(0, 'rgba(42, 143, 122, 0.3)');
    glowGradient.addColorStop(1, 'rgba(42, 143, 122, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(42, 143, 122, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.rotate(t * 0.005);
    
    ctx.fillStyle = 'rgba(42, 143, 122, 0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(0, 0, 40, Math.PI, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(-20, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(42, 143, 122, 0.6)';
    ctx.beginPath();
    ctx.arc(20, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 绘制连接线
    ctx.strokeStyle = 'rgba(42, 143, 122, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < herbs.length; i++) {
      for (let j = i + 1; j < herbs.length; j++) {
        const dx = herbs[i].x - herbs[j].x;
        const dy = herbs[i].y - herbs[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 120) {
          ctx.globalAlpha = 0.2 * (1 - distance / 120);
          ctx.beginPath();
          ctx.moveTo(herbs[i].x, herbs[i].y);
          ctx.lineTo(herbs[j].x, herbs[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    t++;
    requestAnimationFrame(draw);
  }

  draw();
}
 