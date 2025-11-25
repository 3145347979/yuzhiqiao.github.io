document.addEventListener('DOMContentLoaded', () => {
    const symptomInput = document.getElementById('symptomInput');
    const startVoice = document.getElementById('startVoice');
    const sendSymptom = document.getElementById('sendSymptom');
    const aiResult = document.getElementById('aiResult');

    let chatHistory = getChatHistory();

    // 语音输入功能
    startVoice.addEventListener('click', async () => {
        if (window.speechHelper) {
            try {
                showMessage('请开始说话...', 'info');
                const text = await new Promise((resolve) => {
                    window.speechHelper.startRecognition(resolve);
                });
                if (text) {
                    symptomInput.value = text;
                    showMessage('语音识别完成', 'success');
                }
            } catch (error) {
                console.error('语音输入失败:', error);
                showMessage('语音输入失败，请检查麦克风权限', 'error');
            }
        } else {
            showMessage('语音助手未初始化', 'error');
        }
    });

    // 提交症状给AI医生
        sendSymptom.addEventListener('click', async () => {
            const symptoms = symptomInput.value.trim();
            if (!symptoms) {
                showMessage('请输入症状描述', 'warning');
                symptomInput.focus();
                return;
            }
    
            // 禁用按钮，显示加载状态
            sendSymptom.disabled = true;
            sendSymptom.textContent = '分析中...';
            
            // 显示用户输入
            displayUserMessage(symptoms);
            
            // 显示加载状态
            showLoadingState();
    
            try {
                // 调用API
                const result = await apiRequest('/api/qa', {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: getUserId(),   
                        query: symptoms,        
                        history: getChatHistory()     
                    })
                });
    
                if (result.success) {
                    const response = result.data;
                    
                    // 处理响应格式
                    let aiResponse = '收到您的咨询，我会尽力为您提供专业的健康建议。';
                    if (response.code === 200 && response.data) {
                        aiResponse = response.data.answer || '收到回复但内容为空';
                    } else {
                        aiResponse = response.msg || '请求成功但格式异常';
                    }
                    
                    // 显示AI回复
                    displayAIResponse(aiResponse);
                    
                    // 存储回复内容用于朗读
                    window.lastAIResponse = aiResponse;
                    
                    // 自动朗读回复
                    setTimeout(() => {
                        speakAIResponse();
                    }, 500);
                    
                } else {
                    // 使用模拟回复作为备选
                    const fallbackResponse = generateFallbackResponse(symptoms);
                    displayAIResponse(fallbackResponse);
                    window.lastAIResponse = fallbackResponse;
                    showMessage('使用模拟回复，API连接失败', 'warning');
                }
            } catch (error) {
                console.error('AI医生请求失败:', error);
                // 使用模拟回复
                const fallbackResponse = generateFallbackResponse(symptoms);
                displayAIResponse(fallbackResponse);
                window.lastAIResponse = fallbackResponse;
                showMessage('网络连接失败，使用模拟回复', 'error');
            } finally {
                // 恢复按钮状态
                sendSymptom.disabled = false;
                sendSymptom.textContent = '提交给AI医生';
                // 清空输入框
                symptomInput.value = '';
            }
        });
    
        // 支持回车发送
        symptomInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendSymptom.click();
            }
        });
    
        // 显示欢迎信息
        showWelcomeMessage();
    });
    
    // 显示用户消息
    function displayUserMessage(message) {
        const aiResult = document.getElementById('aiResult');
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'message user-message';
        userMessageDiv.innerHTML = `
            <div class="message-header">
                <strong>您:</strong>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content">${message}</div>
        `;
        aiResult.appendChild(userMessageDiv);
        scrollToBottom();
    }
    
    // 显示AI回复
    function displayAIResponse(response) {
        const aiResult = document.getElementById('aiResult');
        
        // 移除加载状态
        const loadingDiv = aiResult.querySelector('.loading-state');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-header">
                <strong>AI医生:</strong>
                <span class="message-time">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="message-content">${formatResponse(response)}</div>
            <div class="message-actions">
                <button class="btn small" onclick="speakAIResponse()">🔊 朗读回复</button>
                <button class="btn small" onclick="copyAIResponse()">📋 复制文本</button>
            </div>
        `;
        aiResult.appendChild(aiMessageDiv);
        scrollToBottom();
    }
    
    // 显示加载状态
    function showLoadingState() {
        const aiResult = document.getElementById('aiResult');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-state';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="loading-spinner"></div>
                <p style="color: #666; margin-top: 10px;">AI医生正在分析中...</p>
            </div>
        `;
        aiResult.appendChild(loadingDiv);
        scrollToBottom();
    }
    
    // 显示欢迎信息
    function showWelcomeMessage() {
        const aiResult = document.getElementById('aiResult');
        // 只有在没有消息时才显示欢迎信息
        if (!aiResult.querySelector('.message')) {
            aiResult.innerHTML = `
                <div class="welcome-message">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h3 style="color: var(--accent); margin-bottom: 15px;">👨‍⚕️ 欢迎使用AI医生</h3>
                        <p>我可以为您提供专业的中医健康咨询服务</p>
                    </div>
                    <div class="abcde">
                        <div class="abcd">
                            <strong>💬 症状咨询</strong>
                            <p>描述您的症状，获取专业建议</p>
                        </div>
                        <div class="abcd">
                            <strong>🎤 语音输入</strong>
                            <p>支持语音描述，更方便快捷</p>
                        </div>
                        <div class="abcd">
                            <strong>🔊 语音朗读</strong>
                            <p>AI回复支持语音朗读</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // 格式化响应文本
    function formatResponse(text) {
        // 简单的格式化处理
        return text.replace(/\n/g, '<br>')
                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    // 滚动到底部
    function scrollToBottom() {
        const aiResult = document.getElementById('aiResult');
        aiResult.scrollTop = aiResult.scrollHeight;
    }
    
    // 生成备选回复
    function generateFallbackResponse(userMessage) {
        const responses = {
            '失眠': "关于失眠问题，中医建议：\n1. 睡前1小时避免使用电子设备\n2. 可尝试温水泡脚，加入少许盐\n3. 保持卧室安静、黑暗\n4. 睡前可听轻音乐放松\n建议规律作息，必要时咨询专业中医师。",
            '头痛': "头痛可能与多种因素有关：\n• 肝阳上亢：建议避免辛辣食物\n• 气血不足：注意营养均衡\n• 外感风寒：注意保暖避风\n建议观察头痛发作时间、部位，记录症状变化。",
            '消化': "消化问题中医调理建议：\n1. 饮食规律，细嚼慢咽\n2. 避免生冷油腻食物\n3. 可适量食用山药、薏米健脾\n4. 饭后适当散步助消化",
            '疲劳': "疲劳感调理建议：\n• 保证充足睡眠，避免熬夜\n• 适当运动，如散步、太极拳\n• 饮食均衡，多食补气血食物\n• 保持心情愉悦，避免过度思虑",
            'default': "感谢您的咨询。根据中医理论，健康需要阴阳平衡、气血调和。建议您：\n1. 保持规律作息\n2. 饮食均衡营养\n3. 适当运动锻炼\n4. 保持心情舒畅\n如有具体症状，请详细描述，我会提供更针对性的建议。"
        };
    
        // 关键词匹配
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('失眠') || lowerMessage.includes('睡眠')) {
            return responses.失眠;
        } else if (lowerMessage.includes('头痛') || lowerMessage.includes('头晕')) {
            return responses.头痛;
        } else if (lowerMessage.includes('消化') || lowerMessage.includes('胃')) {
            return responses.消化;
        } else if (lowerMessage.includes('疲劳') || lowerMessage.includes('累')) {
            return responses.疲劳;
        }
        
        return responses.default;
    }
    
    // 朗读AI回复
    function speakAIResponse() {
        if (window.lastAIResponse && window.speechHelper) {
            window.speechHelper.speakText(window.lastAIResponse);
        } else {
            showMessage('没有可朗读的内容', 'warning');
        }
    }
    
    // 复制AI回复
    function copyAIResponse() {
        if (window.lastAIResponse) {
            navigator.clipboard.writeText(window.lastAIResponse).then(() => {
                showMessage('已复制到剪贴板', 'success');
            }).catch(() => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = window.lastAIResponse;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showMessage('已复制到剪贴板', 'success');
            });
        } else {
            showMessage('没有可复制的内容', 'warning');
        }
    }