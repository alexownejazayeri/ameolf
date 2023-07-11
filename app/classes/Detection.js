class Detection {
  isPhone () {
    if (!this.isMobileChecked) {
      this.isMobileChecked = true

      this.isMobileCheck = document.documentElement.classList.contains('phone')
    }

    return this.isMobileCheck
  }

  isTablet () {
    if (!this.isTabletChecked) {
      this.isTabletChecked = true

      this.isTabletCheck = document.documentElement.classList.contains('tablet')
    }

    return this.isTabletCheck
  }

  isDesktop () {
    if (!this.isDesktopChecked) {
      this.isDesktopChecked = true

      this.isDesktopCheck = document.documentElement.classList.contains('desktop')
    }

    return this.isDesktopCheck
  }
}

const DetectionManager = new Detection()

export default DetectionManager
