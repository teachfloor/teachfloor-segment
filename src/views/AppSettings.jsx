import React, { useEffect, useState } from 'react'
import {
  SettingsView,
  SimpleGrid,
  TextInput,
  Select,
  retrieve,
  store,
} from '@teachfloor/extension-kit'

const AppSettings = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [status, setStatus] = useState('')
  const [writeKey, setWriteKey] = useState('')
  const [userIdSource, setUserIdSource] = useState('')

  /**
   * Load initial settings values and initialize
   */
  useEffect(() => {
    Promise.all([
      retrieve('write_key'),
      retrieve('user_id_source')
    ]).then(([writeKeyValue, userIdSourceValue]) => {
      setWriteKey(writeKeyValue)
      setUserIdSource(userIdSourceValue)

      setIsInitialized(true)
    })
  }, [])

  /**
   * Handle save settings
   */
  const saveSettings = async () => {
    setStatus('Saving...')

    try {
      await Promise.all([
        store('write_key', writeKey),
        store('user_id_source', userIdSource),
      ])

      setStatus('Saved successfully')
    } catch (error) {
      setStatus('Error saving settings')
    } finally {
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <SettingsView onSave={saveSettings} statusMessage={status}>
      <SimpleGrid>
        <TextInput
          label="Write Key"
          description="The Write Key can be found in the Javascript source page under Settings > API Key."
          onChange={(e) => setWriteKey(e.currentTarget.value)}
          value={writeKey || ''}
          disabled={!isInitialized}
        />
        <Select
          label="Identity Source"
          description="Choose which user ID should be sent in the Segment identify event."
          onChange={setUserIdSource}
          value={userIdSource || ''}
          data={[
            {
              label: 'Teachfloor User ID',
              value: 'teachfloor'
            },
            {
              label: 'Identity Provider User ID',
              value: 'identity_provider'
            }
          ]}
          disabled={!isInitialized}
        />
      </SimpleGrid>
    </SettingsView>
  )
}

export default AppSettings