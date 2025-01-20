import React, { useMemo, useEffect, useState } from 'react'
import {
  ExtensionViewLoader,
  useExtensionContext,
  initialize,
  retrieve,
  subscribeToEvent,
} from '@teachfloor/extension-kit'

import manifest from '../../teachfloor-app.json'
import { load, identify, page, track } from '../analytics'

const App = () => {
  const { userContext, environment } = useExtensionContext()
  const [enableTracking, setEnableTracking] = useState(false)

  /**
   * Memoize userContext to avoid unnecessary rerender
   */
  const userData = useMemo(() => ({ ...userContext }), [userContext.id])

  /**
   * Retrieve Segment write key and load Segment Analytics
   */
  useEffect(() => {
    retrieve('write_key').then((writeKey) => {
      if (writeKey) {

        /**
         * Enable tracking events on segment analytics
         */
        setEnableTracking(true)

        /**
         * Load segment analytics
         */
        load(writeKey)

        /**
         *
         */
        identify(userContext.id, {
          name: userContext.full_name,
          email: userContext.email,
        })

        initialize()
      }
    })
  }, [])

  /**
   * Identify user
   */
  useEffect(() => {
    if (enableTracking && userData.id) {
      identify(userData.id, {
        name: userData.full_name,
        email: userData.email,
      })
    }
  }, [userData.id])

  /**
   * Track page
   */
  useEffect(() => {
    if (enableTracking && environment.path) {
      page({
        title: environment.viewport,
        path: environment.path,
        url: `${document.referrer.replace(/\/$/, '') }${environment.path}`,
      })
    }
  }, [environment])

  /**
   * Track user events
   */
  useEffect(() => {
    if (enableTracking) {
      subscribeToEvent('auth.user.event', (event, objectContext) => {
        const eventData = {
          ...event,
          context: {
            ...(objectContext || {})
          }
        }

        delete eventData.event
        delete eventData.timestamp

        track(event.event, eventData)
      })
    }
  }, [enableTracking])

  return (
    <ExtensionViewLoader
      manifest={manifest}
      componentResolver={(componentName) => import(`./${componentName}`)}
    />
  )
}

export default App
