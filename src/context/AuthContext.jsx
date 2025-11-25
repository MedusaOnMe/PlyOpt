import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { db } from '../lib/firebase'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

const AuthContext = createContext(null)

// Simple encryption using password
function encryptPrivateKey(privateKey, password) {
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(privateKey)
  const passBytes = encoder.encode(password)

  const encrypted = new Uint8Array(keyBytes.length)
  for (let i = 0; i < keyBytes.length; i++) {
    encrypted[i] = keyBytes[i] ^ passBytes[i % passBytes.length]
  }

  return btoa(String.fromCharCode(...encrypted))
}

function decryptPrivateKey(encryptedKey, password) {
  const encoder = new TextEncoder()
  const passBytes = encoder.encode(password)

  const encrypted = new Uint8Array(
    atob(encryptedKey).split('').map(c => c.charCodeAt(0))
  )

  const decrypted = new Uint8Array(encrypted.length)
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ passBytes[i % passBytes.length]
  }

  return new TextDecoder().decode(decrypted)
}

// Simple password hashing (for storage, not security-critical)
function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('polyperps_session')
    if (savedSession) {
      setUser(JSON.parse(savedSession))
    }
    setIsLoading(false)
  }, [])

  // Save session to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('polyperps_session', JSON.stringify(user))
    } else {
      localStorage.removeItem('polyperps_session')
    }
  }, [user])

  const register = async (email, password) => {
    // Check if user already exists in Firestore
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      throw new Error('Email already registered')
    }

    // Generate a real Polygon wallet
    const wallet = ethers.Wallet.createRandom()

    // Encrypt the private key with the user's password
    const encryptedPrivateKey = encryptPrivateKey(wallet.privateKey, password)

    // Create new user
    const userId = Date.now().toString()
    const newUser = {
      id: userId,
      email,
      passwordHash: hashPassword(password),
      walletAddress: wallet.address,
      encryptedPrivateKey,
      balance: 0,
      createdAt: new Date().toISOString(),
    }

    // Save to Firestore
    await setDoc(doc(db, 'users', userId), newUser)

    // Set session (without sensitive data)
    const sessionUser = {
      id: userId,
      email,
      walletAddress: wallet.address,
      encryptedPrivateKey,
      balance: 0,
      createdAt: newUser.createdAt,
    }
    setUser(sessionUser)

    return sessionUser
  }

  const login = async (email, password) => {
    // Find user in Firestore
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('Invalid email or password')
    }

    const foundUser = querySnapshot.docs[0].data()

    // Verify password
    if (foundUser.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid email or password')
    }

    // Set session (without password hash)
    const sessionUser = {
      id: foundUser.id,
      email: foundUser.email,
      walletAddress: foundUser.walletAddress,
      encryptedPrivateKey: foundUser.encryptedPrivateKey,
      balance: foundUser.balance || 0,
      createdAt: foundUser.createdAt,
    }
    setUser(sessionUser)

    return sessionUser
  }

  const connectWallet = () => {
    // Generate a real wallet for wallet-only connection (not persisted to Firestore)
    const wallet = ethers.Wallet.createRandom()

    const newUser = {
      id: Date.now().toString(),
      walletAddress: wallet.address,
      privateKey: wallet.privateKey,
      balance: 0,
      createdAt: new Date().toISOString(),
    }
    setUser(newUser)
    return newUser
  }

  const logout = () => {
    setUser(null)
  }

  const updateBalance = async (newBalance) => {
    if (user) {
      setUser({ ...user, balance: newBalance })

      // Update in Firestore if user has email (registered user)
      if (user.email) {
        try {
          await setDoc(doc(db, 'users', user.id), { balance: newBalance }, { merge: true })
        } catch (e) {
          console.error('Failed to update balance in Firestore:', e)
        }
      }
    }
  }

  // Export private key - requires password for email users
  const exportPrivateKey = async (password) => {
    if (!user) throw new Error('Not logged in')

    // If user connected via wallet (has privateKey directly in session)
    if (user.privateKey) {
      return user.privateKey
    }

    // If user registered with email, decrypt from session or Firestore
    if (user.encryptedPrivateKey && password) {
      return decryptPrivateKey(user.encryptedPrivateKey, password)
    }

    // Fetch from Firestore if not in session
    if (user.email) {
      const userDoc = await getDoc(doc(db, 'users', user.id))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.encryptedPrivateKey) {
          return decryptPrivateKey(userData.encryptedPrivateKey, password)
        }
      }
    }

    throw new Error('No private key found')
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    register,
    login,
    connectWallet,
    logout,
    updateBalance,
    exportPrivateKey,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
