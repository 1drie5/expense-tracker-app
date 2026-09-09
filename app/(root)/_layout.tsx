import { useAuth } from "@clerk/expo";
import { Slot, Redirect } from 'expo-router'

export default function RootGroupLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  if(!isLoaded) return null
  if(isSignedIn) return <Redirect href="/sign-in" />;
  return <Slot />;
}