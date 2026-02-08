# Mobile Functionality Test Checklist

## ✅ Pre-Deployment Checklist

### 1. Desktop Testing (Laptop View)
- [ ] Open http://localhost:3000 in desktop browser
- [ ] Verify sidebar is visible
- [ ] Verify AI provider selector is visible in input area
- [ ] Verify all action cards work
- [ ] Verify send button works
- [ ] Verify chat functionality works

### 2. Mobile Simulation Testing (Chrome DevTools)
- [ ] Open Chrome DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select mobile device (iPhone 12 Pro, Pixel 5, etc.)

#### Welcome Screen
- [ ] Verify header shows "AI ChatBot" title
- [ ] Verify welcome message bubble is visible
- [ ] Verify 2-column grid of action cards
- [ ] Verify action cards are properly sized and spaced

#### Action Cards
- [ ] Tap "Blog Post Writer" - should fill input with prompt
- [ ] Tap "Social Media Captions" - should fill input with prompt
- [ ] Tap "AI Image Generator" - should fill input with prompt
- [ ] Tap "Resume Builder" - should fill input with prompt
- [ ] Tap "Code Generator" - should fill input with prompt
- [ ] Tap "Business Plan" - should fill input with prompt
- [ ] Tap "Email Writer" - should fill input with prompt
- [ ] Tap "Creative Writing" - should fill input with prompt
- [ ] Verify visual feedback (card scales down on tap)
- [ ] Verify chat interface appears after tapping

#### Input Area
- [ ] Verify input area is fixed at bottom
- [ ] Verify input field is accessible
- [ ] Type a message in input field
- [ ] Tap send button - should send message
- [ ] Verify visual feedback (button scales on tap)
- [ ] Verify send button is disabled while processing

#### Mobile AI Selector
- [ ] Verify floating robot button appears at bottom-right
- [ ] Tap robot button - should open AI selector modal
- [ ] Select different AI provider
- [ ] Tap "Select" button
- [ ] Verify confirmation message appears
- [ ] Verify modal closes

#### Upload Buttons
- [ ] Tap paperclip icon (upload file)
- [ ] Tap image icon (upload photo)
- [ ] Tap microphone icon (voice input)
- [ ] Verify each button responds to tap

#### Mobile Menu
- [ ] Tap hamburger menu (top-left)
- [ ] Verify sidebar slides in from left
- [ ] Verify overlay appears
- [ ] Tap overlay - should close menu
- [ ] Tap menu item - should close menu after action

### 3. Actual Mobile Device Testing

#### iOS Testing (iPhone/iPad)
- [ ] Open https://gpt.divyeshrupala.in in Safari
- [ ] Test all action cards
- [ ] Test send button
- [ ] Test mobile AI selector
- [ ] Test upload buttons
- [ ] Test mobile menu
- [ ] Verify no double-tap zoom issues
- [ ] Verify no text selection on tap
- [ ] Verify smooth animations

#### Android Testing (Chrome/Firefox)
- [ ] Open https://gpt.divyeshrupala.in in Chrome
- [ ] Test all action cards
- [ ] Test send button
- [ ] Test mobile AI selector
- [ ] Test upload buttons
- [ ] Test mobile menu
- [ ] Verify no double-tap zoom issues
- [ ] Verify no text selection on tap
- [ ] Verify smooth animations

### 4. Orientation Testing
- [ ] Test in portrait mode
- [ ] Test in landscape mode
- [ ] Verify layout adapts correctly
- [ ] Verify all buttons remain accessible

### 5. Different Screen Sizes
- [ ] Test on small phone (320px width)
- [ ] Test on medium phone (375px width)
- [ ] Test on large phone (414px width)
- [ ] Test on tablet (768px width)

### 6. Edge Cases
- [ ] Rapid tapping on action cards
- [ ] Rapid tapping on send button
- [ ] Long press on buttons
- [ ] Swipe gestures
- [ ] Keyboard appearance/disappearance
- [ ] Switching between apps
- [ ] Low battery mode
- [ ] Slow network connection

## 🐛 Known Issues to Watch For

1. **Ghost Clicks**: If buttons trigger twice, check preventDefault() calls
2. **Zoom Issues**: If double-tap causes zoom, check touch-action CSS
3. **Text Selection**: If text gets selected on tap, check user-select CSS
4. **Keyboard Overlap**: If keyboard covers input, check viewport settings
5. **Scroll Issues**: If page scrolls unexpectedly, check overflow settings

## 📝 Bug Report Template

If you find issues, report them with:
- Device model and OS version
- Browser name and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/screen recording

## ✅ Deployment Approval

Once all tests pass:
- [ ] All desktop functionality works
- [ ] All mobile functionality works
- [ ] No console errors
- [ ] No visual glitches
- [ ] Performance is acceptable
- [ ] Ready for production deployment

---

**Tested by:** _________________
**Date:** _________________
**Status:** ⬜ Pass | ⬜ Fail | ⬜ Needs Review
