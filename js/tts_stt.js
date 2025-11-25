// tts_stt.js - 文本转语音和语音识别功能
class SpeechHelper {
    constructor() {
        this.synth = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.isSpeaking = false;
        this.utterance = null;
        this.speechControlModal = null;
        
        this.initSpeechRecognition();
        this.createSpeechControlModal();
    }
    
    // 初始化语音识别
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'zh-CN';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateSpeechButton();
                showMessage('语音识别已开始，请说话...', 'info');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateSpeechButton();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                showMessage(`识别结果: ${transcript}`, 'success');
                this.handleVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                this.isListening = false;
                this.updateSpeechButton();
                showMessage(`语音识别错误: ${event.error}`, 'error');
            };
        } else {
            console.warn('浏览器不支持语音识别功能');
            showMessage('您的浏览器不支持语音识别功能', 'warning');
        }
    }
    
    // 创建语音控制弹窗
    createSpeechControlModal() {
        this.speechControlModal = document.createElement('div');
        this.speechControlModal.id = 'speechControlModal';
        this.speechControlModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            display: none;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            min-width: 200px;
            text-align: center;
            border: 2px solid #4CAF50;
        `;
        
        const title = document.createElement('div');
        title.textContent = '语音朗读中...';
        title.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            color: #333;
        `;
        
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '终止朗读';
        stopBtn.style.cssText = `
            background: #ff4757;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        `;
        
        stopBtn.addEventListener('mouseover', () => {
            stopBtn.style.background = '#ff3742';
        });
        
        stopBtn.addEventListener('mouseout', () => {
            stopBtn.style.background = '#ff4757';
        });
        
        stopBtn.addEventListener('click', () => {
            this.stopSpeaking();
            this.hideSpeechControl();
        });
        
        this.speechControlModal.appendChild(title);
        this.speechControlModal.appendChild(stopBtn);
        document.body.appendChild(this.speechControlModal);
    }
    
    // 显示语音控制弹窗
    showSpeechControl() {
        if (this.speechControlModal) {
            this.speechControlModal.style.display = 'flex';
        }
    }
    
    // 隐藏语音控制弹窗
    hideSpeechControl() {
        if (this.speechControlModal) {
            this.speechControlModal.style.display = 'none';
        }
    }
    
    // 文本转语音
    speakText(text, rate = 1.0, pitch = 1.0) {
        if (this.isSpeaking) {
            this.stopSpeaking();
        }
        
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error('浏览器不支持语音合成'));
                return;
            }
            
            this.utterance = new SpeechSynthesisUtterance(text);
            this.utterance.lang = 'zh-CN';
            this.utterance.rate = rate;
            this.utterance.pitch = pitch;
            
            this.utterance.onstart = () => {
                this.isSpeaking = true;
                this.updateSpeechButton();
                this.showSpeechControl();
            };
            
            this.utterance.onend = () => {
                this.isSpeaking = false;
                this.updateSpeechButton();
                this.hideSpeechControl();
                resolve();
            };
            
            this.utterance.onerror = (event) => {
                this.isSpeaking = false;
                this.updateSpeechButton();
                this.hideSpeechControl();
                reject(event);
            };
            
            this.isSpeaking = true;
            this.updateSpeechButton();
            this.synth.speak(this.utterance);
        });
    }
    
    // 停止语音
    stopSpeaking() {
        if (this.synth && this.isSpeaking) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.updateSpeechButton();
            this.hideSpeechControl();
        }
    }
    
    // 开始语音识别
    startRecognition(callback) {
        if (this.recognition && !this.isListening) {
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (callback) callback(transcript);
            };
            
            try {
                this.recognition.start();
            } catch (error) {
                console.error('语音识别启动失败:', error);
                if (callback) callback(null);
            }
        } else {
            if (callback) callback(null);
        }
    }
    
    // 开始语音识别（通用）
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('语音识别启动失败:', error);
            }
        }
    }
    
    // 停止语音识别
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    // 处理语音命令
    handleVoiceCommand(command) {
        console.log('语音命令:', command);
        
        // 根据页面和命令执行相应操作
        const page = window.pageName;
        
        switch(page) {
            case 'evaluation':
                this.handleEvaluationCommands(command);
                break;
            case 'plan':
                this.handlePlanCommands(command);
                break;
            case 'herbs':
                this.handleHerbsCommands(command);
                break;
            case 'ai_doctor':
                this.handleAIDoctorCommands(command);
                break;
            default:
                this.handleGeneralCommands(command);
        }
    }
    
    // 处理AI医生页面命令
    handleAIDoctorCommands(command) {
        const input = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendMessage');
        
        if (command.includes('发送') || command.includes('提问') || command.includes('咨询')) {
            if (input && sendBtn) {
                sendBtn.click();
            }
        } else if (command.includes('清空') || command.includes('清除')) {
            if (input) {
                input.value = '';
            }
        } else if (command.includes('停止') || command.includes('终止')) {
            this.stopSpeaking();
        } else {
            // 将语音输入添加到输入框
            if (input) {
                input.value = command;
            }
        }
    }
    
    // 处理评估页面命令
    handleEvaluationCommands(command) {
        if (command.includes('开始评估') || command.includes('进行评估')) {
            const startBtn = document.querySelector('.btn.primary');
            if (startBtn) startBtn.click();
        } else if (command.includes('拍照') || command.includes('选择图片')) {
            const cameraBtn = document.querySelector('.camera-btn');
            if (cameraBtn) cameraBtn.click();
        } else if (command.includes('清除') || command.includes('删除图片')) {
            const clearBtn = document.getElementById('clearPhoto');
            if (clearBtn) clearBtn.click();
        } else if (command.includes('停止') || command.includes('终止')) {
            this.stopSpeaking();
        }
    }
    
    // 处理方案页面命令
    handlePlanCommands(command) {
        if (command.includes('救命') || command.includes('创建方案')) {
            const genBtn = document.getElementById('genPlan');
            if (genBtn) genBtn.click();
        } else if (command.includes('朗读') && command.includes('方案')) {
            // 找到最新的方案并朗读
            const latestPlan = document.querySelector('.plan-card');
            if (latestPlan) {
                const planId = latestPlan.getAttribute('data-plan');
                this.speakPlan(planId);
            }
        } else if (command.includes('停止') || command.includes('终止')) {
            this.stopSpeaking();
        }
    }
    
    // 朗读方案内容
    speakPlan(planId) {
        const planCard = document.querySelector(`.plan-card[data-plan="${planId}"]`);
        if (!planCard) return;
        
        const planText = planCard.textContent || planCard.innerText;
        if (planText) {
            this.speakText(planText);
        }
    }
    
    // 处理药材页面命令
    handleHerbsCommands(command) {
        if (command.includes('搜索') || command.includes('查找')) {
            const searchInput = document.getElementById('herbSearch');
            if (searchInput) {
                const searchTerm = command.replace(/搜索|查找/g, '').trim();
                searchInput.value = searchTerm;
                
                // 触发搜索
                const searchBtn = document.getElementById('searchBtn');
                if (searchBtn) searchBtn.click();
            }
        } else if (command.includes('智能搜索') || command.includes('AI搜索')) {
            const smartSearchBtn = document.querySelector('.btn.primary');
            if (smartSearchBtn && smartSearchBtn.textContent.includes('智能搜索')) {
                smartSearchBtn.click();
            }
        } else if (command.includes('朗读') && command.includes('药材')) {
            const readButtons = document.querySelectorAll('.read-btn');
            if (readButtons.length > 0) {
                readButtons[0].click(); // 朗读第一个药材
            }
        } else if (command.includes('停止') || command.includes('终止')) {
            this.stopSpeaking();
        }
    }
    
    // 处理通用命令
    handleGeneralCommands(command) {
        if (command.includes('首页') || command.includes('主页')) {
            window.location.href = 'index.html';
        } else if (command.includes('方案') || command.includes('计划')) {
            window.location.href = 'plan.html';
        } else if (command.includes('评估') || command.includes('测试')) {
            window.location.href = 'evaluation.html';
        } else if (command.includes('药材') || command.includes('中药')) {
            window.location.href = 'herbs.html';
        } else if (command.includes('医生') || command.includes('咨询')) {
            window.location.href = 'ai_doctor.html';
        } else if (command.includes('关于') || command.includes('介绍')) {
            window.location.href = 'about.html';
        } else if (command.includes('停止') || command.includes('终止')) {
            this.stopSpeaking();
        }
    }
    
    // 更新语音按钮状态
    updateSpeechButton() {
        const speechBtn = document.getElementById('speechToggle');
        if (!speechBtn) return;
        
        speechBtn.classList.remove('listening', 'speaking');
        
        if (this.isListening) {
            speechBtn.classList.add('listening');
        } else if (this.isSpeaking) {
            speechBtn.classList.add('speaking');
        }
    }
    
    // 切换语音功能
    toggleSpeech() {
        if (this.isListening) {
            this.stopListening();
        } else if (this.isSpeaking) {
            this.stopSpeaking();
        } else {
            this.startListening();
        }
    }
}

// 初始化语音助手
document.addEventListener('DOMContentLoaded', () => {
    window.speechHelper = new SpeechHelper();
    
    // 为所有页面添加全局语音控制
    addGlobalSpeechControls();
    
    // 为AI医生页面添加语音输入按钮
    if (window.pageName === 'ai_doctor') {
        addVoiceInputButton();
    }
});

// 为所有页面添加全局语音控制
function addGlobalSpeechControls() {
    // 添加全局样式
    const style = document.createElement('style');
    style.textContent = `
        .speech-control-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .speech-control-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        
        .speech-control-btn.listening {
            background: #FF9800;
            animation: pulse 1.5s infinite;
        }
        
        .speech-control-btn.speaking {
            background: #F44336;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        #speechControlModal {
            font-family: Arial, sans-serif;
        }
        
        #speechControlModal button:hover {
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
    
    // 添加全局语音控制按钮
    const speechBtn = document.createElement('button');
    
    speechBtn.addEventListener('click', () => {
        if (window.speechHelper) {
            window.speechHelper.toggleSpeech();
        }
    });
    
    document.body.appendChild(speechBtn);
}

// 为AI医生页面添加语音输入按钮
function addVoiceInputButton() {
    const inputContainer = document.querySelector('.chat-input');
    if (!inputContainer) return;
    
    const voiceBtn = document.createElement('button');
    voiceBtn.type = 'button';
    voiceBtn.className = 'voice-input-btn';
    voiceBtn.innerHTML = '🎤';
    voiceBtn.title = '语音输入';
    voiceBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background-color 0.3s;
    `;
    
    voiceBtn.addEventListener('click', () => {
        if (window.speechHelper) {
            const input = document.getElementById('userInput');
            window.speechHelper.startRecognition((transcript) => {
                if (transcript && input) {
                    input.value = transcript;
                    // 自动聚焦到输入框
                    input.focus();
                }
            });
        }
    });
    
    // 将语音按钮添加到输入容器
    const sendBtn = inputContainer.querySelector('button[type="submit"]');
    if (sendBtn) {
        inputContainer.insertBefore(voiceBtn, sendBtn);
    } else {
        inputContainer.appendChild(voiceBtn);
    }
}

// 全局语音朗读函数，可在任何页面调用
function speakText(text, rate = 1.0, pitch = 1.0) {
    if (window.speechHelper) {
        return window.speechHelper.speakText(text, rate, pitch);
    } else {
        console.error('语音助手未初始化');
        return Promise.reject(new Error('语音助手未初始化'));
    }
}

// 全局停止朗读函数
function stopSpeaking() {
    if (window.speechHelper) {
        window.speechHelper.stopSpeaking();
    }
}