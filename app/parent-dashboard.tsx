'use client'
import React, { useState, useRef, useEffect } from 'react'
import ParentDashboard from '../src/components/ParentDashboard'
import ParentLockScreen from '../src/components/ParentLockScreen'

const AUTO_LOCK_TIMEOUT = 2 * 60 * 1000 // 2 minutes

const ParentDashboardScreen = () => {
  const [unlocked, setUnlocked] = useState(false)
  // Use browser timeout ID (number) in client code
  const lockTimer = useRef<number | null>(null)

  // Reset auto-lock timer on interaction
  const resetLockTimer = () => {
    if (lockTimer.current) clearTimeout(lockTimer.current)
    // Use window.setTimeout to get a number ID
    lockTimer.current = window.setTimeout(() => {
      setUnlocked(false)
    }, AUTO_LOCK_TIMEOUT)
  }

  useEffect(() => {
    if (unlocked) {
      resetLockTimer()
      const handleActivity = () => resetLockTimer()
      window.addEventListener('touchstart', handleActivity)
      window.addEventListener('mousedown', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('scroll', handleActivity)
      return () => {
        if (lockTimer.current !== null) {
          clearTimeout(lockTimer.current)
        }
        window.removeEventListener('touchstart', handleActivity)
        window.removeEventListener('mousedown', handleActivity)
        window.removeEventListener('keydown', handleActivity)
        window.removeEventListener('scroll', handleActivity)
      }
    }
  }, [unlocked])

  return unlocked ? (
    <ParentDashboard />
  ) : (
    <ParentLockScreen onUnlock={() => setUnlocked(true)} />
  )
}

export default ParentDashboardScreen
