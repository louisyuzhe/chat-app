import React, { useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
//Firebase SDK
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'; //Hooks

firebase.initializeApp({
  apiKey: "AIzaSyDDAVqqZTLk2amncPloG7XSSeozLeQsMPw",
  authDomain: "chat-app-yuzhe.firebaseapp.com",
  databaseURL: "https://chat-app-yuzhe.firebaseio.com",
  projectId: "chat-app-yuzhe",
  storageBucket: "chat-app-yuzhe.appspot.com",
  messagingSenderId: "220636570897",
  appId: "1:220636570897:web:175d67577b3d259db798b0",
  measurementId: "G-GZN99FDPDM"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  //if user not null, show chatroom, else show sign-in
  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat App</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section> 
    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  //ref a firestore collection
  const messagesRef = firestore.collection('messages');
  //query doc in a collection 
  const query = messagesRef.orderBy('createdAt').limit(25); 
  //use a hook to listen to data in real-time
  const [messages] = useCollectionData(query, {idField: 'id'});

  const[formValue, setFormValue] = useState(''); 

  //Write value to firebase
  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    //create new doc in firestore
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    //reset form value
    setFormValue('');
  }

  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">submit</button>
      </form>
    </>
  )
}

//Update firebase in real-time
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt={"Avatar"} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
