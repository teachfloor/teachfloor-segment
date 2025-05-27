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
  const [userIdSource, setUserIdSource] = useState(null)

  /**
   * Memoize userContext to avoid unnecessary rerender
   */
  const userData = useMemo(() => ({ ...userContext }), [userContext.id])

  /**
   * Memoize userId
   */
  const userId = useMemo(() => {
    if (enableTracking && userData && userIdSource) {
      switch (userIdSource) {
        case 'identity_provider':
          if (userData?.identity_provider?.user_id) {
            return userData.identity_provider.user_id
          } else {
            console.error('Identity Source not found')
            return null
          }

        case 'teachfloor':
        default:
          return userData.id
      }
    }

    return null
  }, [enableTracking, userData, userIdSource])

  /**
   * Retrieve Segment write key, user id source and load Segment Analytics
   */
  useEffect(() => {
    Promise.all([
      retrieve('write_key'),
      retrieve('user_id_source')
    ]).then(([writeKey, userIdSource]) => {
      if (writeKey) {

        /**
         * Enable tracking events on segment analytics
         */
        setEnableTracking(true)

        /**
         * Set the user id source
         */
        setUserIdSource(userIdSource)

        /**
         * Load segment analytics
         */
        load(writeKey)

        initialize()
      }
    })
  }, [])

  /**
   * Identify user
   * Trigger identify whenever the userId changes
   */
  useEffect(() => {
    if (enableTracking && userId) {
      identify(userId, {
        name: userData.full_name,
        email: userData.email,
      })
    }
  }, [userId])

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
