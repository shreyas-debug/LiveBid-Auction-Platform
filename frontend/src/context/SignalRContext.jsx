import React, { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from './AuthContext';

const SignalRContext = createContext(null);
// Determine base URL dynamically
  const baseUrl = import.meta.env.VITE_API_URL || 'https://livebid-auction-platform-production.up.railway.app';
  const hubUrl = `${baseUrl}/auctionHub`;

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.token) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => user.token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      setConnection(newConnection);

      newConnection.start()
        .then(() => {
          console.log("SignalR Context: Connection Started!");
          setIsConnected(true);
        })
        .catch(e => console.error("SignalR Context: Connection Failed!", e));

      // This cleanup runs when the component unmounts
      return () => {
        console.log("SignalR Context: Stopping connection...");
        setIsConnected(false);
        newConnection.stop();
      };
    } else {
      // User logged out, clear connection
      if (connection) {
        connection.stop();
      }
      setConnection(null);
      setIsConnected(false);
    }
  }, [user]); // This effect runs when 'user' logs in/out

  return (
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};