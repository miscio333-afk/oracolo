# Italian Tarot Website - Project Outline

## File Structure

```
/mnt/okcomputer/output/
├── index.html              # Main landing page with hero and card drawing
├── reading.html            # Detailed card reading interpretation page
├── library.html            # Complete tarot card library
├── main.js                 # Core JavaScript functionality
├── resources/              # Media and asset folder
│   ├── cards/              # Generated tarot card images
│   │   ├── major/          # Major Arcana cards (0-21)
│   │   └── minor/          # Minor Arcana cards (4 suits)
│   ├── backgrounds/        # Background images and textures
│   └── icons/              # UI icons and symbols
├── interaction.md          # Interaction design documentation
├── design.md              # Design style guide
├── tarot_italian_database.md # Complete card meanings in Italian
└── outline.md             # This project outline
```

## Page Organization

### index.html - Main Landing Page
**Purpose:** Welcome users and provide primary tarot reading interface
**Sections:**
1. **Hero Area**
   - Mystical Art Nouveau background with aurora effects
   - Animated title "I Tarocchi Italiani"
   - Subtitle with mystical typewriter effect
   - Call-to-action button "Inizia la Lettura"

2. **Reading Interface**
   - Card selection area with shuffled deck
   - Reading type selector (3-card spread, single card, etc.)
   - Interactive card drawing with flip animations
   - Real-time interpretation display

3. **Reading Types**
   - Three-card spread (Past, Present, Future)
   - Single card daily draw
   - Love/Relationship spread
   - Career/Work spread

4. **Mystical Features**
   - Floating particle system
   - Smooth card animations
   - Ethereal background effects

### reading.html - Detailed Interpretation Page
**Purpose:** Display comprehensive card readings with detailed interpretations
**Sections:**
1. **Reading Summary**
   - Selected cards with positions
   - Reading type and date
   - Overall theme interpretation

2. **Card Details**
   - Large card images with Art Nouveau styling
   - Position meanings (Past, Present, Future, etc.)
   - Detailed Italian interpretations
   - Keywords and themes

3. **Reading Analysis**
   - Combined card meanings
   - Advice and guidance
   - Reflection questions

4. **Actions**
   - Save reading to history
   - Share reading (anonymized)
   - Start new reading

### library.html - Complete Tarot Library
**Purpose:** Browse and explore all 78 tarot cards with meanings
**Sections:**
1. **Card Browser**
   - Grid layout of all cards
   - Filter by Major/Minor Arcana
   - Search functionality
   - Card categories (suits, elements)

2. **Card Details Modal**
   - Large card image
   - Italian name and meaning
   - Keywords and interpretations
   - Upright and reversed meanings

3. **Learning Section**
   - Tarot basics in Italian
   - Reading techniques
   - Card symbolism guide

## Interactive Components

### Card Drawing Interface
- **Deck Animation:** Realistic shuffling with Anime.js
- **Card Selection:** Hover effects and click interactions
- **Flip Animation:** 3D card reveal with mystical glow
- **Position Placement:** Cards appear in reading positions

### Reading Types
- **Three-Card Spread:** Past, Present, Future positions
- **Single Card Draw:** Quick daily guidance
- **Specialized Spreads:** Love, career, decision-making
- **Custom Questions:** User-input specific queries

### Visual Effects
- **Particle System:** Floating mystical particles with p5.js
- **Aurora Background:** Dynamic gradient flow
- **Text Animations:** Typewriter effects with Typed.js
- **Hover Interactions:** Card lift and glow effects

## Technical Implementation

### JavaScript Modules
- **CardDeck.js:** Deck management and shuffling logic
- **Reading.js:** Reading creation and interpretation
- **Animations.js:** Visual effects and transitions
- **Storage.js:** Local storage for saved readings
- **UI.js:** User interface interactions

### Data Structure
- **Card Database:** Complete 78-card tarot data
- **Reading History:** Saved user readings
- **User Preferences:** Settings and customization
- **Statistics:** Reading patterns and insights

### Libraries Integration
- **Anime.js:** Card animations and transitions
- **p5.js:** Particle effects and background
- **Pixi.js:** Advanced visual effects
- **Splitting.js:** Text reveal animations
- **Typed.js:** Typewriter effects
- **Splide:** Card carousels

## Content Requirements

### Generated Images
- **78 Tarot Cards:** All Major and Minor Arcana in Art Nouveau style
- **Background Textures:** Mystical and Art Nouveau patterns
- **UI Elements:** Buttons, borders, decorative elements

### Text Content
- **Card Interpretations:** Complete Italian meanings database
- **Reading Guides:** Instructions and explanations
- **Mystical Texts:** Poetic and atmospheric content

### Audio Elements
- **Ambient Sounds:** Mystical background music (optional)
- **Sound Effects:** Card flip sounds, magical effects

## User Experience Flow

### First Visit
1. Land on mystical hero page
2. Choose reading type
3. Draw cards with animations
4. View detailed interpretations
5. Option to save or share

### Return Visit
1. Quick access to new readings
2. View reading history
3. Explore card library
4. Learn tarot meanings

### Mobile Experience
- Touch-optimized card interactions
- Responsive design for all screen sizes
- Swipe gestures for card browsing
- Optimized performance for mobile devices