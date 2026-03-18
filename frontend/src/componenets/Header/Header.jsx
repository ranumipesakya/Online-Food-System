import React from 'react'
import './Header.css'


const Header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <h2> Order Your Favourite food here</h2>
         <p>  Choose from a diverse meu featuring a delectable array of dishes crafted with the finest ingrediants and elevate your dining experience, one delicious meal at a time </p>
      <a href="#explore-menu">
        <button> View Menu</button>
      </a>
      </div>
    </div>
  )
}

export default Header
