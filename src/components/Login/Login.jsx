import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";


import React, { useEffect, useRef, useState } from "react";
import { auth } from "../../Firebase/firebase-config";
import { createnewuser, existenceemaillpassword, getmemberid, getuseremail } from "./LoginConditional";
import "./login.css";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const navigate = useNavigate();


  const [user, setUser] = useState({});
  const [pagechange, setPageChange] = useState(1);

  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    console.log('user', user);
  })
  //set true false condition listen user state 

  const register = async () => {
    try {
      const userdata = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      console.log(userdata);
      localStorage.setItem("email", userdata.user.email);
      localStorage.setItem("name", userdata.user.displayName);
      localStorage.setItem("profileURL", user.user.photoURL);

      setRegisterEmail("")
      setRegisterPassword("")
      navigate("/")


    } catch (error) {




      alert(error.message)
      console.log(error.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {

      await existenceemaillpassword(loginEmail, loginPassword);

      const user = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      const useremail = await getuseremail(loginEmail);

      console.log("loginfn", useremail);

      // if (loginEmail === queryemailresult) {
      //   alert("已經重複囉")
      // }






      console.log(user.user.email);




      setLoginEmail("")
      setLoginPassword("")
      localStorage.setItem("email", user.user.email);
      localStorage.setItem("name", user.user.displayName);

      if (user.user.photoURL == null) {
        localStorage.setItem("profileURL", "./img/3.jpg")
      } else {
        localStorage.setItem("profileURL", user.user.photoURL);
      }




      navigate("/");

      alert("Welcome")


    } catch (error) {
      // if (testemail === loginEmail && !!loginPassword === !!null) {
      //   alert('密碼錯誤')
      // }
      //alert("該帳號不存在")
      console.log("loginfn,errormessage", error.message);
    }
  };



  const handlePageChange = (index) => {
    setPageChange(index);
  };

  const singInWithGoogle = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then(async (res) => {

        const currentuseremail = res.user.email;
        const currentusername = res.user.displayName;
        const currentuserprofileURL = res.user.photoURL;
        const existenceemail = await getuseremail(currentuseremail)
        // console.log(currentuseremail);
        // console.log(existenceemail);
        // console.log(currentuseremail === existenceemail);
        // console.log(currentusername, currentuserprofileURL);

        if (currentuseremail !== existenceemail) {
          await createnewuser(currentuseremail, currentusername, currentuserprofileURL);
        }
        const memberid = await getmemberid(currentuseremail);
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("name", res.user.displayName);
        localStorage.setItem("profileURL", res.user.photoURL);
        localStorage.setItem("memberid", memberid);
        //console.log(window.localStorage.memberid);
        window.location.href = "/";
      })
      .catch((error) => {
        console.log("login-error:", error);
      });
  };

  return (

    <div className="login-backgroundimg" >

      {pagechange === 1 ? (<div className="login">


        <div className="login-div">
          <div className="login-logo"></div>
          <div className="login-title">
            <p className="login-p" onClick={() => handlePageChange(2)}>
              登入&emsp;
            </p>{" "}
            | <p style={{ color: 'darkblue', transition: 'all 1s' }} className="login-p" onClick={() => handlePageChange(1)}>&emsp;註冊</p>
          </div>
          <div className="sub-title">Join Us</div>
          <div className="login-fields">
            <div className="login-username">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path d="M12.075,10.812c1.358-0.853,2.242-2.507,2.242-4.037c0-2.181-1.795-4.618-4.198-4.618S5.921,4.594,5.921,6.775c0,1.53,0.884,3.185,2.242,4.037c-3.222,0.865-5.6,3.807-5.6,7.298c0,0.23,0.189,0.42,0.42,0.42h14.273c0.23,0,0.42-0.189,0.42-0.42C17.676,14.619,15.297,11.677,12.075,10.812 M6.761,6.775c0-2.162,1.773-3.778,3.358-3.778s3.359,1.616,3.359,3.778c0,2.162-1.774,3.778-3.359,3.778S6.761,8.937,6.761,6.775 M3.415,17.69c0.218-3.51,3.142-6.297,6.704-6.297c3.562,0,6.486,2.787,6.705,6.297H3.415z"></path>
              </svg>
              <input
                type="text"
                className="login-user-input"
                placeholder="輸入信箱..."

                required
                onChange={(event) => {
                  setRegisterEmail(event.target.value);
                }}
              />
            </div>
            <div className="login-password">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path d="M17.308,7.564h-1.993c0-2.929-2.385-5.314-5.314-5.314S4.686,4.635,4.686,7.564H2.693c-0.244,0-0.443,0.2-0.443,0.443v9.3c0,0.243,0.199,0.442,0.443,0.442h14.615c0.243,0,0.442-0.199,0.442-0.442v-9.3C17.75,7.764,17.551,7.564,17.308,7.564 M10,3.136c2.442,0,4.43,1.986,4.43,4.428H5.571C5.571,5.122,7.558,3.136,10,3.136 M16.865,16.864H3.136V8.45h13.729V16.864z M10,10.664c-0.854,0-1.55,0.696-1.55,1.551c0,0.699,0.467,1.292,1.107,1.485v0.95c0,0.243,0.2,0.442,0.443,0.442s0.443-0.199,0.443-0.442V13.7c0.64-0.193,1.106-0.786,1.106-1.485C11.55,11.36,10.854,10.664,10,10.664 M10,12.878c-0.366,0-0.664-0.298-0.664-0.663c0-0.366,0.298-0.665,0.664-0.665c0.365,0,0.664,0.299,0.664,0.665C10.664,12.58,10.365,12.878,10,12.878"></path>
              </svg>
              <input
                type="password"
                className="login-pass-input"

                placeholder="輸入密碼..."

                onChange={(event) => {
                  setRegisterPassword(event.target.value);
                }}
              />
            </div>
          </div>
          <button onClick={register} className="login-sigin-button">
            註冊
          </button>
          <br />

          <br />

          <button
            onClick={singInWithGoogle}
            type="button"
            className="login-with-google-btn"
          >
            Sign in with Google
          </button>
        </div>
      </div>) : (<div className='login'>

        <div className="login-div">
          <div className="login-logo"></div>
          <div className="login-title">
            <p style={{ color: 'darkblue', transition: 'all 1s' }} className="login-p" onClick={() => handlePageChange(2)}>
              登入&emsp;
            </p>{" "}
            | <p className="login-p" onClick={() => handlePageChange(1)}>&emsp;註冊</p>
          </div>
          <div className="sub-title">Join Us</div>
          <div className="login-fields">
            {/* login-username */}
            <div className="login-username">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path d="M12.075,10.812c1.358-0.853,2.242-2.507,2.242-4.037c0-2.181-1.795-4.618-4.198-4.618S5.921,4.594,5.921,6.775c0,1.53,0.884,3.185,2.242,4.037c-3.222,0.865-5.6,3.807-5.6,7.298c0,0.23,0.189,0.42,0.42,0.42h14.273c0.23,0,0.42-0.189,0.42-0.42C17.676,14.619,15.297,11.677,12.075,10.812 M6.761,6.775c0-2.162,1.773-3.778,3.358-3.778s3.359,1.616,3.359,3.778c0,2.162-1.774,3.778-3.359,3.778S6.761,8.937,6.761,6.775 M3.415,17.69c0.218-3.51,3.142-6.297,6.704-6.297c3.562,0,6.486,2.787,6.705,6.297H3.415z"></path>
              </svg>
              <input type="email"
                className='login-user-input'
                placeholder='輸入信箱...'
                value={loginEmail}
                onChange={(event) => {
                  setLoginEmail(event.target.value);
                }} />
              {/*login-password  */}
            </div>
            <div className="login-password">
              <svg className="svg-icon" viewBox="0 0 20 20">
                <path d="M17.308,7.564h-1.993c0-2.929-2.385-5.314-5.314-5.314S4.686,4.635,4.686,7.564H2.693c-0.244,0-0.443,0.2-0.443,0.443v9.3c0,0.243,0.199,0.442,0.443,0.442h14.615c0.243,0,0.442-0.199,0.442-0.442v-9.3C17.75,7.764,17.551,7.564,17.308,7.564 M10,3.136c2.442,0,4.43,1.986,4.43,4.428H5.571C5.571,5.122,7.558,3.136,10,3.136 M16.865,16.864H3.136V8.45h13.729V16.864z M10,10.664c-0.854,0-1.55,0.696-1.55,1.551c0,0.699,0.467,1.292,1.107,1.485v0.95c0,0.243,0.2,0.442,0.443,0.442s0.443-0.199,0.443-0.442V13.7c0.64-0.193,1.106-0.786,1.106-1.485C11.55,11.36,10.854,10.664,10,10.664 M10,12.878c-0.366,0-0.664-0.298-0.664-0.663c0-0.366,0.298-0.665,0.664-0.665c0.365,0,0.664,0.299,0.664,0.665C10.664,12.58,10.365,12.878,10,12.878"></path>
              </svg>
              <input
                type="password"
                className='login-pass-input'
                placeholder='輸入密碼...'
                value={loginPassword}
                onChange={(event) => {
                  setLoginPassword(event.target.value);
                }} />
            </div>
          </div>
          <button onClick={login} className='login-sigin-button'>登入</button>
          <br />

          <br />

          <button onClick={singInWithGoogle} type="button" className="login-with-google-btn" >
            Sign in with Google
          </button>

        </div>

      </div>)}
    </div>

  );
};



export default Login;
