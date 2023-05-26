import { useState, useEffect, useRef } from "react";
import "./App.css";
import { wsSocket } from "./lib/socketConnect";
interface Messages {
  type: string;
  message: string;
}

interface ChatMessage extends Messages {
  userName: string;
  message: string;
  date: string;
  userColor: string;
}
type LogMessage = Messages;

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function App() {
  const [name, setName] = useState<any>(null);
  const [conn, setConn] = useState<any>(null);
  const [messages, setMessages] = useState<
    Array<ChatMessage> | Array<LogMessage>
  >([]);
  const [status, setStatus] = useState<any>("disconnected from ws server");
  const iRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const intializeChat = () => {
    const msg = iRef.current?.value.trim();
    if (!msg) {
      alert("Please enter a message");
      return;
    }
    conn.emit("chat message", {
      type: "chat",
      userName: name,
      userColor: localStorage.getItem("color"),
      message: msg,
    });
    iRef.current!.value = "";
  };

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (username) {
      setName(username);
      setConn(wsSocket.connect());
    }
  }, []);

  useEffect(() => {
    if (name) {
      const s = wsSocket.connect();
      s.on("connect_error", () => {
        setStatus("Reconnecting...");
      });

      s.on("connect", () => {
        s.emit("user action", {
          type: "log",
          message: `${name} has joined the chat!`,
        });
        setConn(s);
        setStatus("connected to web socket server");
      });

      s.on("disconnect", () => {
        s.emit("user action", {
          type: "log",
          message: `${name} has left the chat!`,
        });
        setStatus("disconnected, login to start chatting");
      });
    }

    if (conn) {
      conn.on("chat response", (res: ChatMessage | LogMessage) => {
        setMessages((prev) => [...prev, res]);
      });

      conn.on("new action response", (res: ChatMessage | LogMessage) => {
        if (
          res.type === "log" &&
          res.message === `${name} has joined the chat!`
        ) {
          setMessages((prev: any) => [
            ...prev,
            {
              ...res,
              message: `you have joined the chat!`,
            },
          ]);
          return;
        }
        setMessages((prev: any) => [...prev, res]);
      });
    }

    return () => {
      if (conn) {
        wsSocket.disconnect();
      }
    };
  }, [conn, name]);

  return (
    <div>
      <h3>{status}</h3>
      {name === null ? (
        <p
          style={{
            color: "red",
          }}
        >
          user is not logged in
        </p>
      ) : (
        <p
          style={{
            fontWeight: "bold",
          }}
        >
          logged in as{" "}
          <span
            style={{
              color: "green",
            }}
          >
            {name}
          </span>
        </p>
      )}
      <div>
        {!name && (
          <>
            <h3>What is your name?</h3>
            <input type="text" ref={nameRef} />
            <button
              style={{
                margin: "10px",
              }}
              onClick={(e) => {
                e.preventDefault();
                const username = nameRef.current?.value.trim().toLowerCase();
                if (!username) {
                  alert("Please enter a username");
                  return;
                }
                setName(username);
                localStorage.setItem("username", username as string);
                localStorage.setItem("color", getRandomColor());
              }}
            >
              Login
            </button>
          </>
        )}
      </div>
      <h1>Chat application</h1>
      <input
        type="text"
        name="chat"
        ref={iRef}
        style={{
          padding: "10px",
          backgroundColor: "#eee",
        }}
      />
      <button
        style={{
          padding: "10px",
          margin: "10px",
        }}
        onClick={(e) => {
          e.preventDefault();
          if (!name) {
            alert("Please login first");
            return;
          }

          if (status !== "connected to web socket server") {
            alert("Please wait for connection to be established");
            return;
          }
          intializeChat();
        }}
      >
        Send Message
      </button>
      <div>
        <h1>Messages:</h1>
        <ul>
          {messages.map((msg, idx: number) => {
            if (msg.type === "chat") {
              const { userName, message, date, userColor } = msg as ChatMessage;
              return (
                <p key={idx}>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      color: userColor,
                    }}
                  >
                    {userName}
                  </span>
                  :{" "}
                  <span
                    style={{
                      fontSize: "1.2rem",
                    }}
                  >
                    {message}{" "}
                    <span
                      style={{
                        color: "gray",
                        fontSize: "0.8rem",
                      }}
                    >
                      <i>{date}</i>
                    </span>
                  </span>
                </p>
              );
            } else if (msg.type === "log") {
              const { message } = msg as LogMessage;
             return ( <p
                key={idx}
                style={{
                  color: "gray",
                }}
              >
                {message}
              </p>)
            }
          })}
        </ul>
      </div>
    </div>
  );
}
export default App;
