import React from 'react'
import OrgChart from './pages/OrgChart'

export default function App() {
  return (
    <>
      {/* Liquid background effect */}
      <div className="liquid-wrapper">
        <div className="liquid-orb orb-1"></div>
        <div className="liquid-orb orb-2"></div>
        <div className="liquid-orb orb-3"></div>
        <div className="liquid-orb orb-4"></div>
      </div>
      
      <div className="grid-bg"></div>
      
      <div className="page-wrapper">
        <OrgChart />
      </div>
    </>
  )
}
