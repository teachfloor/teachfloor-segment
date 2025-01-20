const segmentLoaded = () => {
  if (!window.analytics) {
    throw new Error('Segment Analytics is not loaded')
  }
}

export const load = (writeKey = '') => {
  segmentLoaded()
  window.analytics.load(writeKey)
}

export const identify = (userId, properties = {}) => {
  segmentLoaded()
  window.analytics.identify(userId, properties)
}

export const page = (...args) => {
  segmentLoaded()
  window.analytics.page(...args)
}

export const track = (name, properties = {}) => {
  segmentLoaded()
  window.analytics.track(name, properties)
}
