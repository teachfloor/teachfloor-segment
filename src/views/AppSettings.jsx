import React, { useEffect, useState } from 'react'
import {
  SettingsView,
  SimpleGrid,
  TextInput,
  retrieve,
  store,
} from '@teachfloor/extension-kit'

const AppSettings = () => {
  const [status, setStatus] = useState('')
  const [writeKey, setWriteKey] = useState('')

  useEffect(() => {
    retrieve('write_key').then((value) => setWriteKey(value))
  }, [])

  const saveSettings = async () => {
    setStatus('Saving...')

    store('write_key', writeKey)
      .then(() => setStatus('Saved sucessfully'))
      .finally(() => {
        setTimeout(() => setStatus(''), 3000)
      })
  }

  return (
    <SettingsView onSave={saveSettings} statusMessage={status}>
      <SimpleGrid>
        <TextInput
          label="Write Key"
          description="The Write Key can be found in the Javascript source page under Settings > API Key."
          onChange={(e) => setWriteKey(e.currentTarget.value)}
          value={writeKey || ''}
        />
      </SimpleGrid>
    </SettingsView>
  )
}

export default AppSettings