import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage Hook
 * Syncs state with localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)

        if (valueToStore === undefined) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }

        // Dispatch storage event for other tabs
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
            oldValue: storedValue ? JSON.stringify(storedValue) : null,
            storageArea: window.localStorage,
          })
        )
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Listen for storage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing storage value for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * useSessionStorage Hook
 * Similar to useLocalStorage but uses sessionStorage
 */
export const useSessionStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)

        if (valueToStore === undefined) {
          window.sessionStorage.removeItem(key)
        } else {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

/**
 * useStorageList Hook
 * Manage a list in localStorage
 */
export const useStorageList = (key, initialValue = []) => {
  const [list, setList] = useLocalStorage(key, initialValue)

  const add = useCallback(
    (item) => {
      setList(prev => {
        const newList = Array.isArray(prev) ? [...prev, item] : [item]
        return newList
      })
    },
    [setList]
  )

  const remove = useCallback(
    (itemOrIndex) => {
      setList(prev => {
        if (!Array.isArray(prev)) return prev
        if (typeof itemOrIndex === 'number') {
          return prev.filter((_, i) => i !== itemOrIndex)
        }
        return prev.filter(item => item !== itemOrIndex)
      })
    },
    [setList]
  )

  const update = useCallback(
    (index, newItem) => {
      setList(prev => {
        if (!Array.isArray(prev) || index < 0 || index >= prev.length) {
          return prev
        }
        const newList = [...prev]
        newList[index] = newItem
        return newList
      })
    },
    [setList]
  )

  const clear = useCallback(() => {
    setList([])
  }, [setList])

  return {
    list: Array.isArray(list) ? list : [],
    add,
    remove,
    update,
    clear,
    setList,
  }
}

/**
 * useStorageObject Hook
 * Manage an object in localStorage
 */
export const useStorageObject = (key, initialValue = {}) => {
  const [obj, setObj] = useLocalStorage(key, initialValue)

  const set = useCallback(
    (field, value) => {
      setObj(prev => ({
        ...(typeof prev === 'object' ? prev : {}),
        [field]: value,
      }))
    },
    [setObj]
  )

  const merge = useCallback(
    (updates) => {
      setObj(prev => ({
        ...(typeof prev === 'object' ? prev : {}),
        ...updates,
      }))
    },
    [setObj]
  )

  const remove = useCallback(
    (field) => {
      setObj(prev => {
        if (typeof prev !== 'object') return prev
        const newObj = { ...prev }
        delete newObj[field]
        return newObj
      })
    },
    [setObj]
  )

  const clear = useCallback(() => {
    setObj({})
  }, [setObj])

  return {
    obj: typeof obj === 'object' ? obj : {},
    set,
    merge,
    remove,
    clear,
    setObj,
  }
}