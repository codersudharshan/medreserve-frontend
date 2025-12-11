/**
 * Accessibility contrast checker for hero section
 * Warns in console if contrast ratio is below WCAG AA standard (4.5:1)
 */

/**
 * Calculate relative luminance of a color
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color as RGB array [r, g, b]
 * @param color2 - Second color as RGB array [r, g, b]
 */
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1)
  const lum2 = getLuminance(...color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check contrast ratio for hero title
 * Warns if contrast is below 4.5:1 (WCAG AA standard for large text)
 */
export function checkHeroContrast(): void {
  // Wait for DOM to be ready
  if (typeof window === 'undefined') return

  setTimeout(() => {
    const heroTitle = document.querySelector('.hero-card h1')
    if (!heroTitle) return

    const computedStyle = window.getComputedStyle(heroTitle)
    const textColor = computedStyle.color
    const bgColor = computedStyle.backgroundColor

    // Parse RGB values from computed styles
    const textMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)

    if (!textMatch || !bgMatch) {
      console.warn('Contrast check: Could not parse colors')
      return
    }

    const textRgb: [number, number, number] = [
      parseInt(textMatch[1]),
      parseInt(textMatch[2]),
      parseInt(textMatch[3]),
    ]
    const bgRgb: [number, number, number] = [
      parseInt(bgMatch[1]),
      parseInt(bgMatch[2]),
      parseInt(bgMatch[3]),
    ]

    const contrast = getContrastRatio(textRgb, bgRgb)

    if (contrast < 4.5) {
      console.warn(
        `⚠️ Accessibility Warning: Hero title contrast ratio is ${contrast.toFixed(2)}:1, which is below WCAG AA standard (4.5:1)`
      )
      console.warn('Text color:', textColor, 'Background:', bgColor)
    } else {
      console.log(`✓ Hero title contrast ratio: ${contrast.toFixed(2)}:1 (WCAG AA compliant)`)
    }
  }, 100)
}

