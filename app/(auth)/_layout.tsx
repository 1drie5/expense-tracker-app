import { useAuth } from "@clerk/expo";
import { Stack, Redirect } from 'expo-router'
import React from 'react'

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth()
    if(!isLoaded) {
      return null
    }
    if(isSignedIn) {
      return <Redirect href="/" />;
    }
  return <Stack screenOptions={{ headerShown: false }}/>
}