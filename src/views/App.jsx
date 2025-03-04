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
         * Load segment analytics
         */
        load(writeKey)

        /**
         * Determine the user id to use based on the user_id_source setting
         */
        let userId = userContext.id
        switch (userIdSource) {
          case 'identity_provider':
            if (userContext?.identity_provider?.user_id) {
              userId = userContext.identity_provider.user_id
            } else {
              console.error('Identity Source not found, reverting back to Teachfloor User ID')
            }
            break

          case 'teachfloor':
          default:
            userId = userContext.id
            break
        }

        /**
         *
         */
        identify(userId, {
          name: userContext.full_name,
          email: userContext.email,
          identity_provider: userContext.identity_provider,
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
