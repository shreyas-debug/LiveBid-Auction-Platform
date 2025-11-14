import React, { createContext, useContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from './AuthContext';

const SignalRContext = createContext(null);

export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // 1. Add connected status
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.token) {
      const newConnection = new HubConnectionBuilder()
        .withUrl("http://localhost:5134/auctionHub", {
          accessTokenFactory: () => user.token
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      setConnection(newConnection);

      newConnection.start()
        .then(() => {
          console.log("SignalR Context: Connection Started!");
          setIsConnected(true); // 2. Set connected to true
        })
        .catch(e => console.error("SignalR Context: Connection Failed!", e));

      // 3. This cleanup runs when the component unmounts
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
    // 4. Provide both connection and status
    <SignalRContext.Provider value={{ connection, isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
};