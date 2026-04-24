import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { Outlet } from 'react-router-dom'

const DefaultLayout = ({ userInfo }) => {
  return (
    <div className="wrapper d-flex flex-column min-vh-100">
      {/* 1. 메뉴판(_nav)을 가져다 그리는 곳 */}
      <AppSidebar />
      
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <Outlet context={[userInfo]} />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout