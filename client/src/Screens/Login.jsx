import React, { useState } from 'react';
import authSvg from '../assests/login.svg';
import { ToastContainer, toast } from 'react-toastify';
import { authenticate, isAuth } from '../helpers/auth';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import  FacebookLogin  from 'react-facebook-login/dist/facebook-login-render-props';

const Login = ({history}) => {
  const [formData, setFormData] = useState({
    email: "",
    password1: "",
    textChange: 'Sign In'
  })

  const { email, password1, textChange } = formData;
  // Handle change from inputs
  const handleChange = text => e => {
    setFormData({...formData, [text]: e.target.value })
  }

  // send facebook token 
  const sendFacebookToken = (userID, accessToken) => {
    axios.post(`${process.env.REACT_APP_API_URL}/facebooklogin`, {
      userID, accessToken
    }).then(res => {
      console.log(res.data)
      informParent(res)
    }).catch(err => {
      toast.error('Facebook Auth error');
    })
  }

  // send google token 
  const sendGoogleToken = tokenId => {
    axios
    .post(`${process.env.REACT_APP_API_URL}/googlelogin`, {
      idToken: tokenId
    })
    .then(res => {
      informParent(res)
    })
    .catch(err => {
      toast.error(`google login error`)
    })
  }

  // If success we need to authenticate user and redirect 
  const informParent = response => {
    authenticate(response, () => {
      isAuth() && isAuth.role === 'admin' 
      ? history.push('/admin') 
      : history.push('/private')
    })
  };

  // Get reponse from google 
  const responseGoogle = response => {
    sendGoogleToken(response.tokenId)
  }

  // Get response from facebook 
  const responseFacebook = response => {
    console.log(response)
    sendFacebookToken(response.userID, response.accessToken);
  }


  // Submit data to backend
  const handleSubmit = e => {
    console.log(process.env.REACT_APP_API_URL);
    e.preventDefault();

    if(email && password1) {
      setFormData({...formData, textChange: 'Submitting' });
      axios
      .post(`${process.env.REACT_APP_API_URL}/login`, {
        email,
        password: password1
      })
      .then(res => {
        authenticate(res, () => {
          setFormData({
            ...formData,
            email: "",
            password1: "",
            textChange: "Submitted", 
          });
        })

        // If authenticate but not admin redirect to /private 
        // if admin redirect to /admin
        isAuth() && isAuth().role === 'admin'
        ? history.push('/admin')
        : history.push('/private');
        toast.success(`Hey ${res.data.user.name}, Welcome back!`)
      })
      .catch(err => {
        setFormData({
          ...formData,
          email: "",
          password1: "",
          textChange: "Sign In"
        });
        console.log(err.response);
        toast.error(err.response.data.errors);
      })
    } else {
      toast.error('Please fill all fields');
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
      {isAuth() ? <Redirect to='/'/> : null}
      <ToastContainer />
      <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
        <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
          <div className='mt-12 flex flex-col items-center'>
            <h1 className='text-2xl xl:text-3xl font-extrabold'>
              Sign Up for Congar
            </h1>
            <form 
            className='w-full flex-1 mt-8 text-indigo-500'
            onSubmit={handleSubmit}>
              <div className='mx-auto max-w-xs relative '>
                <input 
                type='email'
                placeholder='Email'
                onChange={handleChange('email')}
                value={email}
                className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                />
                <input 
                type='password'
                placeholder='Password'
                onChange={handleChange('password1')}
                value={password1}
                className='w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5'
                />
                <button 
                type='submit'
                className='mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none'
                >
                  Sign In
                </button>
                <a 
                  href='/users/password/forget'
                  className='no-underline hover:underline text-indigo-500 text-md text-right absolute right-0 mt-2'
                >
                  Forget password?
                </a>
              </div>  
              <div className='my-12 border-b text-center'>
                <div className='leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2'>
                  Or sign Up
                </div>
              </div>

              <div className='flex flex-col items-center'>
              <GoogleLogin
                  clientId={`${process.env.REACT_APP_GOOGLE_CLIENT}`}
                  onSuccess={ responseGoogle }
                  onFailure={ responseGoogle }
                  cookiePolicy={'single_host_origin'}
                  render={renderProps => (
                    <button
                    onClick={renderProps.onClick}
                    disabled={ renderProps.disabled }
                    className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 
                    bg-indigo-100 text-gray-800 flex items-center justify-center transition-all 
                    duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline'
                    >
                      <div className=' p-2 rounded-full '>
                        <i className='fab fa-google ' />
                      </div>
                      <span className='ml-4'>Sign In with Google</span>
                    </button>
                  )}
                >
                </GoogleLogin>
                <FacebookLogin
                  appId={`${process.env.REACT_APP_FACEBOOK_CLIENT}`}  // this facebook app id 
                  autoLoad={false} // if true when open login page it will go to login with facebook and we won't to do this 
                  callback={responseFacebook}
                  render={renderProps => (
                    <button
                    onClick={renderProps.onClick}
                    className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
                    >
                      <div className=' p-2 rounded-full '>
                        <i className='fab fa-facebook' />
                      </div>
                      <span className='ml-4'>Sign In with Facebook</span>
                    </button>
                  )}
                >
                </FacebookLogin>

                <a
                href='/register'
                className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3
                          bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
                >Sign Up
                </a>
                
              </div>
            </form>
          </div>
        </div>
        <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
          <div className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
              style={{backgroundImage: `url(${authSvg})`}}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Login
