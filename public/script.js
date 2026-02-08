
      // ===== PRODUCTION-GRADE CHAT STATE MANAGEMENT =====
      
      // ===== STORAGE MANAGER WITH FALLBACK =====
      
      class StorageManager {
        constructor() {
          this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
          this.fallbackStorage = new Map();
          this.storageType = this.isLocalStorageAvailable ? 'localStorage' : 'memory';
          
          console.log(`ðŸ—„ï¸ Storage type: ${this.storageType}`);
          
          if (!this.isLocalStorageAvailable) {
            this.showStorageWarning();
          }
        }
        
        checkLocalStorageAvailability() {
          try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
          } catch (e) {
            console.warn('localStorage not available:', e.message);
            return false;
          }
        }
        
        showStorageWarning() {
          // Show user-friendly warning about storage limitations
          setTimeout(() => {
            const warningDiv = document.createElement('div');
            warningDiv.innerHTML = `
              <div style="position: fixed; top: 20px; right: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; max-width: 350px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 20px;">âš ï¸</span>
                  <strong style="color: #856404;">Storage Limited</strong>
                  <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
                </div>
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.4;">
                  Your browser's tracking prevention is blocking storage. Settings and chat history will only be saved for this session.
                </p>
                <div style="margin-top: 12px;">
                  <button onclick="this.parentElement.parentElement.remove()" style="background: #ffc107; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    Got it
                  </button>
                </div>
              </div>
            `;
            document.body.appendChild(warningDiv);
            
            // Auto-remove after 10 seconds
            setTimeout(() => {
              if (warningDiv.parentNode) {
                warningDiv.remove();
              }
            }, 10000);
          }, 2000);
        }
        
        setItem(key, value) {
          try {
            if (this.isLocalStorageAvailable) {
              localStorage.setItem(key, value);
            } else {
              this.fallbackStorage.set(key, value);
            }
            return true;
          } catch (e) {
            console.warn(`Failed to save ${key}:`, e.message);
            // Fallback to memory storage
            this.fallbackStorage.set(key, value);
            return false;
          }
        }
        
        getItem(key) {
          try {
            if (this.isLocalStorageAvailable) {
              return localStorage.getItem(key);
            } else {
              return this.fallbackStorage.get(key) || null;
            }
          } catch (e) {
            console.warn(`Failed to get ${key}:`, e.message);
            return this.fallbackStorage.get(key) || null;
          }
        }
        
        removeItem(key) {
          try {
            if (this.isLocalStorageAvailable) {
              localStorage.removeItem(key);
            }
            this.fallbackStorage.delete(key);
          } catch (e) {
            console.warn(`Failed to remove ${key}:`, e.message);
            this.fallbackStorage.delete(key);
          }
        }
        
        clear() {
          try {
            if (this.isLocalStorageAvailable) {
              localStorage.clear();
            }
            this.fallbackStorage.clear();
          } catch (e) {
            console.warn('Failed to clear storage:', e.message);
            this.fallbackStorage.clear();
          }
        }
        
        // Get storage info for debugging
        getStorageInfo() {
          return {
            type: this.storageType,
            available: this.isLocalStorageAvailable,
            fallbackSize: this.fallbackStorage.size
          };
        }
      }
      
      // Global storage manager instance
      const storage = new StorageManager();

      /**
       * ChatStateManager - Single source of truth for all chat data
       * Handles persistence, state updates, and UI synchronization
       */
      class ChatStateManager {
        constructor() {
          this.state = {
            chats: new Map(), // All chats indexed by ID
            activeChatId: null, // Currently active chat
            chatOrder: [], // Order of chats for display
          };
          
          this.listeners = new Set(); // UI update listeners
          this.STORAGE_KEYS = {
            CHATS: 'ai_chats_v2',
            ACTIVE_CHAT: 'ai_active_chat_v2',
            CHAT_ORDER: 'ai_chat_order_v2'
          };
          
          this.initialize();
        }
        
        // Initialize state from localStorage
        initialize() {
          try {
            // Load chats
            const chatsData = localStorage.getItem(this.STORAGE_KEYS.CHATS);
            if (chatsData) {
              const chatsArray = JSON.parse(chatsData);
              chatsArray.forEach(chat => {
                this.state.chats.set(chat.id, chat);
              });
            }
            
            // Load active chat ID
            this.state.activeChatId = localStorage.getItem(this.STORAGE_KEYS.ACTIVE_CHAT);
            
            // Load chat order
            const orderData = localStorage.getItem(this.STORAGE_KEYS.CHAT_ORDER);
            if (orderData) {
              this.state.chatOrder = JSON.parse(orderData);
            }
            
            // Clean up orphaned data
            this.cleanupState();
            
          } catch (error) {
            console.error('Failed to initialize chat state:', error);
            this.resetState();
          }
        }
        
        // Clean up inconsistent state
        cleanupState() {
          // Remove chats that don't exist from order
          this.state.chatOrder = this.state.chatOrder.filter(id => this.state.chats.has(id));
          
          // Add missing chats to order
          for (const chatId of this.state.chats.keys()) {
            if (!this.state.chatOrder.includes(chatId)) {
              this.state.chatOrder.unshift(chatId);
            }
          }
          
          // Validate active chat exists
          if (this.state.activeChatId && !this.state.chats.has(this.state.activeChatId)) {
            this.state.activeChatId = null;
          }
          
          this.persistState();
        }
        
        // Persist state to storage (localStorage or fallback)
        persistState() {
          try {
            const chatsArray = Array.from(this.state.chats.values());
            storage.setItem(this.STORAGE_KEYS.CHATS, JSON.stringify(chatsArray));
            storage.setItem(this.STORAGE_KEYS.CHAT_ORDER, JSON.stringify(this.state.chatOrder));
            
            if (this.state.activeChatId) {
              storage.setItem(this.STORAGE_KEYS.ACTIVE_CHAT, this.state.activeChatId);
            } else {
              storage.removeItem(this.STORAGE_KEYS.ACTIVE_CHAT);
            }
          } catch (error) {
            console.error('Failed to persist chat state:', error);
          }
        }
        
        // Create new chat
        createChat(title = null) {
          const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const chat = {
            id: chatId,
            title: title || 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            aiProvider: 'openai',
            starred: false,
            tags: [],
            category: 'General'
          };
          
          this.state.chats.set(chatId, chat);
          this.state.chatOrder.unshift(chatId);
          this.state.activeChatId = chatId;
          
          this.persistState();
          this.notifyListeners();
          
          return chatId;
        }
        
        // Add message to active chat
        addMessage(message) {
          if (!this.state.activeChatId) {
            this.createChat();
          }
          
          const chat = this.state.chats.get(this.state.activeChatId);
          if (!chat) return;
          
          const messageObj = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sender: message.sender,
            text: message.text,
            timestamp: Date.now(),
            ...message
          };
          
          chat.messages.push(messageObj);
          chat.updatedAt = Date.now();
          
          // Auto-generate title from first user message
          if (chat.title === 'New Chat' && message.sender === 'user' && message.text) {
            chat.title = message.text.length > 50 
              ? message.text.substring(0, 50) + '...'
              : message.text;
          }
          
          this.persistState();
          this.notifyListeners();
        }
        
        // Switch to different chat
        setActiveChat(chatId) {
          if (!chatId || !this.state.chats.has(chatId)) {
            this.state.activeChatId = null;
          } else {
            this.state.activeChatId = chatId;
            // Move to front of order
            this.state.chatOrder = [chatId, ...this.state.chatOrder.filter(id => id !== chatId)];
          }
          
          this.persistState();
          this.notifyListeners();
        }
        
        // Delete chat permanently
        deleteChat(chatId) {
          if (!this.state.chats.has(chatId)) return false;
          
          this.state.chats.delete(chatId);
          this.state.chatOrder = this.state.chatOrder.filter(id => id !== chatId);
          
          // If deleted chat was active, clear active chat
          if (this.state.activeChatId === chatId) {
            this.state.activeChatId = null;
          }
          
          this.persistState();
          this.notifyListeners();
          return true;
        }
        
        // Update chat metadata
        updateChat(chatId, updates) {
          const chat = this.state.chats.get(chatId);
          if (!chat) return false;
          
          Object.assign(chat, updates, { updatedAt: Date.now() });
          
          this.persistState();
          this.notifyListeners();
          return true;
        }
        
        // Clear all chats
        clearAllChats() {
          this.state.chats.clear();
          this.state.chatOrder = [];
          this.state.activeChatId = null;
          
          this.persistState();
          this.notifyListeners();
        }
        
        // Reset entire state
        resetState() {
          this.state = {
            chats: new Map(),
            activeChatId: null,
            chatOrder: []
          };
          
          // Clear storage
          Object.values(this.STORAGE_KEYS).forEach(key => {
            storage.removeItem(key);
          });
          
          this.notifyListeners();
        }
        
        // Get current active chat
        getActiveChat() {
          return this.state.activeChatId ? this.state.chats.get(this.state.activeChatId) : null;
        }
        
        // Get all chats in order
        getAllChats() {
          return this.state.chatOrder.map(id => this.state.chats.get(id)).filter(Boolean);
        }
        
        // Get chat by ID
        getChat(chatId) {
          return this.state.chats.get(chatId);
        }
        
        // Search chats
        searchChats(query) {
          const results = [];
          const lowerQuery = query.toLowerCase();
          
          for (const chat of this.state.chats.values()) {
            // Search in title
            if (chat.title.toLowerCase().includes(lowerQuery)) {
              results.push({ chat, matchType: 'title' });
              continue;
            }
            
            // Search in messages
            for (const message of chat.messages) {
              if (message.text && message.text.toLowerCase().includes(lowerQuery)) {
                results.push({ chat, matchType: 'message', message });
                break;
              }
            }
            
            // Search in tags
            if (chat.tags && chat.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
              results.push({ chat, matchType: 'tag' });
            }
          }
          
          return results;
        }
        
        // Subscribe to state changes
        subscribe(listener) {
          this.listeners.add(listener);
          return () => this.listeners.delete(listener);
        }
        
        // Notify all listeners of state changes
        notifyListeners() {
          this.listeners.forEach(listener => {
            try {
              listener(this.state);
            } catch (error) {
              console.error('Listener error:', error);
            }
          });
        }
        
        // Get state snapshot
        getState() {
          return {
            chats: new Map(this.state.chats),
            activeChatId: this.state.activeChatId,
            chatOrder: [...this.state.chatOrder]
          };
        }
      }
      
      // ===== GLOBAL INSTANCES =====
      const chatState = new ChatStateManager();
      
      // Legacy global variables for compatibility
      let currentChat = [];
      let recognition;
      let isListening = false;
      let attachedFile = null;
      let isProcessing = false;
      let availableProviders = {};
      let userPersonalization = null;
      let projectManager = null;
      let currentTemplate = null;

      // ===== UI SYNCHRONIZATION =====
      
      // Subscribe to state changes and update UI
      chatState.subscribe((state) => {
        updateChatHistoryUI();
        updateActiveChatUI();
        updateCurrentChatArray(); // Keep legacy currentChat array in sync
      });
      
      // Update legacy currentChat array for compatibility
      function updateCurrentChatArray() {
        const activeChat = chatState.getActiveChat();
        currentChat = activeChat ? activeChat.messages : [];
      }
      
      // Update chat history sidebar
      function updateChatHistoryUI() {
        const historyContainer = document.getElementById('chatHistory');
        if (!historyContainer) return;
        
        const chats = chatState.getAllChats();
        
        if (chats.length === 0) {
          historyContainer.innerHTML = '<div style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px; font-size: 14px;">No chat history yet</div>';
          return;
        }
        
        let historyHTML = '';
        chats.forEach(chat => {
          const isActive = chat.id === chatState.state.activeChatId;
          const starIcon = chat.starred ? '<i class="fas fa-star" style="color: #f59e0b;"></i>' : '';
          const tags = chat.tags ? chat.tags.map(tag => 
            `<span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 10px; font-size: 10px;">${tag}</span>`
          ).join(' ') : '';
          
          historyHTML += `
            <div class="history-item ${isActive ? 'active' : ''}" style="position: relative; padding: 8px; margin: 4px 0; ${isActive ? 'background: rgba(255,255,255,0.15);' : ''}">
              <div class="chat-item-content" data-chat-id="${chat.id}" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  ${starIcon}
                  <div style="font-weight: 500; font-size: 12px; flex: 1;">${chat.title}</div>
                  <button class="chat-edit-btn" data-chat-id="${chat.id}" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 2px;">
                    <i class="fas fa-ellipsis-v" style="font-size: 10px;"></i>
                  </button>
                </div>
                <div style="font-size: 10px; opacity: 0.7; display: flex; justify-content: space-between; align-items: center;">
                  <span>${new Date(chat.updatedAt).toLocaleTimeString()}</span>
                  <span>${chat.messages.length} msgs</span>
                </div>
                ${tags ? `<div style="margin-top: 4px;">${tags}</div>` : ''}
                ${chat.category ? `<div style="font-size: 9px; opacity: 0.6; margin-top: 2px;">${chat.category}</div>` : ''}
              </div>
            </div>
          `;
        });
        
        historyContainer.innerHTML = historyHTML;
      }
      
      // Update active chat messages display
      function updateActiveChatUI() {
        const messagesContainer = document.getElementById('chatMessages');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (!messagesContainer || !welcomeScreen) return;
        
        const activeChat = chatState.getActiveChat();
        
        if (!activeChat || activeChat.messages.length === 0) {
          // Show welcome screen
          messagesContainer.style.display = 'none';
          welcomeScreen.style.display = 'flex';
          messagesContainer.innerHTML = '';
        } else {
          // Show chat messages
          welcomeScreen.style.display = 'none';
          messagesContainer.style.display = 'flex';
          
          // Render messages
          messagesContainer.innerHTML = '';
          activeChat.messages.forEach(msg => {
            addMessageToDOM(msg.text, msg.sender, false);
          });
          
          // Scroll to bottom
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
      
      // ===== REFACTORED CHAT FUNCTIONS =====
      
      // Start new chat
      function startNewChat() {
        chatState.createChat();
      }
      
      // Load specific chat
      function loadHistoryChat(chatId) {
        chatState.setActiveChat(chatId);
      }
      
      // Delete chat permanently
      function deleteChatFromEdit() {
        const chatId = document.getElementById('chatEditModal').dataset.editingChatId;
        if (!chatId) return;
        
        if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
          chatState.deleteChat(chatId);
          closeChatEditModal();
          addMessage('ðŸ—‘ï¸ Chat deleted successfully!', 'bot');
        }
      }
      
      // Clear all data
      function clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This will remove:\n- All chat history\n- API keys\n- Settings\n- Projects\n\nThis action cannot be undone.')) {
          // Clear chat state
          chatState.clearAllChats();
          
          // Clear other data
          localStorage.clear();
          
          // Reset UI
          document.getElementById('chatMessages').innerHTML = '';
          document.getElementById('chatMessages').style.display = 'none';
          document.getElementById('welcomeScreen').style.display = 'flex';
          
          addMessage('ðŸ—‘ï¸ All data cleared successfully!', 'bot');
        }
      }
      
      // Add message (refactored to use state manager)
      function addMessage(text, sender, isTyping = false) {
        if (isTyping) {
          return addMessageToDOM(text, sender, true);
        }
        
        // Add to state
        chatState.addMessage({
          sender,
          text,
          timestamp: Date.now()
        });
        
        // DOM will be updated automatically via state subscription
      }
      
      // ðŸš€ ENHANCED: Add message with streaming support
      function addStreamingMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} streaming-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return {
          element: messageDiv,
          content: content,
          appendText: function(newText) {
            this.content.innerHTML += newText;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          },
          finalize: function(fullText) {
            this.content.innerHTML = formatMessageEnhanced(fullText);
            messageDiv.classList.remove('streaming-message');
            addCodeCopyButtons(this.content);
            addCodeDownloadButtons(this.content);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        };
      }
      
      // ðŸš€ ENHANCED: Format message with syntax highlighting and better code blocks
      function formatMessageEnhanced(text) {
        if (!text) return text;
        
        let formatted = text;
        
        // Detect and format code blocks with language
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
          const language = lang || 'plaintext';
          const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
          return `
            <div class="code-block-container" data-language="${language}">
              <div class="code-block-header">
                <span class="code-language">${language}</span>
                <div class="code-actions">
                  <button class="code-copy-btn" data-code-id="${codeId}" title="Copy code">
                    <i class="fas fa-copy"></i> Copy
                  </button>
                  <button class="code-download-btn" data-code-id="${codeId}" data-language="${language}" title="Download as file">
                    <i class="fas fa-download"></i> Download
                  </button>
                </div>
              </div>
              <pre id="${codeId}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>
            </div>
          `;
        });
        
        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // Convert **bold** to <strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert headers
        formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Convert line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
      }
      
      // Helper function to escape HTML
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
      
      // Add copy buttons to code blocks
      function addCodeCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.code-copy-btn');
        copyButtons.forEach(button => {
          button.addEventListener('click', function() {
            const codeId = this.getAttribute('data-code-id');
            const codeElement = document.getElementById(codeId);
            const code = codeElement.textContent;
            
            navigator.clipboard.writeText(code).then(() => {
              const originalHTML = this.innerHTML;
              this.innerHTML = '<i class="fas fa-check"></i> Copied!';
              this.classList.add('copied');
              
              setTimeout(() => {
                this.innerHTML = originalHTML;
                this.classList.remove('copied');
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
              alert('Failed to copy code. Please try again.');
            });
          });
        });
      }
      
      // Add download buttons to code blocks
      function addCodeDownloadButtons(container) {
        const downloadButtons = container.querySelectorAll('.code-download-btn');
        downloadButtons.forEach(button => {
          button.addEventListener('click', function() {
            const codeId = this.getAttribute('data-code-id');
            const language = this.getAttribute('data-language');
            const codeElement = document.getElementById(codeId);
            const code = codeElement.textContent;
            
            // Determine file extension
            const extensions = {
              javascript: 'js',
              typescript: 'ts',
              python: 'py',
              java: 'java',
              html: 'html',
              css: 'css',
              json: 'json',
              xml: 'xml',
              sql: 'sql',
              php: 'php',
              ruby: 'rb',
              go: 'go',
              rust: 'rs',
              cpp: 'cpp',
              c: 'c',
              csharp: 'cs',
              swift: 'swift',
              kotlin: 'kt'
            };
            
            const ext = extensions[language.toLowerCase()] || 'txt';
            const filename = `code-${Date.now()}.${ext}`;
            
            // Create download
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Visual feedback
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
            this.classList.add('downloaded');
            
            setTimeout(() => {
              this.innerHTML = originalHTML;
              this.classList.remove('downloaded');
            }, 2000);
          });
        });
      }
      
      // Add message to DOM only (for typing indicators, etc.)
      function addMessageToDOM(text, sender, isTyping = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${isTyping ? 'typing' : ''}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = formatMessage(text);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageDiv;
      }
      
      // Show chat interface
      function showChatInterface() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const chatMessages = document.getElementById('chatMessages');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (chatMessages) chatMessages.style.display = 'flex';
      }
      
      // Legacy functions for compatibility (now use state manager)
      function saveChatHistory() {
        // State is automatically persisted, but keep for compatibility
      }
      
      function updateChatHistory() {
        // UI is automatically updated via state subscription
      }
      
      function loadChatHistory() {
        // State is automatically loaded on initialization
      }

      // Initialize on page load
      document.addEventListener('DOMContentLoaded', function() {
        initializePersonalization();
        initializeProjectManager();
        loadProviders();
        
        // Initial UI update
        updateChatHistoryUI();
        updateActiveChatUI();
        updateCurrentChatArray();
        
        // ðŸš€ ENHANCED: Auto-save draft feature
        const userInput = document.getElementById('userInput');
        if (userInput) {
          // Load saved draft
          const savedDraft = localStorage.getItem('messageDraft');
          if (savedDraft) {
            userInput.value = savedDraft;
          }
          
          // Auto-save draft as user types
          let draftTimeout;
          userInput.addEventListener('input', function() {
            clearTimeout(draftTimeout);
            draftTimeout = setTimeout(() => {
              if (this.value.trim()) {
                localStorage.setItem('messageDraft', this.value);
              } else {
                localStorage.removeItem('messageDraft');
              }
            }, 500);
          });
          
          // Clear draft when message is sent
          const originalSendMessage = window.sendMessage;
          window.sendMessage = function() {
            localStorage.removeItem('messageDraft');
            return originalSendMessage.apply(this, arguments);
          };
        }
      });

      // Initialize personalization
      function initializePersonalization() {
        userPersonalization = {
          profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
          
          saveProfile() {
            localStorage.setItem('userProfile', JSON.stringify(this.profile));
          },

          updateProfile(updates) {
            this.profile = { ...this.profile, ...updates };
            this.saveProfile();
          }
        };
      }

      // Initialize project manager
      function initializeProjectManager() {
        projectManager = {
          projects: JSON.parse(localStorage.getItem('aiProjects') || '[]'),

          saveProject(data) {
            const project = {
              id: Date.now().toString(36) + Math.random().toString(36).substr(2),
              title: data.title || 'Untitled Project',
              content: data.content || '',
              provider: data.provider || 'unknown',
              createdAt: new Date().toISOString(),
              wordCount: this.countWords(data.content || '')
            };

            this.projects.unshift(project);
            this.saveProjects();
            return project;
          },

          saveProjects() {
            localStorage.setItem('aiProjects', JSON.stringify(this.projects));
          },

          countWords(text) {
            return text.trim().split(/\s+/).filter(word => word.length > 0).length;
          }
        };
      }

      // Quick action handlers
      // Quick action handlers
      function useQuickAction(type) {
        const prompts = {
          blog: "Write a comprehensive blog post about: ",
          social: "Create engaging social media captions for: ",
          image: "Generate an image of: ",
          resume: "Create a professional resume for: ",
          code: "Write clean, modern code for: ",
          business: "Create a business plan for: ",
          email: "Write a professional email about: ",
          creative: "Write a creative story about: "
        };

        const prompt = prompts[type] || "Help me with: ";
        const inputField = document.getElementById('userInput');
        inputField.value = prompt;
        
        // Show chat interface
        showChatInterface();
        
        // Focus input field with a small delay for mobile
        setTimeout(() => {
          inputField.focus();
          // Move cursor to end of text
          inputField.setSelectionRange(prompt.length, prompt.length);
        }, 100);
      }

      // Handle key press
      function handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      }

      // Send message (refactored for state manager)
      async function sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message && !attachedFile) return;
        if (isProcessing) return;

        isProcessing = true;
        updateSendButton(true);

        // Show chat interface if not visible
        showChatInterface();

        // ðŸš€ DETECT CODING TASK
        const codingTask = detectCodingTaskFrontend(message);
        if (codingTask.isCoding) {
          // Add coding task indicator
          addCodingTaskIndicator(codingTask);
        }

        // Add user message
        addMessage(message, 'user');
        input.value = '';

        try {
          const selectedProvider = document.getElementById('aiProvider').value;
          
          // Handle Smart Auto-Select
          if (selectedProvider === 'smart') {
            const taskType = detectTaskType(message);
            const recommendedProvider = getRecommendedProvider(taskType);
            
            if (!hasApiKeyForProvider(recommendedProvider)) {
              addMessage(`ðŸŽ¯ Smart Auto-Select recommends ${getProviderName(recommendedProvider)} for this task, but no API key is configured. Please add your API key in Settings.`, 'bot');
              return;
            }
            
            addMessage(`ðŸŽ¯ Smart Auto-Select chose ${getProviderName(recommendedProvider)} for this ${taskType} task.`, 'bot');
            await sendToProvider(recommendedProvider, message);
            return;
          }
          
          // Handle Battle Mode
          if (selectedProvider === 'compare') {
            await handleBattleMode(message);
            return;
          }
          
          // Handle regular single provider
          if (!hasApiKeyForProvider(selectedProvider)) {
            addMessage(`âŒ No API key configured for ${getProviderName(selectedProvider)}. Please add your API key in Settings.`, 'bot');
            return;
          }
          
          await sendToProvider(selectedProvider, message);

        } catch (err) {
          console.error('Error:', err);
          addMessage(`âŒ Error: ${err.message}. Please try again.`, 'bot');
        } finally {
          attachedFile = null;
          document.getElementById('fileInput').value = "";
          isProcessing = false;
          updateSendButton(false);
        }
      }

      // Send message to a specific provider
      async function sendToProvider(provider, message) {
        // Show enhanced thinking indicator
        const thinkingIndicator = showAIThinkingIndicator(provider);

        // Get API key and model
        const userApiKey = getApiKeyForProvider(provider);
        const selectedModel = document.getElementById('aiModel').value;

        try {
          // Create timeout promise
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout - AI provider took too long to respond')), 30000);
          });

          // Send request with timeout
          let requestPromise;
          if (attachedFile) {
            const formData = new FormData();
            formData.append("file", attachedFile);
            formData.append("message", message || "");
            formData.append("provider", provider);
            formData.append("apiKey", userApiKey);
            if (selectedModel) formData.append("model", selectedModel);
            
            requestPromise = fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
          } else {
            requestPromise = fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                provider: provider,
                model: selectedModel || undefined,
                apiKey: userApiKey
              }),
            });
          }

          const res = await Promise.race([requestPromise, timeoutPromise]);
          const data = await res.json();
          
          // Remove thinking indicator
          if (thinkingIndicator) {
            thinkingIndicator.remove();
          }

          if (!res.ok) {
            let errorMessage = data.error || 'Server error';
            
            // Handle specific HTTP status codes
            switch (res.status) {
              case 429:
                errorMessage = 'â° Too many requests. Please wait a moment and try again.';
                break;
              case 503:
                errorMessage = 'ðŸ”§ Service temporarily unavailable. Please try again in a few moments.';
                break;
              case 500:
                errorMessage = 'âŒ Server error. Please try again later.';
                break;
              case 400:
                errorMessage = data.error || 'âŒ Invalid request. Please check your input.';
                break;
              default:
                errorMessage = `âŒ ${data.error || 'Unknown error occurred'}`;
            }
            
            throw new Error(errorMessage);
          }

          // Handle response
          let reply = "";
          
          if (data.imageUrl) {
            const imageHtml = `
              <div style="margin: 10px 0;">
                <img src="${data.imageUrl}" alt="Generated Image" style="max-width: 100%; border-radius: 8px;" />
                <p style="margin-top: 8px; font-size: 0.9em;">
                  <a href="${data.imageUrl}" target="_blank">ðŸ”— Open full size</a>
                </p>
              </div>
            `;
            reply = data.reply || "ðŸŽ¨ Image generated successfully!";
            addMessage(reply + imageHtml, 'bot');
          } else {
            reply = data.reply || data.summary || "âš ï¸ No response received.";
            
            // ðŸš€ CHECK FOR CODING TASK METADATA
            if (data.codingTask) {
              // Use enhanced formatting for coding responses
              const messageElement = addMessageToDOM('', 'bot');
              const contentElement = messageElement.querySelector('.message-content');
              if (contentElement) {
                contentElement.innerHTML = formatMessageEnhanced(reply);
                contentElement.classList.add('coding-response');
                
                // Add code copy and download buttons
                addCodeCopyButtons(contentElement);
                addCodeDownloadButtons(contentElement);
                
                // Add coding task completion indicator
                const completionIndicator = document.createElement('div');
                completionIndicator.className = 'coding-completion-indicator';
                completionIndicator.innerHTML = `
                  <div class="coding-completion-content">
                    <span class="coding-completion-icon">âœ…</span>
                    <span class="coding-completion-text">${getCodingTaskCompletionText(data.codingTask.type)}</span>
                  </div>
                `;
                
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.appendChild(completionIndicator);
                chatMessages.scrollTop = chatMessages.scrollHeight;
              }
            } else {
              // Use enhanced formatting for all responses
              const messageElement = addMessageToDOM('', 'bot');
              const contentElement = messageElement.querySelector('.message-content');
              if (contentElement) {
                contentElement.innerHTML = formatMessageEnhanced(reply);
                addCodeCopyButtons(contentElement);
                addCodeDownloadButtons(contentElement);
              }
            }

            if (data.extracted) {
              addMessage(`ðŸ“„ File content: ${data.extracted}`, 'bot');
            }
          }

          // Save project
          if (reply && reply.length > 100) {
            projectManager.saveProject({
              title: message.substring(0, 50) + '...',
              content: reply,
              provider: provider
            });
          }

        } catch (error) {
          // Remove thinking indicator
          if (thinkingIndicator) {
            thinkingIndicator.remove();
          }
          throw error;
        }
      }

      // Handle Battle Mode - compare multiple AI providers
      async function handleBattleMode(message) {
        const availableProviders = ['openai', 'gemini', 'groq', 'deepseek'];
        const providersWithKeys = availableProviders.filter(provider => hasApiKeyForProvider(provider));
        
        if (providersWithKeys.length < 2) {
          addMessage('âš”ï¸ Battle Mode requires at least 2 AI providers with API keys configured. Please add more API keys in Settings.', 'bot');
          return;
        }
        
        addMessage(`âš”ï¸ **AI Battle Mode Activated!**\nComparing responses from ${providersWithKeys.length} AI providers...`, 'bot');
        
        // Show typing indicators for each provider
        const typingDivs = {};
        providersWithKeys.forEach(provider => {
          const typingDiv = addMessageToDOM(`${getProviderName(provider)} is thinking...`, 'bot', true);
          typingDivs[provider] = typingDiv;
        });
        
        // Send requests to all providers simultaneously
        const battlePromises = providersWithKeys.map(async (provider) => {
          try {
            const userApiKey = getApiKeyForProvider(provider);
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [{ role: "user", content: message }],
                provider: provider,
                apiKey: userApiKey
              }),
            });
            
            const data = await res.json();
            
            // Remove typing indicator
            if (typingDivs[provider] && typingDivs[provider].parentNode) {
              typingDivs[provider].parentNode.removeChild(typingDivs[provider]);
            }
            
            if (res.ok) {
              return {
                provider,
                success: true,
                response: data.reply || "No response",
                model: data.model
              };
            } else {
              return {
                provider,
                success: false,
                error: data.error || 'Unknown error'
              };
            }
          } catch (error) {
            // Remove typing indicator
            if (typingDivs[provider] && typingDivs[provider].parentNode) {
              typingDivs[provider].parentNode.removeChild(typingDivs[provider]);
            }
            
            return {
              provider,
              success: false,
              error: error.message
            };
          }
        });
        
        const results = await Promise.all(battlePromises);
        
        // Display battle results
        let battleHTML = `
          <div style="border: 2px solid #4285f4; border-radius: 12px; padding: 16px; margin: 16px 0; background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);">
            <h3 style="color: #1a73e8; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
              âš”ï¸ <strong>AI Battle Results</strong>
            </h3>
        `;
        
        results.forEach((result, index) => {
          const providerName = getProviderName(result.provider);
          const providerIcon = getProviderIcon(result.provider);
          
          if (result.success) {
            battleHTML += `
              <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; margin: 8px 0; background: white;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px;">${providerIcon}</span>
                  <strong style="color: #333;">${providerName}</strong>
                  ${result.model ? `<span style="font-size: 12px; color: #666; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${result.model}</span>` : ''}
                </div>
                <div style="color: #444; line-height: 1.5;">${formatMessage(result.response)}</div>
              </div>
            `;
          } else {
            battleHTML += `
              <div style="border: 1px solid #ffcdd2; border-radius: 8px; padding: 12px; margin: 8px 0; background: #ffebee;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <span style="font-size: 18px;">${providerIcon}</span>
                  <strong style="color: #d32f2f;">${providerName}</strong>
                  <span style="font-size: 12px; color: #d32f2f;">âŒ Failed</span>
                </div>
                <div style="color: #d32f2f; font-style: italic;">${result.error}</div>
              </div>
            `;
          }
        });
        
        battleHTML += `
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; text-align: center;">
            ðŸ† Compare the responses above to see which AI performed best for your query!
          </div>
        </div>
        `;
        
        addMessage(battleHTML, 'bot');
      }

      // ðŸš€ ENHANCED CODING TASK DETECTION
      function detectCodingTaskFrontend(message) {
        const lowerMessage = message.toLowerCase();
        
        // Coding patterns
        const codingPatterns = {
          createPage: ['create page', 'build page', 'make page', 'new page', 'design page', 'create website', 'build website', 'make website', 'new website', 'create component', 'build component', 'make component', 'new component', 'create app', 'build app', 'make app', 'new app'],
          modifyCode: ['modify', 'change', 'update', 'edit', 'alter', 'improve', 'add feature', 'add functionality', 'enhance', 'extend', 'refactor', 'restructure', 'reorganize'],
          debugCode: ['fix', 'debug', 'solve', 'resolve', 'error', 'bug', 'issue', 'not working', 'broken', 'problem', 'troubleshoot'],
          optimizeCode: ['optimize', 'improve performance', 'make faster', 'speed up', 'reduce size', 'compress', 'minify', 'efficient'],
          imageToCode: ['image to code', 'design to code', 'convert image', 'from image', 'screenshot to code', 'mockup to code', 'ui to code'],
          reviewCode: ['review', 'check', 'analyze', 'audit', 'evaluate', 'code review', 'best practices', 'security check']
        };
        
        // Technology keywords
        const techKeywords = ['html', 'css', 'javascript', 'js', 'react', 'vue', 'angular', 'svelte', 'typescript', 'ts', 'sass', 'scss', 'tailwind', 'bootstrap', 'jquery', 'dom', 'responsive', 'mobile', 'node', 'nodejs', 'express', 'api', 'rest', 'graphql', 'python', 'django', 'flask', 'php', 'laravel', 'java', 'spring', 'c#', 'asp.net', 'ruby', 'rails', 'database', 'db', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'firebase', 'supabase'];
        
        let detectedTask = null;
        let confidence = 0;
        let technologies = [];
        
        // Check for specific coding patterns
        for (const [taskType, patterns] of Object.entries(codingPatterns)) {
          for (const pattern of patterns) {
            if (lowerMessage.includes(pattern)) {
              detectedTask = taskType;
              confidence = 0.9;
              break;
            }
          }
          if (detectedTask) break;
        }
        
        // Check for technology keywords
        for (const tech of techKeywords) {
          if (lowerMessage.includes(tech)) {
            technologies.push(tech);
            if (!detectedTask) {
              detectedTask = 'general_coding';
              confidence = 0.7;
            }
          }
        }
        
        return {
          isCoding: confidence >= 0.7,
          taskType: detectedTask,
          confidence: confidence,
          technologies: technologies
        };
      }

      // Get coding task completion text
      function getCodingTaskCompletionText(taskType) {
        const completionTexts = {
          createPage: 'Page/App Creation Complete',
          modifyCode: 'Code Modification Complete',
          debugCode: 'Bug Fix Complete',
          optimizeCode: 'Optimization Complete',
          imageToCode: 'Image to Code Conversion Complete',
          reviewCode: 'Code Review Complete',
          general_coding: 'Coding Task Complete'
        };
        
        return completionTexts[taskType] || 'Coding Task Complete';
      }

      // ðŸš€ ENHANCED: AI Thinking Indicator with progress
      function showAIThinkingIndicator(provider) {
        const messagesContainer = document.getElementById('chatMessages');
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'ai-thinking-indicator';
        
        const providerName = getProviderName(provider);
        const providerIcon = getProviderIcon(provider);
        
        indicatorDiv.innerHTML = `
          <div class="thinking-content">
            <div class="thinking-header">
              <span class="thinking-icon">${providerIcon}</span>
              <span class="thinking-text">${providerName} is analyzing...</span>
            </div>
            <div class="thinking-progress">
              <div class="thinking-progress-bar"></div>
            </div>
            <div class="thinking-steps">
              <div class="thinking-step active">
                <i class="fas fa-brain"></i> Understanding your request
              </div>
              <div class="thinking-step">
                <i class="fas fa-lightbulb"></i> Planning approach
              </div>
              <div class="thinking-step">
                <i class="fas fa-code"></i> Generating solution
              </div>
            </div>
          </div>
        `;
        
        messagesContainer.appendChild(indicatorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Animate thinking steps
        let currentStep = 0;
        const steps = indicatorDiv.querySelectorAll('.thinking-step');
        const progressBar = indicatorDiv.querySelector('.thinking-progress-bar');
        
        const stepInterval = setInterval(() => {
          if (currentStep < steps.length) {
            steps[currentStep].classList.add('active');
            progressBar.style.width = ((currentStep + 1) / steps.length * 100) + '%';
            currentStep++;
          }
        }, 800);
        
        return {
          element: indicatorDiv,
          remove: function() {
            clearInterval(stepInterval);
            if (this.element && this.element.parentNode) {
              this.element.parentNode.removeChild(this.element);
            }
          }
        };
      }

      // Add coding task indicator
      function addCodingTaskIndicator(codingTask) {
        const chatMessages = document.getElementById('chatMessages');
        
        const taskNames = {
          createPage: 'Page/App Creation',
          modifyCode: 'Code Modification',
          debugCode: 'Bug Fixing & Debugging',
          optimizeCode: 'Performance Optimization',
          imageToCode: 'Image to Code Conversion',
          reviewCode: 'Code Review & Analysis',
          general_coding: 'General Coding'
        };
        
        const taskIcons = {
          createPage: 'ðŸ—ï¸',
          modifyCode: 'ðŸ”§',
          debugCode: 'ðŸ›',
          optimizeCode: 'âš¡',
          imageToCode: 'ðŸ–¼ï¸âž¡ï¸ðŸ’»',
          reviewCode: 'ðŸ”',
          general_coding: 'ðŸ’»'
        };
        
        const taskName = taskNames[codingTask.taskType] || 'Coding Task';
        const taskIcon = taskIcons[codingTask.taskType] || 'ðŸ’»';
        
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'coding-task-indicator';
        indicatorDiv.innerHTML = `
          <div class="coding-indicator-content">
            <div class="coding-indicator-header">
              <span class="coding-indicator-icon">${taskIcon}</span>
              <span class="coding-indicator-title">Coding Mode Activated</span>
            </div>
            <div class="coding-indicator-details">
              <div class="coding-task-type">Task: ${taskName}</div>
              ${codingTask.technologies.length > 0 ? `<div class="coding-technologies">Technologies: ${codingTask.technologies.slice(0, 5).join(', ')}</div>` : ''}
              <div class="coding-confidence">Confidence: ${Math.round(codingTask.confidence * 100)}%</div>
            </div>
          </div>
        `;
        
        chatMessages.appendChild(indicatorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Task detection for Smart Auto-Select
      function detectTaskType(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('function') || lowerMessage.includes('debug') || lowerMessage.includes('javascript') || lowerMessage.includes('python') || lowerMessage.includes('html') || lowerMessage.includes('css')) {
          return 'coding';
        }
        if (lowerMessage.includes('image') || lowerMessage.includes('picture') || lowerMessage.includes('generate') || lowerMessage.includes('draw') || lowerMessage.includes('create') && (lowerMessage.includes('visual') || lowerMessage.includes('art'))) {
          return 'image';
        }
        if (lowerMessage.includes('fast') || lowerMessage.includes('quick') || lowerMessage.includes('speed') || lowerMessage.includes('urgent')) {
          return 'speed';
        }
        if (lowerMessage.includes('analyze') || lowerMessage.includes('data') || lowerMessage.includes('research') || lowerMessage.includes('study') || lowerMessage.includes('examine')) {
          return 'analytical';
        }
        if (lowerMessage.includes('creative') || lowerMessage.includes('story') || lowerMessage.includes('poem') || lowerMessage.includes('write') || lowerMessage.includes('novel')) {
          return 'creative';
        }
        if (lowerMessage.includes('multiple') || lowerMessage.includes('different') || lowerMessage.includes('various') || lowerMessage.includes('options')) {
          return 'variety';
        }
        
        return 'general';
      }

      // Get recommended provider for task type
      function getRecommendedProvider(taskType) {
        const recommendations = {
          coding: 'deepseek',
          image: 'stability',
          speed: 'groq',
          analytical: 'gemini',
          creative: 'openai',
          variety: 'openrouter',
          general: 'openai'
        };
        
        return recommendations[taskType] || 'openai';
      }

      // Get provider icon
      function getProviderIcon(provider) {
        const icons = {
          openai: 'ðŸ¤–',
          gemini: 'âœ¨',
          groq: 'âš¡',
          deepseek: 'ðŸ§ ',
          stability: 'ðŸŽ¨',
          openrouter: 'ðŸŒ'
        };
        return icons[provider] || 'ðŸ¤–';
      }

      // Format message content
      function formatMessage(text) {
        if (!text) return text;
        
        let formatted = text;
        
        // Convert **bold** to <strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
      }

      // Update send button state
      function updateSendButton(processing) {
        const sendBtn = document.getElementById('sendBtn');
        if (processing) {
          sendBtn.innerHTML = '<div class="loading"></div>';
          sendBtn.disabled = true;
        } else {
          sendBtn.innerHTML = 'Generate';
          sendBtn.disabled = false;
        }
      }

      // Provider functions
      function getProviderName(provider) {
        const names = {
          openai: 'OpenAI GPT',
          gemini: 'Google Gemini',
          groq: 'Groq Lightning',
          deepseek: 'DeepSeek Coder',
          stability: 'Stability AI',
          openrouter: 'OpenRouter Hub'
        };
        return names[provider] || provider;
      }

      // API Key management
      function getStoredApiKeys() {
        try {
          const keys = storage.getItem('apiKeys_encrypted');
          if (!keys) return {};
          
          const encryptedKeys = JSON.parse(keys);
          const decryptedKeys = {};
          
          Object.entries(encryptedKeys).forEach(([provider, encryptedKey]) => {
            decryptedKeys[provider] = decryptApiKey(encryptedKey);
          });
          
          return decryptedKeys;
        } catch (e) {
          return {};
        }
      }

      function encryptApiKey(key) {
        if (!key) return '';
        
        try {
          // Generate a random salt for each encryption
          const salt = new Uint8Array(16);
          if (window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(salt);
          } else {
            // Fallback for environments without crypto API
            for (let i = 0; i < 16; i++) {
              salt[i] = Math.floor(Math.random() * 256);
            }
          }
          
          const encoder = new TextEncoder();
          const data = encoder.encode(key);
          
          // Use a more secure encryption method with salt
          const encryptionKey = 'AI_STUDIO_2024_SECURE_KEY_V2';
          const keyBytes = encoder.encode(encryptionKey);
          
          // Simple but better than XOR - use salt + key derivation
          const encrypted = new Uint8Array(data.length);
          for (let i = 0; i < data.length; i++) {
            const saltByte = salt[i % salt.length];
            const keyByte = keyBytes[i % keyBytes.length];
            encrypted[i] = data[i] ^ saltByte ^ keyByte;
          }
          
          // Combine salt + encrypted data
          const combined = new Uint8Array(salt.length + encrypted.length);
          combined.set(salt);
          combined.set(encrypted, salt.length);
          
          return btoa(String.fromCharCode(...combined));
        } catch (e) {
          console.warn('Encryption failed, using fallback:', e);
          // Fallback to simple XOR if modern crypto fails
          const encryptionKey = 'AI_STUDIO_2024_SECURE';
          let encrypted = '';
          for (let i = 0; i < key.length; i++) {
            const keyChar = encryptionKey.charCodeAt(i % encryptionKey.length);
            const encrypted_char = key.charCodeAt(i) ^ keyChar;
            encrypted += String.fromCharCode(encrypted_char);
          }
          return btoa(encrypted);
        }
      }

      function decryptApiKey(encryptedKey) {
        if (!encryptedKey) return '';
        try {
          const combined = new Uint8Array(atob(encryptedKey).split('').map(c => c.charCodeAt(0)));
          
          // Check if this is the new format (has salt)
          if (combined.length > 16) {
            // Extract salt and encrypted data
            const salt = combined.slice(0, 16);
            const encrypted = combined.slice(16);
            
            const encryptionKey = 'AI_STUDIO_2024_SECURE_KEY_V2';
            const encoder = new TextEncoder();
            const keyBytes = encoder.encode(encryptionKey);
            
            // Decrypt
            const decrypted = new Uint8Array(encrypted.length);
            for (let i = 0; i < encrypted.length; i++) {
              const saltByte = salt[i % salt.length];
              const keyByte = keyBytes[i % keyBytes.length];
              decrypted[i] = encrypted[i] ^ saltByte ^ keyByte;
            }
            
            return new TextDecoder().decode(decrypted);
          } else {
            // Fallback for old format
            const encrypted = atob(encryptedKey);
            const encryptionKey = 'AI_STUDIO_2024_SECURE';
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
              const keyChar = encryptionKey.charCodeAt(i % encryptionKey.length);
              const decrypted_char = encrypted.charCodeAt(i) ^ keyChar;
              decrypted += String.fromCharCode(decrypted_char);
            }
            return decrypted;
          }
        } catch (e) {
          console.warn('Failed to decrypt API key:', e);
          return '';
        }
      }

      function hasApiKeyForProvider(provider) {
        const keys = getStoredApiKeys();
        return keys[provider] && keys[provider].length > 0;
      }

      function getApiKeyForProvider(provider) {
        const keys = getStoredApiKeys();
        return keys[provider] || '';
      }

      // Modal functions
      function openApiKeysModal() {
        const modal = document.getElementById('apiKeysModal');
        const keys = getStoredApiKeys();
        
        document.getElementById('openaiKey').value = keys.openai || '';
        document.getElementById('geminiKey').value = keys.gemini || '';
        document.getElementById('groqKey').value = keys.groq || '';
        document.getElementById('deepseekKey').value = keys.deepseek || '';
        document.getElementById('stabilityKey').value = keys.stability || '';
        document.getElementById('openrouterKey').value = keys.openrouter || '';
        
        modal.style.display = 'flex';
      }

      function closeApiKeysModal() {
        document.getElementById('apiKeysModal').style.display = 'none';
      }

      function saveApiKeys() {
        const keys = {
          openai: document.getElementById('openaiKey').value.trim(),
          gemini: document.getElementById('geminiKey').value.trim(),
          groq: document.getElementById('groqKey').value.trim(),
          deepseek: document.getElementById('deepseekKey').value.trim(),
          stability: document.getElementById('stabilityKey').value.trim(),
          openrouter: document.getElementById('openrouterKey').value.trim()
        };

        try {
          const encryptedKeys = {};
          Object.entries(keys).forEach(([provider, key]) => {
            if (key && key.trim()) {
              encryptedKeys[provider] = encryptApiKey(key.trim());
            }
          });
          
          storage.setItem('apiKeys_encrypted', JSON.stringify(encryptedKeys));
          closeApiKeysModal();
          addMessage('ðŸ” API keys saved securely!', 'bot');
        } catch (e) {
          alert('Failed to save API keys. Please try again.');
        }
      }

      function clearAllKeys() {
        if (confirm('Are you sure you want to clear all API keys?')) {
          storage.removeItem('apiKeys_encrypted');
          document.getElementById('openaiKey').value = '';
          document.getElementById('geminiKey').value = '';
          document.getElementById('groqKey').value = '';
          document.getElementById('deepseekKey').value = '';
          document.getElementById('stabilityKey').value = '';
          document.getElementById('openrouterKey').value = '';
          addMessage('ðŸ” All API keys cleared.', 'bot');
        }
      }

      // Profile functions
      function openProfileModal() {
        const modal = document.getElementById('profileModal');
        document.getElementById('userName').value = userPersonalization.profile.name || '';
        document.getElementById('businessType').value = userPersonalization.profile.businessType || '';
        document.getElementById('writingStyle').value = userPersonalization.profile.writingStyle || 'professional';
        document.getElementById('responseLength').value = userPersonalization.profile.responseLength || 'medium';
        modal.style.display = 'flex';
      }

      function closeProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
      }

      function saveProfile() {
        const updates = {
          name: document.getElementById('userName').value,
          businessType: document.getElementById('businessType').value,
          writingStyle: document.getElementById('writingStyle').value,
          responseLength: document.getElementById('responseLength').value
        };
        
        userPersonalization.updateProfile(updates);
        closeProfileModal();
        addMessage('âœ… Profile updated!', 'bot');
      }

      // Projects functions
      function openProjectsModal() {
        const modal = document.getElementById('projectsModal');
        const listContainer = document.getElementById('projectsList');
        
        listContainer.innerHTML = '';
        projectManager.projects.forEach(project => {
          const projectItem = document.createElement('div');
          projectItem.innerHTML = `
            <div style="padding: 15px; border: 1px solid var(--gray-200); border-radius: 8px; margin-bottom: 10px;">
              <h4 style="margin: 0 0 5px 0;">${project.title}</h4>
              <p style="margin: 0; color: var(--gray-600); font-size: 14px;">
                ${new Date(project.createdAt).toLocaleDateString()} â€¢ ${project.provider} â€¢ ${project.wordCount} words
              </p>
              <button class="project-download-btn btn btn-secondary" data-project-id="${project.id}" style="margin-top: 10px; padding: 6px 12px;">
                <i class="fas fa-download"></i> Download
              </button>
            </div>
          `;
          listContainer.appendChild(projectItem);
        });
        
        modal.style.display = 'flex';
      }

      function closeProjectsModal() {
        document.getElementById('projectsModal').style.display = 'none';
      }

      function downloadProject(id) {
        const project = projectManager.projects.find(p => p.id === id);
        if (!project) return;

        const content = `${project.title}\n\nGenerated: ${new Date(project.createdAt).toLocaleString()}\nProvider: ${project.provider}\nWords: ${project.wordCount}\n\n${project.content}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      function exportAllProjects() {
        const data = {
          projects: projectManager.projects,
          exportDate: new Date().toISOString(),
          totalProjects: projectManager.projects.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_projects_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Chat history functions - Enhanced system for multiple chats
      function saveChatHistory() {
        try {
          // Save current chat
          localStorage.setItem('currentChat', JSON.stringify(currentChat));
          
          // Don't auto-save to history list - only save when explicitly starting new chat
        } catch (e) {
          console.warn('Could not save chat history:', e);
        }
      }

      // ===== LEGACY COMPATIBILITY FUNCTIONS =====
      // These functions are kept for compatibility but now use the state manager
      
      function formatMessage(text) {
        if (!text) return text;
        
        let formatted = text;
        
        // Convert **bold** to <strong>
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
      }

      function loadChatHistory() {
        try {
          const saved = localStorage.getItem('currentChat');
          if (saved) {
            currentChat = JSON.parse(saved);
            
            if (currentChat.length > 0) {
              showChatInterface();
              // Clear existing messages first
              document.getElementById('chatMessages').innerHTML = '';
              
              currentChat.forEach(msg => {
                if (msg.sender && msg.text) {
                  addMessage(msg.text, msg.sender);
                }
              });
            }
          }
        } catch (e) {
          console.warn('Could not load chat history:', e);
        }
      }



      function exportChat() {
        const activeChat = chatState.getActiveChat();
        
        if (!activeChat || activeChat.messages.length === 0) {
          exportAllChatHistory();
          return;
        }

        let exportText = `AI ChatBot - ${activeChat.title}\n`;
        exportText += `Exported: ${new Date().toLocaleString()}\n`;
        exportText += `Messages: ${activeChat.messages.length}\n\n`;
        exportText += '='.repeat(50) + '\n\n';

        activeChat.messages.forEach(msg => {
          const sender = msg.sender === 'user' ? 'You' : 'AI';
          const timestamp = new Date(msg.timestamp).toLocaleTimeString();
          exportText += `[${timestamp}] ${sender}: ${msg.text}\n\n`;
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        addMessage('ðŸ“¥ Chat exported successfully!', 'bot');
      }

      function exportAllChatsAsPDF() {
        const chats = chatState.getAllChats();
        
        if (chats.length === 0) {
          addMessage('ðŸ“„ No chats to export!', 'bot');
          return;
        }

        try {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Title page
          doc.setFontSize(20);
          doc.text('AI ChatBot - Chat History', 20, 30);
          doc.setFontSize(12);
          doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
          doc.text(`Total Conversations: ${chats.length}`, 20, 55);
          
          let yPosition = 80;
          
          chats.forEach((chat, index) => {
            // Check if we need a new page
            if (yPosition > 250) {
              doc.addPage();
              yPosition = 20;
            }
            
            // Chat header
            doc.setFontSize(14);
            doc.text(`${index + 1}. ${chat.title}`, 20, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.text(`Created: ${new Date(chat.createdAt).toLocaleDateString()} | Messages: ${chat.messages.length}`, 20, yPosition);
            yPosition += 5;
            
            if (chat.tags && chat.tags.length > 0) {
              doc.text(`Tags: ${chat.tags.join(', ')}`, 20, yPosition);
              yPosition += 5;
            }
            
            if (chat.starred) {
              doc.text('â­ Starred', 20, yPosition);
              yPosition += 5;
            }
            
            yPosition += 5;
            
            // Chat content (truncated for PDF)
            const content = chat.messages.slice(0, 3).map(msg => 
              `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text.substring(0, 200)}...`
            ).join('\n\n');
            
            const lines = doc.splitTextToSize(content, 170);
            doc.text(lines, 20, yPosition);
            yPosition += lines.length * 5 + 15;
          });
          
          doc.save(`AI_ChatBot_History_${new Date().toISOString().split('T')[0]}.pdf`);
          addMessage('ðŸ“„ Chat history exported as PDF successfully!', 'bot');
          
        } catch (error) {
          console.error('PDF export error:', error);
          exportAllChatHistory(); // Fallback to text export
        }
      }

      // Advanced Chat History Functions
      
      // Chat Search Modal
      function openChatSearchModal() {
        document.getElementById('chatSearchModal').style.display = 'flex';
        document.getElementById('chatSearchInput').focus();
        
        // Add real-time search
        document.getElementById('chatSearchInput').oninput = performChatSearch;
      }

      function closeChatSearchModal() {
        document.getElementById('chatSearchModal').style.display = 'none';
        document.getElementById('chatSearchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
      }

      // Chat Search (refactored for state manager)
      function performChatSearch() {
        const query = document.getElementById('chatSearchInput').value.toLowerCase();
        const resultsContainer = document.getElementById('searchResults');
        
        if (query.length < 2) {
          resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Type at least 2 characters to search...</div>';
          return;
        }

        const results = chatState.searchChats(query);

        if (results.length === 0) {
          resultsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No results found</div>';
          return;
        }

        let resultsHTML = '';
        results.forEach(result => {
          const { chat, matchType, message } = result;
          let snippet = '';
          
          switch (matchType) {
            case 'title':
              snippet = chat.title;
              break;
            case 'message':
              snippet = message ? message.text.substring(0, 100) + '...' : '';
              break;
            case 'tag':
              snippet = chat.tags.join(', ');
              break;
          }
          
          resultsHTML += `
            <div class="search-result-item" data-chat-id="${chat.id}" style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer;">
              <div style="font-weight: 600; margin-bottom: 4px;">${chat.title}</div>
              <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Match in ${matchType} â€¢ ${new Date(chat.updatedAt).toLocaleDateString()}</div>
              <div style="font-size: 11px; color: #888; line-height: 1.4;">${snippet}</div>
            </div>
          `;
        });

        resultsContainer.innerHTML = resultsHTML;
      }

      // Chat Edit Modal (refactored for state manager)
      function openChatEditModal(chatId) {
        const chat = chatState.getChat(chatId);
        if (!chat) return;
        
        const modal = document.getElementById('chatEditModal');
        modal.dataset.editingChatId = chatId;
        
        document.getElementById('editChatTitle').value = chat.title;
        document.getElementById('editChatTags').value = chat.tags ? chat.tags.join(', ') : '';
        document.getElementById('editChatStarred').checked = chat.starred || false;
        
        modal.style.display = 'flex';
      }

      function closeChatEditModal() {
        const modal = document.getElementById('chatEditModal');
        modal.style.display = 'none';
        delete modal.dataset.editingChatId;
      }

      function saveChatEdit() {
        const modal = document.getElementById('chatEditModal');
        const chatId = modal.dataset.editingChatId;
        if (!chatId) return;
        
        const newTitle = document.getElementById('editChatTitle').value.trim();
        const newTags = document.getElementById('editChatTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const isStarred = document.getElementById('editChatStarred').checked;
        
        const updates = {
          title: newTitle || 'Untitled Chat',
          tags: newTags,
          starred: isStarred
        };
        
        if (chatState.updateChat(chatId, updates)) {
          closeChatEditModal();
          addMessage('âœ… Chat updated successfully!', 'bot');
        }
      }

      // Timeline View
      function toggleTimelineView() {
        const isTimeline = storage.getItem('timelineView') === 'true';
        storage.setItem('timelineView', (!isTimeline).toString());
        updateChatHistoryUI(); // Use the new state manager UI update
      }

      // Filter Functions for chat history
      function toggleChatFilters() {
        const filtersDiv = document.getElementById('chatFilters');
        if (filtersDiv.style.display === 'none' || !filtersDiv.style.display) {
          filtersDiv.style.display = 'block';
        } else {
          filtersDiv.style.display = 'none';
        }
      }

      function clearFilters() {
        const aiProviderFilter = document.getElementById('aiProviderFilter');
        const dateFilter = document.getElementById('dateFilter');
        if (aiProviderFilter) aiProviderFilter.value = '';
        if (dateFilter) dateFilter.value = '';
        updateChatHistoryUI(); // Refresh UI
      }

      function showStarredChats() {
        const chats = chatState.getAllChats();
        const starredChats = chats.filter(chat => chat.starred);
        
        if (starredChats.length === 0) {
          addMessage('â­ No starred chats found. Star important chats by editing them!', 'bot');
          return;
        }
        
        // Temporarily show only starred chats in UI
        const historyContainer = document.getElementById('chatHistory');
        let historyHTML = '<div style="color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 8px;">â­ Starred Chats</div>';
        
        starredChats.forEach(chat => {
          const starIcon = '<i class="fas fa-star" style="color: #f59e0b;"></i>';
          const tags = chat.tags ? chat.tags.map(tag => 
            `<span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 10px; font-size: 10px;">${tag}</span>`
          ).join(' ') : '';
          
          historyHTML += `
            <div class="history-item" style="position: relative; padding: 8px; margin: 4px 0;">
              <div class="chat-item-content" data-chat-id="${chat.id}" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  ${starIcon}
                  <div style="font-weight: 500; font-size: 12px; flex: 1;">${chat.title}</div>
                  <button class="chat-edit-btn" data-chat-id="${chat.id}" style="background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; padding: 2px;">
                    <i class="fas fa-ellipsis-v" style="font-size: 10px;"></i>
                  </button>
                </div>
                <div style="font-size: 10px; opacity: 0.7; display: flex; justify-content: space-between; align-items: center;">
                  <span>${new Date(chat.updatedAt).toLocaleTimeString()}</span>
                  <span>${chat.messages.length} msgs</span>
                </div>
                ${tags ? `<div style="margin-top: 4px;">${tags}</div>` : ''}
                ${chat.category ? `<div style="font-size: 9px; opacity: 0.6; margin-top: 2px;">${chat.category}</div>` : ''}
              </div>
            </div>
          `;
        });
        
        historyContainer.innerHTML = historyHTML;
      }

      // Missing three-dot menu functions
      function importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          try {
            const text = await file.text();
            let chatData;
            
            if (file.name.endsWith('.json')) {
              chatData = JSON.parse(text);
            } else {
              // Simple text import - create a new chat with the content
              chatData = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                messages: [
                  { sender: 'user', text: 'Imported content:', timestamp: Date.now() },
                  { sender: 'bot', text: text, timestamp: Date.now() + 1 }
                ]
              };
            }
            
            // Create new chat with imported data
            const chatId = chatState.createChat(chatData.title);
            const chat = chatState.getChat(chatId);
            
            if (chatData.messages && Array.isArray(chatData.messages)) {
              chat.messages = chatData.messages.map(msg => ({
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sender: msg.sender || 'user',
                text: msg.text || msg.content || '',
                timestamp: msg.timestamp || Date.now()
              }));
              
              chatState.persistState();
              chatState.notifyListeners();
            }
            
            addMessage('ðŸ“¤ Chat imported successfully!', 'bot');
            closeThreeDotModal();
            
          } catch (error) {
            console.error('Import error:', error);
            addMessage('âŒ Failed to import chat. Please check the file format.', 'bot');
          }
        };
        
        input.click();
      }

      function showKeyboardShortcuts() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
              <h3>âŒ¨ï¸ Keyboard Shortcuts</h3>
              <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-family: monospace;">
                <div>
                  <h4 style="color: #4285f4; margin-bottom: 8px;">Chat Controls</h4>
                  <div><kbd>Enter</kbd> Send message</div>
                  <div><kbd>Alt + N</kbd> New chat</div>
                  <div><kbd>Alt + S</kbd> Search chats</div>
                  <div><kbd>Alt + E</kbd> Export chat</div>
                  <div><kbd>Escape</kbd> Close modals</div>
                </div>
                <div>
                  <h4 style="color: #4285f4; margin-bottom: 8px;">Features</h4>
                  <div><kbd>Alt + O</kbd> Open settings</div>
                  <div><kbd>Alt + U</kbd> Upload file</div>
                  <div><kbd>Alt + T</kbd> Test server</div>
                  <div><kbd>Alt + M</kbd> Test microphone</div>
                  <div><kbd>Alt + /</kbd> Show shortcuts</div>
                </div>
              </div>
              <div style="margin-top: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; font-size: 14px;">
                ðŸ’¡ <strong>Tip:</strong> We use Alt key instead of Ctrl to avoid browser conflicts!
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary modal-close">Close</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelectorAll('.modal-close').forEach(btn => {
          btn.addEventListener('click', () => {
            modal.remove();
          });
        });
        
        closeThreeDotModal();
      }

      function showAboutModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
              <h3>â„¹ï¸ About AI ChatBot</h3>
              <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 8px;">ðŸ¤–</div>
                <h2 style="color: #4285f4; margin: 0;">AI ChatBot</h2>
                <p style="color: #666; margin: 4px 0;">Multi-AI Content Studio</p>
                <p style="color: #999; font-size: 14px;">Version 2.0.0</p>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
                <div>
                  <h4 style="color: #4285f4;">ðŸš€ Features</h4>
                  <ul style="font-size: 14px; line-height: 1.6;">
                    <li>6 AI Providers</li>
                    <li>Battle Mode</li>
                    <li>Smart Auto-Select</li>
                    <li>File Processing</li>
                    <li>Voice Input</li>
                    <li>Image Generation</li>
                  </ul>
                </div>
                <div>
                  <h4 style="color: #4285f4;">ðŸ¤– AI Providers</h4>
                  <ul style="font-size: 14px; line-height: 1.6;">
                    <li>OpenAI GPT</li>
                    <li>Google Gemini</li>
                    <li>Groq Lightning</li>
                    <li>DeepSeek Coder</li>
                    <li>Stability AI</li>
                    <li>OpenRouter Hub</li>
                  </ul>
                </div>
              </div>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h4 style="color: #4285f4; margin-top: 0;">ðŸ” Privacy & Security</h4>
                <p style="font-size: 14px; margin: 0;">Your API keys are encrypted and stored locally. No data is sent to our servers.</p>
              </div>
              
              <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
                Built with â¤ï¸ for AI enthusiasts
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary modal-close">Close</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelectorAll('.modal-close').forEach(btn => {
          btn.addEventListener('click', () => {
            modal.remove();
          });
        });
        
        closeThreeDotModal();
      }

      function loadCurrentChat() {
        showChatInterface();
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
      }

      // File upload functions
      function uploadFile() {
        document.getElementById('fileInput').click();
      }

      // Enhanced file upload with better error handling
      document.getElementById('fileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const maxSize = (settings.maxFileSize || 5) * 1024 * 1024;
        
        if (file.size > maxSize) {
          alert(`File too large. Maximum size is ${settings.maxFileSize || 5}MB.`);
          return;
        }
        
        const allowedTypes = ['.txt', '.docx', '.xlsx', '.pptx', '.pdf', '.csv'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
          alert('Unsupported file type. Allowed: ' + allowedTypes.join(', '));
          return;
        }
        
        attachedFile = file;
        addMessage(`ðŸ“Ž Document attached: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'user');
      };

      // Photo upload handler
      document.getElementById('photoInput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const maxSize = 10 * 1024 * 1024; // 10MB for images
        
        if (file.size > maxSize) {
          alert('Image too large. Maximum size is 10MB.');
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          return;
        }
        
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const imagePreview = `
            <div style="margin: 10px 0;">
              <img src="${e.target.result}" alt="Uploaded Image" style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #ddd;" />
              <p style="margin-top: 8px; font-size: 0.9em; color: #666;">
                ðŸ“· Image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          `;
          addMessage(imagePreview, 'user');
        };
        reader.readAsDataURL(file);
        
        attachedFile = file;
      };

      // Voice functions with enhanced permission handling
      async function toggleVoice() {
        const micBtn = document.getElementById('micBtn');
        const micIcon = document.getElementById('micIcon');
        const micStatus = document.getElementById('micStatus');
        
        // Check if browser supports speech recognition
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
          addMessage('âŒ Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.', 'bot');
          return;
        }
        
        // If currently listening, stop
        if (isListening) {
          if (recognition) {
            recognition.stop();
          }
          isListening = false;
          micBtn.classList.remove('recording');
          micIcon.className = 'fas fa-microphone';
          micBtn.title = 'Voice input';
          micStatus.style.display = 'none';
          return;
        }
        
        // Show testing status
        micStatus.style.display = 'block';
        micStatus.style.background = '#f59e0b'; // Orange for testing
        
        // Check microphone permissions first
        try {
          // Test microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: true,
            video: false 
          });
          
          // Stop the test stream immediately
          stream.getTracks().forEach(track => track.stop());
          
          // If we get here, permissions are granted
          micStatus.style.background = '#10b981'; // Green for success
          setTimeout(() => {
            startVoiceRecognition();
          }, 500);
          
        } catch (permissionError) {
          console.error('Microphone permission error:', permissionError);
          
          micStatus.style.display = 'block';
          micStatus.style.background = '#ef4444'; // Red for error
          
          let errorMessage = 'ðŸŽ¤ Microphone access required for voice input.\n\n';
          
          if (permissionError.name === 'NotAllowedError') {
            errorMessage += 'ðŸš¨ **System Permission Denied**\n\n';
            errorMessage += 'Your system or browser has blocked microphone access. This could be due to:\n\n';
            errorMessage += 'â€¢ System privacy settings (Windows/Mac security settings)\n';
            errorMessage += 'â€¢ Another application using the microphone\n';
            errorMessage += 'â€¢ Corporate/school network restrictions\n';
            errorMessage += 'â€¢ Browser security policies\n\n';
            errorMessage += '**To fix this:**\n';
            errorMessage += '1. Check if other apps (Zoom, Teams, etc.) are using your microphone\n';
            errorMessage += '2. Check your system privacy settings:\n';
            errorMessage += '   â€¢ Windows: Settings > Privacy > Microphone\n';
            errorMessage += '   â€¢ Mac: System Preferences > Security & Privacy > Microphone\n';
            errorMessage += '3. Restart your browser completely\n';
            errorMessage += '4. Try the microphone test (Alt + M) after making changes';
          } else if (permissionError.name === 'NotFoundError') {
            errorMessage += 'âŒ No microphone found. Please connect a microphone and try again.';
          } else if (permissionError.name === 'NotReadableError') {
            errorMessage += 'âŒ Microphone is being used by another application. Please close other apps using the microphone and try again.';
          } else {
            errorMessage += 'âŒ Unable to access microphone. Please check your browser and system settings.';
          }
          
          addMessage(errorMessage, 'bot');
          
          // Show permission help modal
          setTimeout(() => {
            showMicrophoneHelp();
          }, 1000);
          
          // Hide error status after 5 seconds
          setTimeout(() => {
            micStatus.style.display = 'none';
          }, 5000);
        }
      }
      
      function startVoiceRecognition() {
        const micBtn = document.getElementById('micBtn');
        const micIcon = document.getElementById('micIcon');
        const micStatus = document.getElementById('micStatus');
        
        if (!recognition) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = "en-US";

          recognition.onstart = () => {
            console.log('ðŸŽ¤ Voice recognition started');
            isListening = true;
            micBtn.classList.add('recording');
            micIcon.className = 'fas fa-stop';
            micBtn.title = 'Stop recording - Speak now!';
            micStatus.style.display = 'block';
            micStatus.style.background = '#ef4444'; // Red for recording
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('ðŸŽ¤ Voice transcript:', transcript);
            document.getElementById('userInput').value = transcript;
            
            // Stop recording state
            isListening = false;
            micBtn.classList.remove('recording');
            micIcon.className = 'fas fa-microphone';
            micBtn.title = 'Voice input';
            micStatus.style.display = 'block';
            micStatus.style.background = '#10b981'; // Green for success
            
            // Hide status after 3 seconds
            setTimeout(() => {
              micStatus.style.display = 'none';
            }, 3000);
            
            addMessage('ðŸŽ¤ Voice input captured: "' + transcript + '"', 'bot');
          };

          recognition.onerror = (event) => {
            console.error("Voice recognition error:", event.error);
            
            // Stop recording state
            isListening = false;
            micBtn.classList.remove('recording');
            micIcon.className = 'fas fa-microphone';
            micBtn.title = 'Voice input';
            micStatus.style.display = 'block';
            micStatus.style.background = '#ef4444'; // Red for error
            
            // Hide status after 5 seconds
            setTimeout(() => {
              micStatus.style.display = 'none';
            }, 5000);
            
            // Handle different error types with specific guidance
            let errorMessage = 'âŒ Voice recognition error: ';
            switch(event.error) {
              case 'audio-capture':
                errorMessage += 'Cannot access microphone. Please check browser permissions.';
                showMicrophoneHelp();
                break;
              case 'not-allowed':
                errorMessage += 'Microphone access denied. Please allow microphone access.';
                showMicrophoneHelp();
                break;
              case 'no-speech':
                errorMessage += 'No speech detected. Please speak clearly and try again.';
                break;
              case 'network':
                errorMessage += 'Network error. Please check your internet connection.';
                break;
              case 'service-not-allowed':
                errorMessage += 'Speech service not allowed. Please try again.';
                break;
              default:
                errorMessage += event.error + '. Please try again.';
            }
            
            addMessage(errorMessage, 'bot');
          };

          recognition.onend = () => {
            console.log('ðŸŽ¤ Voice recognition ended');
            // Stop recording state
            isListening = false;
            micBtn.classList.remove('recording');
            micIcon.className = 'fas fa-microphone';
            micBtn.title = 'Voice input';
            
            // Only hide status if it's not showing success/error
            if (micStatus.style.background !== '#10b981' && micStatus.style.background !== '#ef4444') {
              micStatus.style.display = 'none';
            }
          };
        }

        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to start voice recognition:', error);
          addMessage('âŒ Failed to start voice recognition. Please try again.', 'bot');
          
          const micStatus = document.getElementById('micStatus');
          micStatus.style.display = 'block';
          micStatus.style.background = '#ef4444';
          setTimeout(() => {
            micStatus.style.display = 'none';
          }, 3000);
        }
      }
      
      // System permissions checker
      function getSystemPermissionGuidance() {
        const userAgent = navigator.userAgent;
        let os = 'Unknown';
        let guidance = '';
        
        if (userAgent.includes('Windows')) {
          os = 'Windows';
          guidance = `
**Windows System Settings:**
1. Press Windows + I to open Settings
2. Go to Privacy & Security > Microphone
3. Make sure "Microphone access" is turned ON
4. Make sure "Let apps access your microphone" is turned ON
5. Make sure "Let desktop apps access your microphone" is turned ON
6. Restart your browser after making changes

**Windows 10 Alternative:**
1. Right-click the speaker icon in system tray
2. Select "Open Sound settings"
3. Go to "Microphone" section
4. Test your microphone and adjust levels
          `;
        } else if (userAgent.includes('Mac')) {
          os = 'macOS';
          guidance = `
**macOS System Settings:**
1. Open System Preferences (or System Settings on newer macOS)
2. Go to Security & Privacy > Privacy > Microphone
3. Make sure your browser (Chrome/Safari/Edge) is checked
4. If not listed, click the + button to add it
5. Restart your browser after making changes

**Alternative method:**
1. Go to Apple menu > System Preferences
2. Click Security & Privacy
3. Click the Privacy tab
4. Select Microphone from the list
5. Check the box next to your browser
          `;
        } else if (userAgent.includes('Linux')) {
          os = 'Linux';
          guidance = `
**Linux System Settings:**
1. Check if PulseAudio is running: pulseaudio --check
2. Test microphone: arecord -l (list devices)
3. Check permissions: groups $USER (should include audio)
4. Restart browser after system changes

**Ubuntu/GNOME:**
1. Open Settings > Privacy > Microphone
2. Make sure microphone access is enabled
3. Check Sound settings for input devices
          `;
        }
        
        return { os, guidance };
      }

      function showMicrophoneHelp() {
        const { os, guidance } = getSystemPermissionGuidance();
        
        const helpModal = document.createElement('div');
        helpModal.className = 'modal';
        helpModal.style.display = 'flex';
        helpModal.innerHTML = `
          <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <div class="modal-header">
              <h3>ðŸŽ¤ Microphone Setup Help</h3>
              <button class="close-btn mic-help-close">&times;</button>
            </div>
            <div class="modal-body">
              <div style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                <strong>ðŸš¨ System Permission Denied</strong><br>
                <small>Detected OS: ${os}</small><br><br>
                Your system or browser has blocked microphone access. This might be due to:
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>System privacy settings blocking microphone</li>
                  <li>Another application using the microphone</li>
                  <li>Browser security settings</li>
                  <li>Corporate/school network restrictions</li>
                </ul>
              </div>
              
              <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 13px; white-space: pre-line;">
                ${guidance}
              </div>
              
              <h4>ðŸ“‹ Browser Instructions:</h4>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Look for the ðŸ”’ or ðŸŽ¤ icon in your address bar</li>
                <li>Click it and select "Always allow microphone"</li>
                <li>Refresh the page</li>
                <li>Try the microphone button again</li>
              </ol>
              
              <h4>ðŸ”§ Alternative Browser Method:</h4>
              <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Go to browser Settings</li>
                <li>Search for "microphone" or "site permissions"</li>
                <li>Find this website and allow microphone access</li>
                <li>Refresh the page</li>
              </ol>
              
              <h4>ðŸŒ Browser Support:</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>âœ… Chrome (recommended)</li>
                <li>âœ… Microsoft Edge</li>
                <li>âœ… Safari</li>
                <li>âŒ Firefox (limited support)</li>
              </ul>
              
              <div style="margin-top: 10px; padding: 10px; background: #f0f8ff; border-radius: 5px; font-size: 14px;">
                ðŸ’¡ <strong>Quick Checklist:</strong><br>
                â€¢ Close other apps using microphone (Zoom, Teams, Discord)<br>
                â€¢ Check if microphone is properly connected<br>
                â€¢ Try restarting your browser completely<br>
                â€¢ Test with a different browser if possible
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary mic-test-again">
                ðŸ§ª Test Microphone Again
              </button>
              <button class="btn btn-secondary mic-help-close-btn">
                Close
              </button>
            </div>
          </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Add event listeners for the modal buttons
        const closeButtons = helpModal.querySelectorAll('.mic-help-close, .mic-help-close-btn');
        closeButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            helpModal.remove();
          });
        });
        
        const testButton = helpModal.querySelector('.mic-test-again');
        testButton.addEventListener('click', () => {
          helpModal.remove();
          testMicrophone();
        });
      }
      
      async function testMicrophone() {
        const micStatus = document.getElementById('micStatus');
        
        try {
          addMessage('ðŸ§ª Testing microphone access...', 'bot');
          micStatus.style.display = 'block';
          micStatus.style.background = '#f59e0b'; // Orange for testing
          
          // First check if mediaDevices is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('MediaDevices API not supported in this browser');
          }
          
          // Check available audio input devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          
          if (audioInputs.length === 0) {
            throw new Error('No microphone devices found');
          }
          
          addMessage(`ðŸŽ¤ Found ${audioInputs.length} microphone device(s)`, 'bot');
          
          // Test microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          
          // Test if we can actually get audio data
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          source.connect(analyser);
          
          // Clean up
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          
          micStatus.style.background = '#10b981'; // Green for success
          addMessage('âœ… Microphone test successful! Audio system is working properly.', 'bot');
          addMessage('ðŸŽ¤ You can now use voice input by clicking the microphone button.', 'bot');
          
          setTimeout(() => {
            micStatus.style.display = 'none';
          }, 3000);
          
        } catch (error) {
          micStatus.style.background = '#ef4444'; // Red for error
          console.error('Microphone test error:', error);
          
          let errorMessage = 'âŒ Microphone test failed: ';
          let helpNeeded = false;
          
          switch (error.name) {
            case 'NotAllowedError':
              errorMessage += 'Permission denied by system or browser.';
              helpNeeded = true;
              break;
            case 'NotFoundError':
              errorMessage += 'No microphone device found.';
              break;
            case 'NotReadableError':
              errorMessage += 'Microphone is being used by another application.';
              break;
            case 'OverconstrainedError':
              errorMessage += 'Microphone constraints cannot be satisfied.';
              break;
            case 'SecurityError':
              errorMessage += 'Security error - HTTPS may be required.';
              break;
            default:
              errorMessage += error.message || 'Unknown error occurred.';
              helpNeeded = true;
          }
          
          addMessage(errorMessage, 'bot');
          
          // Provide specific troubleshooting steps
          if (error.name === 'NotAllowedError') {
            addMessage('ðŸ”§ **Troubleshooting Steps:**\n1. Check system microphone permissions\n2. Close other apps using microphone (Zoom, Teams, etc.)\n3. Restart browser completely\n4. Check browser site permissions', 'bot');
          }
          
          setTimeout(() => {
            micStatus.style.display = 'none';
          }, 5000);
          
          // Show help modal for permission errors
          if (helpNeeded) {
            setTimeout(() => {
              showMicrophoneHelp();
            }, 2000);
          }
        }
      }

      // Photo upload function
      function uploadPhoto() {
        document.getElementById('photoInput').click();
      }

      // Test server connection
      async function testServerConnection() {
        try {
          const response = await fetch('/api/health');
          const data = await response.json();
          
          if (response.ok && data.status === 'OK') {
            addMessage('âœ… Server connection test successful!', 'bot');
            console.log('Server health:', data);
          } else {
            addMessage('âš ï¸ Server connection test failed. Status: ' + response.status, 'bot');
          }
        } catch (error) {
          addMessage('âŒ Cannot connect to server: ' + error.message, 'bot');
          console.error('Connection test failed:', error);
        }
      }

      // Test storage functionality
      function testStorage() {
        const storageInfo = storage.getStorageInfo();
        const message = `
ðŸ—„ï¸ **Storage Status:**
- Type: ${storageInfo.type}
- Available: ${storageInfo.available ? 'Yes' : 'No'}
- Fallback items: ${storageInfo.fallbackSize}

${storageInfo.available ? 
  'âœ… Full storage functionality available' : 
  'âš ï¸ Limited storage - data will be lost on page refresh'
}
        `;
        addMessage(message, 'bot');
      }

      // Provider loading
      async function loadProviders() {
        try {
          const response = await fetch('/api/providers');
          const data = await response.json();
          availableProviders = data.providers;
          updateModelOptions();
        } catch (error) {
          console.error('Failed to load providers:', error);
        }
      }

      function updateModelOptions() {
        const selectedProvider = document.getElementById('aiProvider').value;
        const provider = availableProviders[selectedProvider];
        
        const modelSelect = document.getElementById('aiModel');
        modelSelect.innerHTML = '<option value="">Default</option>';
        
        if (provider && provider.models) {
          provider.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
          });
        }
      }

      // Event listeners
      document.getElementById('aiProvider').addEventListener('change', updateModelOptions);

      // Template functions
      function openTemplateModal() {
        // Simple template modal for now
        const template = prompt('Enter template type (blog, social, image, resume, code, business, email, creative):');
        if (template) {
          useQuickAction(template);
        }
      }

      function closeTemplateModal() {
        // Template modal functionality
      }

      // Provider loading
      async function loadProviders() {
        try {
          const response = await fetch('/api/providers');
          const data = await response.json();
          availableProviders = data.providers;
          updateModelOptions();
        } catch (error) {
          console.error('Failed to load providers:', error);
        }
      }

      function updateModelOptions() {
        const selectedProvider = document.getElementById('aiProvider').value;
        const provider = availableProviders[selectedProvider];
        
        const modelSelect = document.getElementById('aiModel');
        modelSelect.innerHTML = '<option value="">Default</option>';
        
        if (provider && provider.models) {
          provider.models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
          });
        }
      }

      // Event listeners
      document.getElementById('aiProvider').addEventListener('change', updateModelOptions);

      // Settings modal (placeholder)
      function openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        loadSettings();
        modal.style.display = 'flex';
      }

      function closeSettingsModal() {
        document.getElementById('settingsModal').style.display = 'none';
      }

      function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        document.getElementById('themeSelect').value = settings.theme || 'light';
        document.getElementById('languageSelect').value = settings.language || 'en';
        document.getElementById('autoSave').checked = settings.autoSave !== false;
        document.getElementById('notifications').checked = settings.notifications || false;
        document.getElementById('maxFileSize').value = settings.maxFileSize || '5';
        document.getElementById('defaultProvider').value = settings.defaultProvider || 'openai';
      }

      function saveSettings() {
        const settings = {
          theme: document.getElementById('themeSelect').value,
          language: document.getElementById('languageSelect').value,
          autoSave: document.getElementById('autoSave').checked,
          notifications: document.getElementById('notifications').checked,
          maxFileSize: document.getElementById('maxFileSize').value,
          defaultProvider: document.getElementById('defaultProvider').value
        };
        
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        // Apply theme immediately
        applyTheme(settings.theme);
        
        // Set default provider
        document.getElementById('aiProvider').value = settings.defaultProvider;
        updateModelOptions();
        
        closeSettingsModal();
        addMessage('âœ… Settings saved successfully!', 'bot');
      }

      function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
          localStorage.removeItem('appSettings');
          loadSettings();
          addMessage('ðŸ”„ Settings reset to default values.', 'bot');
        }
      }

      function applyTheme(theme) {
        // Basic theme implementation
        if (theme === 'dark') {
          document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        } else {
          document.body.style.filter = 'none';
        }
      }

      // Three dot modal functions
      function openThreeDotModal() {
        document.getElementById('threeDotModal').style.display = 'flex';
      }

      function closeThreeDotModal() {
        document.getElementById('threeDotModal').style.display = 'none';
      }

      function exportChat() {
        if (currentChat.length === 0) {
          // If no current chat, export all history
          exportAllChatHistory();
          closeThreeDotModal();
          return;
        }

        // Export current chat as readable text
        const firstUserMessage = currentChat.find(msg => msg.sender === 'user');
        const chatTitle = firstUserMessage ? 
          (firstUserMessage.text.length > 40 ? 
            firstUserMessage.text.substring(0, 40) + '...' : 
            firstUserMessage.text) : 
          'Chat Export';

        let exportText = `AI ChatBot - ${chatTitle}\n`;
        exportText += `Exported: ${new Date().toLocaleString()}\n`;
        exportText += `Messages: ${currentChat.length}\n\n`;
        exportText += '='.repeat(50) + '\n\n';

        currentChat.forEach(msg => {
          const sender = msg.sender === 'user' ? 'You' : 'AI';
          const timestamp = new Date(msg.timestamp || Date.now()).toLocaleTimeString();
          exportText += `[${timestamp}] ${sender}: ${msg.text}\n\n`;
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chatTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeThreeDotModal();
        addMessage('ðŸ“¥ Chat exported as readable text!', 'bot');
      }

      function clearAllData() {
        if (confirm('Are you sure you want to clear ALL data? This will remove:\n- Chat history\n- API keys\n- Settings\n- Projects\n\nThis action cannot be undone.')) {
          localStorage.clear();
          currentChat = [];
          document.getElementById('chatMessages').innerHTML = '';
          document.getElementById('chatMessages').style.display = 'none';
          document.getElementById('welcomeScreen').style.display = 'flex';
          updateChatHistoryUI();
          closeThreeDotModal();
          addMessage('ðŸ—‘ï¸ All data cleared successfully!', 'bot');
        }
      }

      // Enhanced file upload with better error handling
      document.getElementById('fileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const maxSize = (settings.maxFileSize || 5) * 1024 * 1024;
        
        if (file.size > maxSize) {
          alert(`File too large. Maximum size is ${settings.maxFileSize || 5}MB.`);
          return;
        }
        
        const allowedTypes = ['.txt', '.docx', '.xlsx', '.pptx', '.pdf', '.csv'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
          alert('Unsupported file type. Allowed: ' + allowedTypes.join(', '));
          return;
        }
        
        attachedFile = file;
        addMessage(`ðŸ“Ž File attached: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'user');
      };

      // Initialize settings on load
      document.addEventListener('DOMContentLoaded', function() {
        initializePersonalization();
        initializeProjectManager();
        loadProviders();
        loadChatHistory();
        updateChatHistoryUI();
        
        // Load and apply settings
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        if (settings.theme) {
          applyTheme(settings.theme);
        }
        if (settings.defaultProvider) {
          document.getElementById('aiProvider').value = settings.defaultProvider;
          updateModelOptions();
        }
      });

      console.log('ðŸš€ AI ChatBot loaded successfully!');

      // Event Listeners - Replace all inline onclick handlers
      document.addEventListener('DOMContentLoaded', function() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const sidebar = document.getElementById('sidebar');
        
        function toggleMobileMenu() {
          sidebar.classList.toggle('active');
          mobileOverlay.classList.toggle('active');
          mobileMenuToggle.classList.toggle('active');
          
          // Change icon
          const icon = mobileMenuToggle.querySelector('i');
          if (sidebar.classList.contains('active')) {
            icon.className = 'fas fa-times';
          } else {
            icon.className = 'fas fa-bars';
          }
        }
        
        function closeMobileMenu() {
          sidebar.classList.remove('active');
          mobileOverlay.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
          const icon = mobileMenuToggle.querySelector('i');
          icon.className = 'fas fa-bars';
        }
        
        mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
        mobileOverlay?.addEventListener('click', closeMobileMenu);
        
        // Close mobile menu when clicking on sidebar links
        sidebar?.addEventListener('click', function(e) {
          if (e.target.closest('.history-item') || 
              e.target.closest('.new-chat-btn') ||
              e.target.closest('.sidebar-btn')) {
            // Small delay to allow the action to complete
            setTimeout(closeMobileMenu, 300);
          }
        });
        
        // Sidebar buttons
        document.getElementById('newChatBtn')?.addEventListener('click', startNewChat);
        document.getElementById('searchChatsBtn')?.addEventListener('click', openChatSearchModal);
        document.getElementById('toggleFiltersBtn')?.addEventListener('click', toggleChatFilters);
        document.getElementById('toggleTimelineBtn')?.addEventListener('click', toggleTimelineView);
        document.getElementById('exportPDFBtn')?.addEventListener('click', exportAllChatsAsPDF);
        document.getElementById('showStarredBtn')?.addEventListener('click', showStarredChats);
        document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
        document.getElementById('settingsBtn')?.addEventListener('click', openSettingsModal);
        document.getElementById('apiKeysBtn')?.addEventListener('click', openApiKeysModal);
        document.getElementById('profileBtn')?.addEventListener('click', openProfileModal);
        
        // Header buttons
        document.getElementById('projectsBtn')?.addEventListener('click', openProjectsModal);
        document.getElementById('threeDotBtn')?.addEventListener('click', openThreeDotModal);
        
        // Input area buttons - Add touch events for mobile
        document.getElementById('uploadFileBtn')?.addEventListener('click', uploadFile);
        document.getElementById('uploadFileBtn')?.addEventListener('touchend', (e) => {
          e.preventDefault();
          uploadFile();
        });
        
        document.getElementById('uploadPhotoBtn')?.addEventListener('click', uploadPhoto);
        document.getElementById('uploadPhotoBtn')?.addEventListener('touchend', (e) => {
          e.preventDefault();
          uploadPhoto();
        });
        
        document.getElementById('micBtn')?.addEventListener('click', toggleVoice);
        document.getElementById('micBtn')?.addEventListener('touchend', (e) => {
          e.preventDefault();
          toggleVoice();
        });
        
        document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
        document.getElementById('sendBtn')?.addEventListener('touchend', (e) => {
          e.preventDefault();
          sendMessage();
        });
        
        // Input field
        document.getElementById('userInput')?.addEventListener('keypress', handleKeyPress);
        
        // Quick action cards - Add both click and touch events for mobile
        document.querySelectorAll('.action-card').forEach(card => {
          // Click event for desktop
          card.addEventListener('click', (e) => {
            e.preventDefault();
            const action = card.dataset.action;
            if (action) useQuickAction(action);
          });
          
          // Touch event for mobile
          card.addEventListener('touchend', (e) => {
            e.preventDefault();
            const action = card.dataset.action;
            if (action) useQuickAction(action);
          });
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const modalId = this.dataset.modal;
            if (modalId) {
              document.getElementById(modalId).style.display = 'none';
            } else {
              // Fallback: close the closest modal
              this.closest('.modal').style.display = 'none';
            }
          });
        });
        
        // Modal action buttons
        document.getElementById('saveApiKeysBtn')?.addEventListener('click', saveApiKeys);
        document.getElementById('clearAllKeysBtn')?.addEventListener('click', clearAllKeys);
        document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
        document.getElementById('closeProfileBtn')?.addEventListener('click', closeProfileModal);
        document.getElementById('exportAllProjectsBtn')?.addEventListener('click', exportAllProjects);
        document.getElementById('closeProjectsBtn')?.addEventListener('click', closeProjectsModal);
        document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
        document.getElementById('resetSettingsBtn')?.addEventListener('click', resetSettings);
        document.getElementById('saveChatEditBtn')?.addEventListener('click', saveChatEdit);
        document.getElementById('deleteChatBtn')?.addEventListener('click', deleteChatFromEdit);
        
        // Mobile AI selector
        document.getElementById('mobileAiSelector')?.addEventListener('click', openMobileAiModal);
        document.getElementById('mobileAiSelector')?.addEventListener('touchend', (e) => {
          e.preventDefault();
          openMobileAiModal();
        });
        document.getElementById('saveMobileAiBtn')?.addEventListener('click', saveMobileAiSelection);
        
        // Three dot menu buttons
        document.getElementById('exportChatBtn')?.addEventListener('click', exportChat);
        document.getElementById('importChatBtn')?.addEventListener('click', importChat);
        document.getElementById('clearAllDataBtn')?.addEventListener('click', clearAllData);
        document.getElementById('showShortcutsBtn')?.addEventListener('click', showKeyboardShortcuts);
        document.getElementById('testMicrophoneBtn')?.addEventListener('click', () => {
          closeThreeDotModal();
          testMicrophone();
        });
        document.getElementById('testStorageBtn')?.addEventListener('click', () => {
          closeThreeDotModal();
          testStorage();
        });
        document.getElementById('showAboutBtn')?.addEventListener('click', showAboutModal);
        
        // AI provider change
        document.getElementById('aiProvider')?.addEventListener('change', updateModelOptions);
        
        // Filter changes
        document.getElementById('aiProviderFilter')?.addEventListener('change', updateChatHistory);
        document.getElementById('dateFilter')?.addEventListener('change', updateChatHistory);
        
        // Search input
        document.getElementById('chatSearchInput')?.addEventListener('input', performChatSearch);
        
        // Event delegation for dynamically generated elements
        document.addEventListener('click', function(e) {
          // Chat history item clicks
          if (e.target.closest('.chat-item-content')) {
            const chatId = e.target.closest('.chat-item-content').dataset.chatId;
            loadHistoryChat(chatId);
          }
          
          // Chat edit button clicks
          if (e.target.closest('.chat-edit-btn')) {
            e.stopPropagation();
            const chatId = e.target.closest('.chat-edit-btn').dataset.chatId;
            openChatEditModal(chatId);
          }
          
          // Project download button clicks
          if (e.target.closest('.project-download-btn')) {
            const projectId = e.target.closest('.project-download-btn').dataset.projectId;
            downloadProject(projectId);
          }
          
          // Search result clicks
          if (e.target.closest('.search-result-item')) {
            const chatId = e.target.closest('.search-result-item').dataset.chatId;
            loadHistoryChat(chatId);
            closeChatSearchModal();
          }
        });
      });

      // Handle key press function
      function handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          sendMessage();
        }
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Alt + N: New chat (changed from Ctrl+N to avoid browser conflict)
        if (e.altKey && e.key === 'n') {
          e.preventDefault();
          startNewChat();
        }
        
        // Alt + S: Save chat (changed from Ctrl+S to avoid browser conflict)
        if (e.altKey && e.key === 's') {
          e.preventDefault();
          exportChat();
        }
        
        // Alt + O: Open settings (changed from Ctrl+O to avoid browser conflict)
        if (e.altKey && e.key === 'o') {
          e.preventDefault();
          openSettingsModal();
        }
        
        // Alt + U: Upload file (changed from Ctrl+U to avoid browser conflict)
        if (e.altKey && e.key === 'u') {
          e.preventDefault();
          uploadFile();
        }
        
        // Alt + /: Show shortcuts (changed from Ctrl+/ to avoid browser conflict)
        if (e.altKey && e.key === '/') {
          e.preventDefault();
          showShortcuts();
        }
        
        // Alt + T: Test server connection
        if (e.altKey && e.key === 't') {
          e.preventDefault();
          testServerConnection();
        }
        
        // Alt + M: Test microphone
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          testMicrophone();
        }
        
        // Escape: Close any open modal
        if (e.key === 'Escape') {
          closeAllModals();
        }
      });

      function closeAllModals() {
        document.getElementById('apiKeysModal').style.display = 'none';
        document.getElementById('profileModal').style.display = 'none';
        document.getElementById('projectsModal').style.display = 'none';
        document.getElementById('settingsModal').style.display = 'none';
        document.getElementById('threeDotModal').style.display = 'none';
        document.getElementById('chatSearchModal').style.display = 'none';
        document.getElementById('chatEditModal').style.display = 'none';
        document.getElementById('mobileAiModal').style.display = 'none';
      }
      
      // Mobile AI Selector Functions
      function openMobileAiModal() {
        const modal = document.getElementById('mobileAiModal');
        const currentProvider = document.getElementById('aiProvider').value;
        document.getElementById('mobileAiProvider').value = currentProvider;
        modal.style.display = 'flex';
      }
      
      function saveMobileAiSelection() {
        const selectedProvider = document.getElementById('mobileAiProvider').value;
        document.getElementById('aiProvider').value = selectedProvider;
        updateModelOptions();
        document.getElementById('mobileAiModal').style.display = 'none';
        
        // Show confirmation
        const providerName = getProviderName(selectedProvider);
        addMessage(`âœ… AI Provider changed to ${providerName}`, 'bot');
      }
      
      // Show/hide mobile AI selector based on screen size
      function updateMobileAiSelector() {
        const mobileSelector = document.getElementById('mobileAiSelector');
        if (window.innerWidth <= 768) {
          mobileSelector.style.display = 'flex';
        } else {
          mobileSelector.style.display = 'none';
        }
      }
      
      // Call on load and resize
      window.addEventListener('load', updateMobileAiSelector);
      window.addEventListener('resize', updateMobileAiSelector);

