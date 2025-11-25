// 后端API基础地址 
const API_BASE = 'http://10.10.230.91:8000'; 

// 用户ID管理
function getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user_' + Date.now();
        localStorage.setItem('user_id', userId);
    }
    return userId;
}

// 对话历史管理
function getChatHistory() {
    return JSON.parse(localStorage.getItem('chat_history') || '[]');
}

function saveChatHistory(history) {
    // 只保留最近20条对话
    const limitedHistory = history.slice(-20);
    localStorage.setItem('chat_history', JSON.stringify(limitedHistory));
    return limitedHistory;
}

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    try {
        const url = `${API_BASE}${endpoint}`;
        console.log('API请求:', url, options.body);
        
        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            }
        });

        console.log('响应状态:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('API请求失败:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// 消息提示函数
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border-left: 4px solid var(--accent);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
// 导航栏管理
function setupNavigation() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const nav = document.querySelector('.nav');
    
    if (!nav) return;
    
    // 清空现有导航
    nav.innerHTML = '';
    
    // 公共页面
    const commonPages = [
        { href: '#', id: 'homeLink', text: '首页' },
        { href: 'herbs.html', text: '中药图鉴' },
        { href: 'about.html', text: '关于我们' }
    ];
    
    // 根据用户角色添加特定页面
    if (currentUser.role === 'student') {
        // 学生版特有页面
        commonPages.splice(1, 0, { href: 'ai_teacher.html', text: '百科全书' });
        commonPages.splice(2, 0, { href: 'evaluation.html', text: '个人评估' });
        commonPages.splice(3, 0, { href: 'discuss.html', text: '学生论坛' }); // 新增学生论坛
    } else if (currentUser.role === 'senior') {
        // 老年版特有页面
        commonPages.splice(1, 0, { href: 'ai_doctor.html', text: 'AI医生' });
        commonPages.splice(2, 0, { href: 'plan.html', text: '康养方案' });
    } else {
        // 未登录状态 - 只有公共页面
        // 首页链接指向主首页
        commonPages[0].href = 'index.html';
    }
    
    // 生成导航链接
    commonPages.forEach(page => {
        const link = document.createElement('a');
        link.href = page.href;
        link.textContent = page.text;
        if (page.id) {
            link.id = page.id;
        }
        nav.appendChild(link);
    });
    
    // 设置首页链接
    setupHomeNavigation();
}

// 设置首页链接（单独调用）
function setupHomeNavigation() {
    const homeLink = document.getElementById('homeLink');
    if (homeLink) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser.role === 'student') {
            homeLink.href = 'student_index.html';
        } else if (currentUser.role === 'senior') {
            homeLink.href = 'senior_index.html';
        } else {
            homeLink.href = 'index.html';
        }
    }
}

// 设置当前页面导航激活状态
function setActiveNav() {
    const currentPage = window.pageName;
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // 移除所有active类
        link.classList.remove('active');
        
        // 设置当前页面active
        if ((currentPage === 'index' && href === 'index.html') ||
            (currentPage === 'student_index' && href === 'student_index.html') ||
            (currentPage === 'senior_index' && href === 'senior_index.html') ||
            (currentPage === 'herbs' && href === 'herbs.html') ||
            (currentPage === 'about' && href === 'about.html') ||
            (currentPage === 'evaluation' && href === 'evaluation.html') ||
            (currentPage === 'ai_teacher' && href === 'ai_teacher.html') ||
            (currentPage === 'ai_doctor' && href === 'ai_doctor.html') ||
            (currentPage === 'plan' && href === 'plan.html') ||
            (currentPage === 'discuss' && href === 'discuss.html')) { // 新增学生论坛
            link.classList.add('active');
        }
    });
}
// 页面加载完成后调用
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    setActiveNav();
});