import React, { useState } from 'react'
import './Home.css'
import Header from '../../componenets/Header/Header'
import ExploreMenu from '../../componenets/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../componenets/FoodDisplay/FoodDisplay'
import AppDownload from '../../componenets/AppDownload/AppDownload'

const Home = () => {

const [category,setCategory]= useState("All")


  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
     <FoodDisplay category={category}/>
    <AppDownload/>
    </div>
  )
}

export default Home
