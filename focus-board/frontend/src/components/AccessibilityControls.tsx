import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityControls: React.FC = () => {
  const { highContrast, fontScale, toggleHighContrast, increaseFont, decreaseFont, resetFont } = useAccessibility();

  return (
    <section aria-label="Accessibility Controls" style={{ display: 'grid', gap: '1rem', maxWidth: 480, margin: '1rem auto' }}>
      <div role="group" aria-label="Contrast">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={highContrast} onChange={toggleHighContrast} aria-checked={highContrast} />
          Enable high-contrast mode
        </label>
      </div>

      <div role="group" aria-label="Font Size" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={decreaseFont} aria-label="Decrease font size">A-</button>
        <div aria-live="polite" aria-atomic="true">Font scale: {fontScale.toFixed(2)}x</div>
        <button onClick={increaseFont} aria-label="Increase font size">A+</button>
        <button onClick={resetFont} aria-label="Reset font size">Reset</button>
      </div>
    </section>
  );
};

export default AccessibilityControls;
