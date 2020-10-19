import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// firebase config
firebase.initializeApp({
  apiKey: "AIzaSyCpV2QUXbfy7tVZ2O9C21q_71Lb9Ijgym0",
  authDomain: "react-firebase-chat-43721.firebaseapp.com",
  databaseURL: "https://react-firebase-chat-43721.firebaseio.com",
  projectId: "react-firebase-chat-43721",
  storageBucket: "react-firebase-chat-43721.appspot.com",
  messagingSenderId: "1043048414957",
  appId: "1:1043048414957:web:7643dacf4c0da3132d16e4",
  measurementId: "G-C21JMNP1S5",
});

// declaring global variables
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (<button className='sign-out' onClick={() => auth.signOut()}>Sign Out</button>)
  );
}

function ChatRoom() {
  // reference a firestore collenction
  const messagesRef = firestore.collection("messages");

  // query documents in a collectionn
  const query = messagesRef.orderBy("createdAt").limit(25);

  // making dummy div to automaticly scroll down to latest msg
  const dummy = useRef();

  // listetning to the data with a hook
  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (event) => {
    // when form is submited it refreshes the page but with this trick it stop that from happenning
    event.preventDefault();

    // grabinng userID of current user
    const { uid, photoURL } = auth.currentUser;

    // creating new document in firebase
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // loop over each documennt
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(event) => setFormValue(event.target.value)}
          placeholder="Say something..."
        />
        <button type="submit" disabled={!formValue}>
          <span role="img" aria-label="sent">
            💌
          </span>
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL} />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
