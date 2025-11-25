// 用户认证管理
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // 检查本地存储中的用户信息
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
    this.updateUI();
  }

  login(role) {
      const userData = {
          role: role,
          loginTime: new Date().toISOString(),
          isLoggedIn: true
      };
      
      this.currentUser = userData;
      localStorage.setItem('currentUser', JSON.stringify(userData));
      this.updateUI();
      
      // 更新导航栏
      if (window.setupNavigation) {
          window.setupNavigation();
          window.setActiveNav();
      }
      
      // 显示登录成功消息
      this.showToast(`成功登录${role === 'senior' ? '老年版' : '学生版'}`, 'success');
      
      // 跳转到对应版本首页
      setTimeout(() => {
          if (role === 'senior') {
              window.location.href = 'senior_index.html';
          } else if (role === 'student') {
              window.location.href = 'student_index.html';
          }
      }, 1000);
  }

  logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      this.updateUI();
      
      // 更新导航栏
      if (window.setupNavigation) {
          window.setupNavigation();
          window.setActiveNav();
      }
      
      this.showToast('已成功退出登录', 'success');
      
      // 跳转回主页面
      setTimeout(() => {
          window.location.href = 'index.html';
      }, 500);
  }

  updateUI() {
    const userInfo = document.getElementById('userInfo');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const loginSection = document.getElementById('loginSection');
    const loginBtn = document.getElementById('loginBtn');

    if (this.currentUser && this.currentUser.isLoggedIn) {
      // 用户已登录
      if (userInfo) userInfo.style.display = 'flex';
      if (loginSection) loginSection.style.display = 'none';
      if (userRoleDisplay) {
        userRoleDisplay.textContent = this.currentUser.role === 'senior' ? '老年版用户' : '学生版用户';
      }
    } else {
      // 用户未登录
      if (userInfo) userInfo.style.display = 'none';
      if (loginSection) loginSection.style.display = 'block';
    }
  }

  showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// 初始化认证管理器
document.addEventListener('DOMContentLoaded', function() {
  window.authManager = new AuthManager();
  
  // 绑定登录按钮事件
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      const modal = document.getElementById('loginModal');
      if (modal) {
        modal.style.display = 'flex';
      }
    });
  }
  
  // 绑定退出按钮事件
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (window.authManager) {
        window.authManager.logout();
      }
    });
  }
  
  // 登录模态框事件
  const modal = document.getElementById('loginModal');
  if (modal) {
    const closeModal = modal.querySelector('.close-modal');
    const cancelLogin = document.getElementById('cancelLogin');
    const confirmLogin = document.getElementById('confirmLogin');
    const loginOptions = modal.querySelectorAll('.login-option');
    
    let selectedRole = null;
    
    // 关闭模态框
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    if (cancelLogin) {
      cancelLogin.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // 选择登录身份
    loginOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 移除其他选项的选中状态
        loginOptions.forEach(opt => opt.classList.remove('selected'));
        
        // 设置当前选项为选中状态
        this.classList.add('selected');
        selectedRole = this.getAttribute('data-role');
        
        // 启用确认按钮
        if (confirmLogin) {
          confirmLogin.disabled = false;
        }
      });
    });
    
    // 确认登录
    if (confirmLogin) {
      confirmLogin.addEventListener('click', function() {
        if (selectedRole && window.authManager) {
          window.authManager.login(selectedRole);
          modal.style.display = 'none';
        }
      });
    }
  }
});