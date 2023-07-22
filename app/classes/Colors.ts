import GSAP from 'gsap'

// This is a OOP singleton -- look into this.
class Colors {
  change ({ backgroundColor, color }: {backgroundColor: gsap.TweenValue; color: gsap.TweenValue}) {
    GSAP.to(document.documentElement, {
      backgroundColor,
      color,
      duration: 1.5
    })
  }
}

export const ColorsManager = new Colors()
