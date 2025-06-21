---
layout: ../../layouts/Work.astro
title: Voice Expense Tracker
description:
published: 12/28/2025
year: 2025
logo: /images/apl.png
type: sideproject
status: building
---

## Problem
Tracking expenses across multiple banks is hard, I don't want to type in everything and don't want other people to know my banking information. 

Requirements: 
- Web-based
- Voice activated 
- Shows tables, charts if wanted 
- Tracks types of expenses, amount, and time. Types of expenses: 
    - Utilities 
    - Groceries 
    - Dining Out
    - Housing 
    - Health Care
    - Transportation 
    - Personal Upkeep  
    - Entertainment 

How to use: Just say "expense stuff $some amount". The regex will parse anything before the "$" as the expense type and the latter the amount. 

## Proposed Solution
Tech: React. 
- ✅ Use [Web Speech API (built-in)](https://www.google.com/intl/en/chrome/demos/speech.html). [Browers that support this](https://www.npmjs.com/package/react-speech-recognition#supported-browsers). Default language: english - US. 
- ✅ Parse the text using regex.
- ✅ Accept, Edit, Delete options.
- 🚧 Update table. (localStorage)
- Option to export csv. 
- Have expense charts. 

<div class="overflow-hidden my-8">
  <video class="w-full" autoplay loop muted playsinline poster="/images/placeholder-rover-25.jpg">
    <source src="/video/voice-expense-tracker-mvp.mp4" type="video/mp4" />
  </video>
</div>

## Reflections
This was a fun, simple build that solves a real-life problem I have with normal expense tracking. 

I learned:
1. Polyfill: Code to replace other code if default isn't available. This is for speech recognition plugin with your browser doesn't support the api. 
2. Regex is so fun! I haven't touched regex in years but it's so clean and useful. 

Edge Cases: 
1. Categories can be more than 1 word. 
2. Speech Recognition might return "dollars" instead of the character "$". 
3. Speech Recognition might not pick up the "dollars". 

## Future Directions and Expansions

### 1. Connecting to Google Sheets 

### 2. Add your own category and columns 

I thought about using AI agents and/or MCP server connecting to an LMM (probably Gemini because I don't want to waste money on OpenAI right now). 

##