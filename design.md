# Art Nouveau Tarot Website Design

## Design Philosophy

### Color Palette
**Primary Colors:**
- Deep Mystic Purple (#2D1B45) - Primary background, mystical depth
- Antique Gold (#B8860B) - Accent color for borders and highlights
- Soft Cream (#F5F5DC) - Text and card backgrounds
- Rich Burgundy (#800020) - Secondary accent for interactive elements

**Supporting Colors:**
- Muted Teal (#4A6741) - For secondary elements
- Warm Amber (#FFBF00) - For glowing effects and highlights
- Charcoal Gray (#36454F) - For subtle text and shadows

### Typography
**Display Font:** "Cinzel" - Elegant serif for headings, evokes classical inscriptions
**Body Font:** "Quattrocento Sans" - Clean, readable sans-serif for content
**Accent Font:** "MedievalSharp" - For card names and mystical elements

### Visual Language
**Art Nouveau Elements:**
- Flowing organic lines and curves
- Nature-inspired motifs (vines, flowers, leaves)
- Ornate decorative borders
- Stylized human figures with elegant proportions
- Rich, saturated colors with metallic accents

**Mystical Elements:**
- Celestial symbols (moon, stars, sun)
- Sacred geometry patterns
- Ethereal glows and auras
- Floating particles and light effects
- Mystical creatures and symbols

## Visual Effects

### Used Libraries
- **Anime.js**: Card animations, shuffling effects, smooth transitions
- **Canvas 2D**: Particle systems and mystical atmosphere
- **Pixi.js**: Advanced visual effects, glowing auras, light rays
- **Splitting.js**: Text reveal animations for card interpretations
- **Web Speech / Edge TTS**: Voice fallback and server-side neural speech

### Effect Implementation

#### Background Effects
- **Aurora Gradient Flow**: Subtle, slow-moving gradient background using CSS and Canvas 2D
- **Floating Particles**: Gentle particle system creating ethereal atmosphere
- **Sacred Geometry**: Subtle geometric patterns overlay

#### Card Effects
- **Flip Animation**: 3D card flip using Anime.js when cards are drawn
- **Glow Effects**: Soft glowing borders around selected cards using Pixi.js
- **Hover Transformations**: Cards lift and tilt on hover with shadow effects
- **Shuffle Animation**: Realistic card shuffling sequence

#### Text Effects
- **Typewriter Revelation**: Card meanings appear with typewriter effect
- **Color Cycling**: Mystical text with subtle color transitions
- **Split Letter Animation**: Individual letter animations for dramatic reveals

#### Interactive Elements
- **Mystical Button Glow**: Buttons pulse with soft golden light
- **Ripple Effects**: Click interactions create ripple animations
- **Smooth Transitions**: All state changes use fluid animations

### Styling Approach

#### Layout
- **Grid System**: CSS Grid for responsive card layouts
- **Asymmetric Balance**: Art Nouveau-inspired asymmetrical compositions
- **Flowing Sections**: Organic, non-rectangular section divisions

#### Card Design
- **Ornate Borders**: Decorative Art Nouveau frame elements
- **Vintage Texture**: Subtle paper texture overlay
- **Metallic Accents**: Gold foil effects on card edges and details
- **Elegant Proportions**: Cards follow golden ratio dimensions

#### Interactive States
- **Hover States**: Gentle lift with shadow expansion
- **Active States**: Soft glow and scale increase
- **Loading States**: Mystical spinner with particle effects
- **Success States**: Golden particle burst animations

### Header Effect
- **Mystical Title Animation**: Main title appears with glowing letters
- **Floating Navigation**: Navigation bar with subtle floating animation
- **Aurora Background**: Dynamic gradient background with color shifts

### Responsive Design
- **Mobile-First**: Optimized for touch interactions
- **Flexible Grid**: Cards adapt to different screen sizes
- **Touch-Friendly**: Large touch targets for mobile users
- **Performance**: Optimized animations for mobile devices

### Accessibility
- **High Contrast**: 4.5:1 minimum contrast ratio for all text
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Screen Reader**: Proper ARIA labels for interactive elements
- **Reduced Motion**: Respects user's motion preferences
