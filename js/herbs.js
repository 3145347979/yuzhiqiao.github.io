async function loadHerbs(){
    try{
        const res = await fetch('images/herbs/herbs.json');
        const data = await res.json();
        const list = document.getElementById('herbList');
        const tpl = document.getElementById('herbCardTpl');
        
        list.innerHTML = ''; // 清空现有内容
        
        data.forEach(h => {
            const node = tpl.content.cloneNode(true);
            node.querySelector('.herb-img').src = h.img;
            node.querySelector('.herb-name').textContent = h.name;
            node.querySelector('.herb-desc').textContent = h.desc;
            
            const readBtn = node.querySelector('.read-btn');
            readBtn.addEventListener('click', () => {
                if (window.speechHelper) {
                    window.speechHelper.speakText(`${h.name}，${h.desc}`);
                } else {
                    showMessage('语音助手未就绪', 'warning');
                }
            });
            
            list.appendChild(node);
        });
    }catch(e){
        console.error('加载中药数据失败：', e);
        document.getElementById('herbList').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p>未找到中药数据，请将中药图片与放入文件夹。</p>
            </div>
        `;
    }
}

// 智能搜索中药信息
async function searchHerbsByAI(query) {
    try {
        const result = await apiRequest('/api/qa', {
            method: 'POST',
            body: JSON.stringify({
                user_id: getUserId(),
                query: `请详细介绍中药"${query}"的功效、用法、禁忌和注意事项`,
                history: []
            })
        });

        if (result.success && result.data.code === 200) {
            return result.data.data.answer;
        }
        return null;
    } catch (error) {
        console.error('AI搜索失败:', error);
        return null;
    }
}

// 显示AI搜索结果的模态框
function showAIResultModal(content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        ">
            <h3 style="color: #2a8f7a; margin-top: 0;">AI中药百科</h3>
            <div style="line-height: 1.6; white-space: pre-wrap;">${content}</div>
            <div style="margin-top: 20px; text-align: center;">
                <button class="btn primary" onclick="this.closest('.modal').remove()">关闭</button>
                ${window.speechHelper ? `<button class="btn" onclick="window.speechHelper.speakText(this.previousElementSibling.previousElementSibling.textContent)" style="margin-left: 10px;">朗读</button>` : ''}
            </div>
        </div>
    `;
    
    modal.classList.add('modal');
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 语音输入搜索功能
function startVoiceSearch() {
    if (window.speechHelper) {
        window.speechHelper.startRecognition((transcript) => {
            if (transcript && transcript.trim()) {
                // 清理语音输入内容：去掉"搜索"、"查找"关键词和标点符号
                let cleanedTranscript = transcript
                    .replace(/搜索|查找/g, '') // 去掉搜索关键词
                    .replace(/[。.,，]/g, '')  // 去掉标点符号
                    .trim();
                
                const herbSearch = document.getElementById('herbSearch');
                if (herbSearch && cleanedTranscript) {
                    herbSearch.value = cleanedTranscript;
                    // 自动聚焦到输入框
                    herbSearch.focus();
                    showMessage(`语音输入: ${cleanedTranscript}`, 'info');
                    
                    // 自动执行搜索
                    performSearch();
                }
            }
        });
    } else {
        showMessage('语音助手未就绪', 'warning');
    }
}

// 设置语音助手按钮功能
function setupSpeechButton() {
    const speechBtn = document.getElementById('speechToggle');
    if (!speechBtn) return;
    
    // 更新按钮状态
    function updateSpeechButton() {
        if (!window.speechHelper) return;
        
        speechBtn.classList.remove('listening', 'speaking');
        
        if (window.speechHelper.isListening) {
            speechBtn.classList.add('listening');
        } else if (window.speechHelper.isSpeaking) {
            speechBtn.classList.add('speaking');
        }
    }
    
    // 修改点击事件：如果正在说话就停止，否则开始语音输入搜索
    speechBtn.addEventListener('click', () => {
        if (window.speechHelper) {
            if (window.speechHelper.isSpeaking) {
                // 如果正在朗读，停止朗读
                window.speechHelper.stopSpeaking();
            } else if (window.speechHelper.isListening) {
                // 如果正在聆听，停止聆听
                window.speechHelper.stopListening();
            } else {
                // 否则开始语音输入搜索
                startVoiceSearch();
            }
        } else {
            showMessage('语音助手未就绪', 'warning');
        }
    });
    
    // 定期更新按钮状态
    setInterval(updateSpeechButton, 500);
}

// 添加语音命令处理
function setupVoiceCommands() {
    if (!window.speechHelper) return;
    
    // 覆盖默认的语音命令处理
    const originalHandleVoiceCommand = window.speechHelper.handleVoiceCommand;
    window.speechHelper.handleVoiceCommand = function(command) {
        console.log('药材页面语音命令:', command);
        
        // 处理药材页面特定命令
        if (command.includes('搜索') || command.includes('查找')) {
            let searchTerm = command
                .replace(/搜索|查找/g, '') // 去掉搜索关键词
                .replace(/[。.,，]/g, '')  // 去掉标点符号
                .trim();
            
            const searchInput = document.getElementById('herbSearch');
            if (searchInput && searchTerm) {
                searchInput.value = searchTerm;
                performSearch();
                showMessage(`正在搜索: ${searchTerm}`, 'info');
            }
        } else if (command.includes('智能搜索') || command.includes('AI搜索')) {
            let query = command
                .replace(/智能搜索|AI搜索/g, '') // 去掉搜索关键词
                .replace(/[。.,，]/g, '')        // 去掉标点符号
                .trim();
            
            if (query) {
                document.getElementById('herbSearch').value = query;
                performSmartSearch();
            }
        } else if (command.includes('朗读') && command.includes('药材')) {
            const readButtons = document.querySelectorAll('.read-btn');
            if (readButtons.length > 0) {
                readButtons[0].click();
            }
        } else if (command.includes('停止') || command.includes('终止')) {
            if (window.speechHelper) {
                window.speechHelper.stopSpeaking();
            }
        } else {
            // 调用原始处理函数处理通用命令
            if (originalHandleVoiceCommand) {
                originalHandleVoiceCommand.call(this, command);
            }
        }
    };
}

// 本地搜索函数
function performSearch() {
    const q = document.getElementById('herbSearch').value.trim().toLowerCase();
    const cards = Array.from(document.querySelectorAll('.herb-card'));
    let foundCount = 0;
    
    cards.forEach(card => {
        const name = card.querySelector('.herb-name').textContent.toLowerCase();
        const desc = card.querySelector('.herb-desc').textContent.toLowerCase();
        const shouldShow = !q || name.includes(q) || desc.includes(q);
        
        card.style.display = shouldShow ? 'block' : 'none';
        if (shouldShow) foundCount++;
    });
    
    // 显示搜索结果统计
    if (q) {
        showMessage(`找到 ${foundCount} 个相关中药`, 'info');
    }
}

// 智能搜索函数
async function performSmartSearch() {
    const query = document.getElementById('herbSearch').value.trim();
    if (!query) {
        showMessage('请输入要搜索的中药名称', 'warning');
        return;
    }
    
    showMessage('正在使用AI智能搜索...', 'info');
    const aiResult = await searchHerbsByAI(query);
    if (aiResult) {
        showAIResultModal(aiResult);
    } else {
        showMessage('智能搜索失败，请稍后重试', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadHerbs();
    
    const searchBtn = document.getElementById('searchBtn');
    const herbSearch = document.getElementById('herbSearch');
    
    // 绑定事件
    searchBtn.addEventListener('click', performSearch);
    
    // 智能搜索按钮
    const smartSearchBtn = document.createElement('button');
    smartSearchBtn.textContent = '智能搜索';
    smartSearchBtn.className = 'btn primary';
    smartSearchBtn.style.marginLeft = '10px';
    smartSearchBtn.addEventListener('click', performSmartSearch);
    searchBtn.parentNode.appendChild(smartSearchBtn);

    // 回车搜索
    herbSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 设置语音助手按钮功能
    setupSpeechButton();
    setupVoiceCommands();
    
    // 确保语音助手已初始化
    setTimeout(() => {
        if (!window.speechHelper) {
            console.warn('语音助手未初始化，尝试重新初始化');
            window.speechHelper = new SpeechHelper();
        }
    }, 1000);
});

// 显示消息提示
function showMessage(text, type) {
    // 如果页面中已有消息系统，使用现有的
    const existingMessage = document.getElementById('message');
    if (existingMessage) {
        existingMessage.textContent = text;
        existingMessage.className = `message ${type} show`;
        
        setTimeout(() => {
            existingMessage.classList.remove('show');
        }, 3000);
        return;
    }
    
    // 创建临时消息提示
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.3s;
        transform: translateX(120%);
    `;
    
    if (type === 'success') messageEl.style.background = '#2a8f7a';
    else if (type === 'error') messageEl.style.background = '#e74c3c';
    else if (type === 'warning') messageEl.style.background = '#f39c12';
    else messageEl.style.background = '#3498db';
    
    messageEl.textContent = text;
    document.body.appendChild(messageEl);
    
    // 显示动画
    setTimeout(() => {
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        messageEl.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}